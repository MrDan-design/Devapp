import axios from "axios";

const userApi = axios.create({
    baseURL: "http://localhost:5000/api",
});

userApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("userToken");
    if (token) {
        config.headers.authorization = `Bearer ${token}`;
    }
    return config;
});

export default userApi;