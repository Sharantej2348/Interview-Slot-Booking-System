import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import RoleSelection from "./pages/RoleSelection";
import CandidateDashboard from "./pages/CandidateDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import CreateSlotPage from "./pages/CreateSlotPage";
import MyBookings from "./pages/MyBookings";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Home */}
                <Route path="/" element={<RoleSelection />} />

                {/* Candidate */}
                <Route
                    path="/candidate-dashboard"
                    element={<CandidateDashboard />}
                />
                <Route path="/my-bookings" element={<MyBookings />} />

                {/* Recruiter */}
                <Route
                    path="/recruiter-dashboard"
                    element={<RecruiterDashboard />}
                />
                <Route path="/create-slot" element={<CreateSlotPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
