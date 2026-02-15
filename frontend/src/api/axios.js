import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const role = localStorage.getItem("role");

    console.log("Sending role header:", role);

    if (role) {
        config.headers["x-user-role"] = role;
    }

    return config;
});

export default api;
