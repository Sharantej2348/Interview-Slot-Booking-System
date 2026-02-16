import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

function Login() {
    const navigate = useNavigate();

    const { login } = useAuth();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.email || !form.password) {
            toast.error("Please fill all fields");
            return;
        }

        try {
            setLoading(true);

            const res = await api.post("/auth/login", {
                email: form.email,
                password: form.password,
            });

            const token = res.data.token;

            login(token);

            toast.success("Login successful");

            const decoded = JSON.parse(atob(token.split(".")[1]));
            if (decoded.role === "candidate") {
                navigate("/candidate-dashboard", {
                    replace: true,
                });
            } else {
                navigate("/recruiter-dashboard", {
                    replace: true,
                });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-xl shadow-md w-96"
            >
                <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full mb-4 p-3 border rounded-lg"
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full mb-6 p-3 border rounded-lg"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white p-3 rounded-lg"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

                <p className="text-center mt-4">
                    Don't have an account?
                    <Link to="/register" className="text-blue-600 ml-1">
                        Register
                    </Link>
                </p>
            </form>
        </div>
    );
}

export default Login;
