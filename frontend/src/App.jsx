import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import CandidateDashboard from "./pages/CandidateDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import CreateSlotPage from "./pages/CreateSlotPage";
import MyBookings from "./pages/MyBookings";

import ProtectedRoute from "./components/ProtectedRoutes";
import NavBar from "./components/NavBar";
import MyWaitlist from "./pages/MyWaitlist";
import CandidateCalendar from "./pages/CandidateCalendar";

import { useAuth } from "./context/AuthContext";

function App() {
    const { isAuthenticated, user } = useAuth();

    return (
        <Router>
            {/* Show NavBar only when logged in */}
            {isAuthenticated && <NavBar />}

            <Routes>
                {/* Public Routes */}
                <Route
                    path="/login"
                    element={
                        !isAuthenticated ? (
                            <Login />
                        ) : (
                            <Navigate to={getDashboard(user)} />
                        )
                    }
                />

                <Route
                    path="/register"
                    element={
                        !isAuthenticated ? (
                            <Register />
                        ) : (
                            <Navigate to={getDashboard(user)} />
                        )
                    }
                />

                {/* Candidate Routes */}
                <Route
                    path="/candidate-dashboard"
                    element={
                        <ProtectedRoute role="candidate">
                            <CandidateDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/my-bookings"
                    element={
                        <ProtectedRoute role="candidate">
                            <MyBookings />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/my-waitlist"
                    element={
                        <ProtectedRoute allowedRoles={["candidate"]}>
                            <MyWaitlist />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/candidate-calendar"
                    element={
                        <ProtectedRoute allowedRoles={["candidate"]}>
                            <CandidateCalendar />
                        </ProtectedRoute>
                    }
                />

                {/* Recruiter Routes */}
                <Route
                    path="/recruiter-dashboard"
                    element={
                        <ProtectedRoute role="recruiter">
                            <RecruiterDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/create-slot"
                    element={
                        <ProtectedRoute role="recruiter">
                            <CreateSlotPage />
                        </ProtectedRoute>
                    }
                />

                {/* Default Route */}
                <Route
                    path="/"
                    element={
                        isAuthenticated ? (
                            <Navigate to={getDashboard(user)} />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

function getDashboard(user) {
    if (!user) return "/login";

    if (user.role === "recruiter") return "/recruiter-dashboard";

    if (user.role === "candidate") return "/candidate-dashboard";

    return "/login";
}

export default App;
