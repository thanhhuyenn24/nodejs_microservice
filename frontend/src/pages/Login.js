import React, { useReducer, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { onSignup, onLogin, onViewProfile } from "../store/actions";
import { AddressComponent } from "../components/Address-comp";
import { Profile } from "./Profile";
import { useAppDispatch, useAppSelector } from "../store/hooks";

//load Shopping profile
const Login = () => {
  const { user, profile } = useAppSelector((state) => state.userReducer);

  const dispatch = useAppDispatch();

  const { id, token } = user;

  const { address, whishlist, orders } = profile;

  const [isSignup, setSignup] = useState(false);

  // State cho Login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // --- State cho Signup ---
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [phone, setPhone] = useState(""); // Action onSignup của bạn cần 'phone'

  useEffect(() => {
    if (token) {
      dispatch(onViewProfile());
    }
    // Sửa lỗi ESLint 'exhaustive-deps' bằng cách thêm dispatch
  }, [token, dispatch]); 

  // --- Sửa hàm userSignup để gửi data ---
  const userSignup = () => {
    // Gửi dữ liệu từ state của signup
    dispatch(onSignup({ email: signupEmail, password: signupPassword, phone: phone }));
  };

  const userLogin = () => {
    dispatch(onLogin({ email, password }));
  };

  // Form đăng nhập
  const loginForm = () => {
    return (
      <div
        className="row bg-secondary"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "30rem",
        }}
      >
        <div className="col col-sm-5 col-md-4 col-lg-3 col-xl-2">
          <form>
            <div className="from-group">
              <label>Email address</label>
              <input
                className="form-control"
                type="email"
                placeholder="Enter email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="from-group">
              <label>Password</label>
              <input
                className="form-control"
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="row m-2 float-right">
              <button
                className="btn btn-primary mr-2 "
                onClick={() => userLogin()}
                type="button"
              >
                Login
              </button>
              <button 
                className="btn btn-primary" 
                type="button"
                onClick={() => setSignup(true)}
              >
                Signup
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // --- Sửa hàm signUpForm để hiển thị form đăng ký ---
  const signUpForm = () => {
    return (
      <div
        className="row bg-secondary"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "30rem",
        }}
      >
        <div className="col col-sm-5 col-md-4 col-lg-3 col-xl-2">
          <h1>Signup</h1>
          <form>
            <div className="from-group">
              <label>Email address</label>
              <input
                className="form-control"
                type="email"
                placeholder="Enter email"
                onChange={(e) => setSignupEmail(e.target.value)}
              />
            </div>
            <div className="from-group">
              <label>Password</label>
              <input
                className="form-control"
                type="password"
                placeholder="Password"
                onChange={(e) => setSignupPassword(e.target.value)}
              />
            </div>
            <div className="from-group">
              <label>Phone</label>
              <input
                className="form-control"
                type="text"
                placeholder="Phone"
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="row m-2 float-right">
              <button
                className="btn btn-primary mr-2"
                type="button"
                onClick={() => userSignup()}
              >
                Register
              </button>
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => setSignup(false)} // Nút quay lại Login
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Logic render chính
  if (token) {
    return <Profile />;
  } else {
    return (
      <div className="container-fluid">
        {isSignup ? signUpForm() : loginForm()}
      </div>
    );
  }
};

export { Login };