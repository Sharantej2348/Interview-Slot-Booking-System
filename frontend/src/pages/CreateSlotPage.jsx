import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";

function CreateSlotPage() {
    const navigate = useNavigate();

    const { user } = useAuth();

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        interviewerId: user?.id || "",
        role: "",
        startTime: "",
        endTime: "",
        capacity: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !formData.role ||
            !formData.startTime ||
            !formData.endTime ||
            !formData.capacity
        ) {
            toast.error("Please fill all fields");

            return;
        }

        try {
            setLoading(true);

            await api.post("/slots", {
                interviewerId: formData.interviewerId,
                role: formData.role,
                startTime: formData.startTime,
                endTime: formData.endTime,
                capacity: Number(formData.capacity),
            });

            toast.success("Slot created successfully");

            navigate("/recruiter-dashboard");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create slot");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-center">
            <div className="bg-white p-8 rounded shadow w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">
                    Create Interview Slot
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Role */}
                    <div>
                        <label className="block text-gray-700 mb-1">Role</label>

                        <input
                            type="text"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            placeholder="Enter role (e.g., SDE)"
                            className="w-full border p-2 rounded"
                            required
                        />
                    </div>

                    {/* Start Time */}
                    <div>
                        <label className="block text-gray-700 mb-1">
                            Start Time
                        </label>

                        <input
                            type="datetime-local"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                            required
                        />
                    </div>

                    {/* End Time */}
                    <div>
                        <label className="block text-gray-700 mb-1">
                            End Time
                        </label>

                        <input
                            type="datetime-local"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                            required
                        />
                    </div>

                    {/* Capacity */}
                    <div>
                        <label className="block text-gray-700 mb-1">
                            Capacity
                        </label>

                        <input
                            type="number"
                            name="capacity"
                            value={formData.capacity}
                            onChange={handleChange}
                            placeholder="Enter capacity"
                            className="w-full border p-2 rounded"
                            min="1"
                            required
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
                        >
                            Create Slot
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate("/recruiter-dashboard")}
                            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateSlotPage;
