# ✅ Dùng Node 20 LTS (ổn định, tương thích tốt với các thư viện cũ)
FROM node:20

# Đặt thư mục làm việc bên trong container
WORKDIR /app/customer

# Copy file khai báo dependencies trước (để tận dụng cache Docker)
COPY package*.json ./

# Cài đặt dependencies (không dùng node_modules từ host)
RUN npm install --omit=dev

# Copy toàn bộ mã nguồn của project vào container
COPY . .

# Mở cổng mà service customer sẽ chạy (ở đây là 8001)
EXPOSE 8001

# Lệnh khởi động app
CMD ["node", "-r", "./src/tracing.js", "src/index.js"]
