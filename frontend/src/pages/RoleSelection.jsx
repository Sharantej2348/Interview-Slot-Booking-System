import React from "react";
import { useNavigate } from "react-router-dom";

function RoleSelection() {
    const navigate = useNavigate();

    const handleCandidate = () => {
        localStorage.setItem("role", "candidate");

        // SET VALID UUID
        localStorage.setItem(
            "candidateId",
            "e4e7e27e-6672-4261-ad0e-0935969bef5d",
        );

        navigate("/candidate-dashboard");
    };

    const handleRecruiter = () => {
        localStorage.setItem("role", "recruiter");
        navigate("/recruiter-dashboard");
    };

    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-8">
                Interview Slot Booking System
            </h1>

            <div className="flex gap-4">
                <button
                    onClick={handleCandidate}
                    className="bg-blue-600 text-white px-6 py-3 rounded"
                >
                    Candidate
                </button>

                <button
                    onClick={handleRecruiter}
                    className="bg-green-600 text-white px-6 py-3 rounded"
                >
                    Recruiter
                </button>
            </div>
        </div>
    );
}

export default RoleSelection;
