import axios from "axios";

// ✅ Backend base URL (Render)
const api = axios.create({
    baseURL: "https://hr-management-2-61ok.onrender.com/api",
});

// ✅ Token interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default api;