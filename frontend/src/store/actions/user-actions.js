import { GetData, PostData } from "../../utils";
import { userLogin, userSignup, userProfile } from "../user-slice"; // Import actions từ slice

export const SetAuthToken = async (token) => {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.clear();
  }
};

export const onSignup =
  ({ email, password, phone }) =>
  async (dispatch) => {
    try {
      const response = await PostData("/customer/signup", { 
        email,
        password,
        phone,
      });
      const { token } = response.data;
      await SetAuthToken(token);
      return dispatch(userSignup(response.data)); 
    } catch (err) {
      console.log(err);
    }
  };

export const onLogin =
  ({ email, password }) =>
  async (dispatch) => {
    try {
      const response = await PostData("/customer/login", { 
        email,
        password,
      });

      const { token } = response.data;
      await SetAuthToken(token);
      return dispatch(userLogin(response.data)); 
    } catch (err) {
      console.log(err);
    }
  };

export const onViewProfile = () => async (dispatch) => {
  try {
    const response = await GetData("/customer/profile"); 

    return dispatch(userProfile(response.data)); 
  } catch (err) {
    console.log(err);
  }
};