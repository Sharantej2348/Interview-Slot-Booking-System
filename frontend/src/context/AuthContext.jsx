import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split(".")[1]));
    } catch {
        return null;
    }
}

export function AuthProvider({ children }) {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    //--------------------------------------------------
    // Load from localStorage on refresh
    //--------------------------------------------------
    useEffect(() => {
        const storedToken = localStorage.getItem("token");

        if (storedToken) {
            const decoded = parseJwt(storedToken);

            if (decoded) {
                setToken(storedToken);

                setUser({
                    id: decoded.userId,
                    role: decoded.role,
                });

                setRole(decoded.role);

                setIsAuthenticated(true);
            }
        }

        setLoading(false);
    }, []);

    //--------------------------------------------------
    // Login
    //--------------------------------------------------
    const login = (token) => {
        const decoded = parseJwt(token);

        localStorage.setItem("token", token);

        setToken(token);

        setUser({
            id: decoded.userId,
            role: decoded.role,
        });

        setRole(decoded.role);

        setIsAuthenticated(true);
    };

    //--------------------------------------------------
    // Logout
    //--------------------------------------------------
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");

        setToken(null);
        setUser(null);
        setRole(null);

        setIsAuthenticated(false);
    };

    //--------------------------------------------------
    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                role,
                isAuthenticated,
                login,
                logout,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
