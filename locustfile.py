from locust import HttpUser, SequentialTaskSet, task, between
import os, random, string

# -----------------------------
# Config qua biến môi trường
# -----------------------------
BASE = os.getenv("BASE", "http://localhost:8080").rstrip("/")

CUS_EMAIL = os.getenv("CUS_EMAIL", "test4@test.com")
CUS_PASSWORD = os.getenv("CUS_PASSWORD", "12345")

EXAMPLE_PRODUCT_ID = os.getenv("PRODUCT_ID", "691b2ff64260ba49fb35ae9e")
EXAMPLE_BODY_WISHLIST = {"_id": os.getenv("WISHLIST_ID", "691b2ff64260ba49fb35ae9e")}
EXAMPLE_BODY_CART_ADD = {"_id": os.getenv("CART_PRODUCT_ID", "691b2ff64260ba49fb35ae9e"), "qty": 3}
EXAMPLE_CART_DELETE_ID = os.getenv("CART_DELETE_ID", "691b2ff64260ba49fb35ae9e")
CATEGORY = os.getenv("CATEGORY", "fruits")

# Cho phép bật/tắt tạo tài khoản mới cho mỗi user
SIGNUP_PER_USER = os.getenv("SIGNUP_PER_USER", "true").lower() in ("1", "true", "yes")


def rand_email(prefix="load"):
    tail = ''.join(random.choices(string.ascii_lowercase + string.digits, k=10))
    return f"{prefix}_{tail}@example.com"


class ScenarioFlow(SequentialTaskSet):
    """
    Mỗi Virtual User sẽ chạy các task theo thứ tự được định nghĩa.
    on_start() đảm bảo bắt buộc: Signup (nếu bật) -> Login -> set JWT headers.
    """

    def on_start(self):
        # Tránh signup/login lặp lại khi flow lặp vòng
        if getattr(self.user, "_did_auth", False):
            return

        self.user.jwt_token = None
        self.user.auth_headers = {}

        email_to_use = CUS_EMAIL
        password_to_use = CUS_PASSWORD

        # 1) Signup tài khoản mới (tùy chọn)
        if SIGNUP_PER_USER:
            email_to_use = rand_email("user")
            password_to_use = "12345"
            payload_signup = {"email": email_to_use, "password": password_to_use, "phone": "0900000000"}
            with self.client.post(
                "/customer/signup",
                json=payload_signup,
                name="Customer: Signup (once/user)",
                catch_response=True
            ) as resp:
                # Nếu trùng email hoặc backend trả lỗi khác, ta vẫn tiếp tục bước login bằng email mặc định
                if resp.status_code in (200, 201):
                    resp.success()
                else:
                    # fallback dùng tài khoản có sẵn trong env
                    email_to_use = CUS_EMAIL
                    password_to_use = CUS_PASSWORD
                    resp.success()  # không fail test, để tiếp tục login

        # 2) Login
        payload_login = {"email": email_to_use, "password": password_to_use}
        with self.client.post(
            "/customer/login",
            json=payload_login,
            name="Customer: Login (mandatory)",
            catch_response=True
        ) as resp:
            try:
                data = resp.json()
                token = data.get("token") or (data.get("data") or {}).get("token")
                if token:
                    self.user.jwt_token = token
                    self.user.auth_headers = {
                        "Authorization": f"Bearer {self.user.jwt_token}",
                        "Content-Type": "application/json",
                    }
                    self.user._did_auth = True
                    resp.success()
                else:
                    resp.failure("JWT not found in login response")
            except Exception:
                resp.failure("Login failed: invalid JSON response")

    # ---------------------
    # Public endpoints
    # ---------------------
    @task
    def products_list(self):
        self.client.get("/", name="Products: List")

    @task
    def products_category(self):
        self.client.get(f"/category/{CATEGORY}", name="Products: Category")

    @task
    def product_details(self):
        self.client.get(f"/{EXAMPLE_PRODUCT_ID}", name="Products: Details")

    # ---------------------
    # Protected endpoints (yêu cầu JWT)
    # ---------------------
    @task
    def customer_profile(self):
        self.client.get("/customer/profile", headers=self.user.auth_headers, name="Customer: Profile")

    @task
    def customer_wishlist_get(self):
        self.client.get("/customer/wishlist", headers=self.user.auth_headers, name="Customer: Wishlist")

    @task
    def customer_wishlist_add(self):
        self.client.put("/wishlist", json=EXAMPLE_BODY_WISHLIST, headers=self.user.auth_headers, name="Products: Add Wishlist")

    @task
    def cart_add(self):
        self.client.put("/cart", json=EXAMPLE_BODY_CART_ADD, headers=self.user.auth_headers, name="Products: Add Cart")

    @task
    def cart_remove(self):
        self.client.delete(f"/cart/{EXAMPLE_CART_DELETE_ID}", headers=self.user.auth_headers, name="Products: Delete Cart")

    @task
    def shopping_cart(self):
        self.client.get("/shopping/cart", headers=self.user.auth_headers, name="Shopping: Cart")

    @task
    def shopping_orders(self):
        self.client.get("/shopping/orders", headers=self.user.auth_headers, name="Shopping: Orders")

    @task
    def shopping_create_order(self):
        self.client.post("/shopping/order", json={"txnId": "abc123"}, headers=self.user.auth_headers, name="Shopping: Create Order")


class EcommerceUser(HttpUser):
    # Tất cả request sẽ đi qua BASE (Nginx:8080)
    host = BASE
    wait_time = between(0.5, 2.0)

    # Trạng thái auth dùng chung trong vòng đời 1 user
    jwt_token = None
    auth_headers = {}

    tasks = [ScenarioFlow]
