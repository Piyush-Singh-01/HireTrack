import axios from "axios";

export const DEFAULT_BASE_URL ="https://hiretrack-v085.onrender.com" || "http://localhost:5000";

export const axiosInstance = axios.create({
    baseURL: DEFAULT_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    // Default to no credentials to avoid CORS wildcard+credentials conflict.
    withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers["Authorization"] = "Bearer " + token;
                        return axiosInstance(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem("refreshToken");
            if (!refreshToken) {
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("user");
                window.location.href = "/";
                return Promise.reject(error);
            }

            try {
                const response = await axios.post(
                    `${DEFAULT_BASE_URL}/api/users/v1/refresh-token`,
                    { refreshToken },
                    { withCredentials: true }
                );

                if (response.data.success) {
                    const { accessToken, refreshToken: newRefreshToken } = response.data;
                    localStorage.setItem("token", accessToken);
                    localStorage.setItem("refreshToken", newRefreshToken);

                    axiosInstance.defaults.headers.common["Authorization"] = "Bearer " + accessToken;
                    originalRequest.headers["Authorization"] = "Bearer " + accessToken;

                    // Notify other components (like SessionTimeoutPopup) that the session has been refreshed
                    window.dispatchEvent(new CustomEvent("session-refreshed", {
                        detail: { accessToken, refreshToken: newRefreshToken }
                    }));

                    processQueue(null, accessToken);
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("user");
                window.location.href = "/";
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
