export const getToken = () => {
    return localStorage.getItem("token");
};

export const getRole = () => {
    return localStorage.getItem("role");
};

export const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    return !!token;
};

export const saveAuth = (token, role) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
};

export const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
};

export const logout = () => {
    clearAuth();

    window.location.href = "/login";
};
