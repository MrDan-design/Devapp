import axios from "axios";

const userApi = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}`,
});

userApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.authorization = `Bearer ${token}`;
    }
    return config;
});

export default userApi;