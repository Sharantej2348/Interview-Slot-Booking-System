import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function RecruiterDashboard() {
    const navigate = useNavigate();

    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchSlots();
    }, []);

    const fetchSlots = async () => {
        try {
            const res = await api.get("/slots");

            if (res.data.success) {
                setSlots(res.data.data);
            } else {
                setSlots([]);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to load slots");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSlot = async (slotId) => {
        if (!window.confirm("Delete this slot?")) return;

        try {
            setDeletingId(slotId);

            await api.delete(`/slots/${slotId}`);

            // Remove slot from state safely
            setSlots((prev) => prev.filter((slot) => slot.id !== slotId));

            alert("Slot deleted successfully");
        } catch (err) {
            console.error(err);

            alert(err.response?.data?.message || "Delete failed");
        } finally {
            setDeletingId(null);
        }
    };

    // Safe stat calculations
    const totalSlots = slots.length;

    const totalBookings = slots.reduce(
        (sum, slot) => sum + (slot.booked_count || 0),
        0,
    );

    const availableSeats = slots.reduce(
        (sum, slot) =>
            sum + (slot.available_seats ?? slot.capacity - slot.booked_count),
        0,
    );

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <p className="text-xl font-semibold">Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Recruiter Dashboard</h1>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate("/create-slot")}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                        Create Slot
                    </button>

                    <button
                        onClick={() => {
                            localStorage.clear();
                            navigate("/");
                        }}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                    >
                        Switch Role
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded shadow">
                    <p className="text-gray-500">Total Slots</p>

                    <p className="text-2xl font-bold">{totalSlots}</p>
                </div>

                <div className="bg-white p-6 rounded shadow">
                    <p className="text-gray-500">Total Bookings</p>

                    <p className="text-2xl font-bold text-green-600">
                        {totalBookings}
                    </p>
                </div>

                <div className="bg-white p-6 rounded shadow">
                    <p className="text-gray-500">Available Seats</p>

                    <p className="text-2xl font-bold text-purple-600">
                        {availableSeats}
                    </p>
                </div>
            </div>

            {/* Slots Table */}
            <div className="bg-white rounded shadow p-6">
                <h2 className="text-xl font-bold mb-4">All Slots</h2>

                {slots.length === 0 ? (
                    <p>No slots found</p>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="py-2 text-left">Role</th>

                                <th className="py-2 text-left">Start</th>

                                <th className="py-2 text-left">End</th>

                                <th className="py-2 text-left">Capacity</th>

                                <th className="py-2 text-left">Booked</th>

                                <th className="py-2 text-left">Available</th>

                                <th className="py-2 text-left">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {slots.map((slot) => (
                                <tr key={slot.id} className="border-b">
                                    <td className="py-2">{slot.role}</td>

                                    <td className="py-2">
                                        {new Date(
                                            slot.start_time,
                                        ).toLocaleString()}
                                    </td>

                                    <td className="py-2">
                                        {new Date(
                                            slot.end_time,
                                        ).toLocaleString()}
                                    </td>

                                    <td className="py-2">{slot.capacity}</td>

                                    <td className="py-2 text-green-600">
                                        {slot.booked_count || 0}
                                    </td>

                                    <td className="py-2 text-blue-600">
                                        {slot.available_seats ??
                                            slot.capacity - slot.booked_count}
                                    </td>

                                    <td className="py-2">
                                        <button
                                            onClick={() =>
                                                handleDeleteSlot(slot.id)
                                            }
                                            disabled={deletingId === slot.id}
                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
                                        >
                                            {deletingId === slot.id
                                                ? "Deleting..."
                                                : "Delete"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default RecruiterDashboard;
