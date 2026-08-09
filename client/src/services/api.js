import axios from "axios";

const getBaseURL = () => {
  return "https://infynest-backend.onrender.com/api/v1";
};

export const getImageUrl = (image) => {
  if (!image) {
    return "https://via.placeholder.com/150";
  }

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  const baseURL = getBaseURL().replace("/api/v1", "");

  return `${baseURL}${image.startsWith("/") ? image : `/${image}`}`;
};

const API = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

API.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem("userInfo");

    if (userInfo) {
      try {
        const { token } = JSON.parse(userInfo);

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Invalid userInfo:", error);
      }
    }

    return config; 
  },
  (error) => Promise.reject(error)
);

export default API;