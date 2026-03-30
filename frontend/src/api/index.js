import axios from "axios";


// ✅ Base URLs
const LOCAL_URL = "http://localhost:5000/api";
const PROD_URL = "https://hr-management-2-61ek.onrender.com/api";

// ✅ Determine if running locally
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// ✅ Axios instance
const api = axios.create({
    baseURL: isLocal ? LOCAL_URL : PROD_URL,
    timeout: 30000, // ⏳ wait 30 seconds (Render wake-up time)
});

// ✅ Request interceptor (Token attach)
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

// ✅ Response interceptor (Better error handling)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!error.response) {
            console.error("🚨 Network Error: Backend might be sleeping or unreachable");
            alert("Server waking up... Please wait 20 seconds and try again.");
        } else {
            console.error("API Error:", error.response.data);
        }

        return Promise.reject(error);
    }
);

export default api;