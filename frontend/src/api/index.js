import axios from "axios";


// ✅ Base URLs
const LOCAL_URL = "http://localhost:5000/api";
const PROD_URL = "https://hr-management-2-61ek.onrender.com/api";

// ✅ Determine if running locally
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// ✅ Axios instance
const api = axios.create({
    baseURL: isLocal ? LOCAL_URL : PROD_URL,
    timeout: 120000, // ⏳ wait 60 seconds (Render wake-up time can be long)
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
            console.error("🚨 Network Error: Backend might be sleeping or unreachable", error.message);
            // Only alert once to avoid spamming the user
            if (!window.hasAlertedNetworkError) {
                alert("Server is waking up (Render Free Tier)... Please wait 30-60 seconds and try again.");
                window.hasAlertedNetworkError = true;
                setTimeout(() => { window.hasAlertedNetworkError = false; }, 30000); // Reset after 30s
            }
        } else {
            console.error("API Error Response:", error.response.status, error.response.data);
        }

        return Promise.reject(error);
    }
);

export default api;