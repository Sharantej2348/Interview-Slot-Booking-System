import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { toast } from "react-toastify";

function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "candidate",
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

        if (!form.name || !form.email || !form.password) {
            toast.error("Please fill all fields");
            return;
        }

        if (form.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        try {
            setLoading(true);

            const res = await api.post("/auth/register", {
                name: form.name,
                email: form.email,
                password: form.password,
                role: form.role,
            });

            /*
            Save JWT token
            */
            const token = res.data.token;
            const role = res.data.user.role;

            localStorage.setItem("token", token);
            localStorage.setItem("role", role);

            toast.success("Registration successful");

            /*
            Redirect based on role
            */
            if (role === "candidate") {
                navigate("/candidate-dashboard");
            } else {
                navigate("/recruiter-dashboard");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Registration failed");
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
                <h2 className="text-3xl font-bold mb-6 text-center">
                    Register
                </h2>

                {/* Name */}
                <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />

                {/* Email */}
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />

                {/* Password */}
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />

                {/* Role selection */}
                <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full mb-6 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                    <option value="candidate">Candidate</option>

                    <option value="recruiter">Recruiter</option>
                </select>

                {/* Register Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-semibold disabled:opacity-50"
                >
                    {loading ? "Registering..." : "Register"}
                </button>

                {/* Login link */}
                <p className="text-center mt-4">
                    Already have an account?
                    <Link
                        to="/login"
                        className="text-green-600 font-semibold ml-1"
                    >
                        Login
                    </Link>
                </p>
            </form>
        </div>
    );
}

export default Register;
