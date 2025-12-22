import axios from "axios";

const API = axios.create({
  // Backend chạy ở port 5000 và có prefix /api
  baseURL: "http://localhost:5000/api",
});

// Tự động gắn token vào header cho mọi request
API.interceptors.request.use((req) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user?.token) {
    req.headers.Authorization = `Bearer ${user.token}`;
  }

  return req;
});

export default API;