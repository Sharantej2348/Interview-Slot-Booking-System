import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function NavBar() {
    const { user, logout, isAuthenticated } = useAuth();

    const navigate = useNavigate();

    const handleLogout = () => {
        logout();

        navigate("/login", { replace: true });
    };

    if (!isAuthenticated) return null;

    return (
        <nav className="bg-white shadow-md px-6 py-3">
            <div className="flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="text-xl font-bold text-blue-600">
                    Interview Scheduler
                </Link>

                {/* Right Side */}
                <div className="flex items-center gap-4">
                    {/* Candidate Links */}
                    {user?.role === "candidate" && (
                        <>
                            <Link
                                to="/candidate-dashboard"
                                className="text-gray-700 hover:text-blue-600 font-medium"
                            >
                                Dashboard
                            </Link>

                            <Link
                                to="/my-bookings"
                                className="text-gray-700 hover:text-blue-600 font-medium"
                            >
                                My Bookings
                            </Link>
                        </>
                    )}

                    {/* Recruiter Links */}
                    {user?.role === "recruiter" && (
                        <>
                            <Link
                                to="/recruiter-dashboard"
                                className="text-gray-700 hover:text-blue-600 font-medium"
                            >
                                Dashboard
                            </Link>

                            <Link
                                to="/create-slot"
                                className="text-gray-700 hover:text-blue-600 font-medium"
                            >
                                Create Slot
                            </Link>
                        </>
                    )}

                    {/* User Info */}
                    <span className="text-gray-600 text-sm">{user?.email}</span>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;
