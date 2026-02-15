import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";

function RecruiterDashboard() {
    const navigate = useNavigate();

    const { user, logout } = useAuth();

    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchSlots();
    }, []);

    const fetchSlots = async () => {
        try {
            setLoading(true);

            const res = await api.get("/slots");

            if (res.data.success) {
                setSlots(res.data.data);
            } else {
                toast.error("Failed to load slots");
            }
        } catch (err) {
            console.error(err);

            toast.error(err.response?.data?.message || "Failed to fetch slots");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSlot = async (slotId) => {
        if (!window.confirm("Delete this slot?")) return;

        try {
            setDeletingId(slotId);

            await api.delete(`/slots/${slotId}`);

            setSlots((prev) => prev.filter((slot) => slot.id !== slotId));

            toast.success("Slot deleted successfully");
        } catch (err) {
            console.error(err);

            toast.error(err.response?.data?.message || "Delete failed");
        } finally {
            setDeletingId(null);
        }
    };

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
        return <Loader />;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white shadow p-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Recruiter Dashboard</h1>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate("/create-slot")}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                        Create Slot
                    </button>

                    <button
                        onClick={logout}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Welcome */}
            <div className="p-6">
                <h2 className="text-lg font-semibold mb-6">
                    Welcome, {user?.email}
                </h2>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                        <p className="text-gray-500">No slots created yet</p>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b text-left">
                                    <th className="py-3">Role</th>

                                    <th className="py-3">Start</th>

                                    <th className="py-3">End</th>

                                    <th className="py-3">Capacity</th>

                                    <th className="py-3">Booked</th>

                                    <th className="py-3">Available</th>

                                    <th className="py-3">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {slots.map((slot) => {
                                    const available =
                                        slot.available_seats ??
                                        slot.capacity - slot.booked_count;

                                    return (
                                        <tr
                                            key={slot.id}
                                            className="border-b hover:bg-gray-50"
                                        >
                                            <td className="py-3">
                                                {slot.role}
                                            </td>

                                            <td className="py-3">
                                                {new Date(
                                                    slot.start_time,
                                                ).toLocaleString()}
                                            </td>

                                            <td className="py-3">
                                                {new Date(
                                                    slot.end_time,
                                                ).toLocaleString()}
                                            </td>

                                            <td className="py-3">
                                                {slot.capacity}
                                            </td>

                                            <td className="py-3 text-green-600">
                                                {slot.booked_count || 0}
                                            </td>

                                            <td className="py-3 text-blue-600">
                                                {available}
                                            </td>

                                            <td className="py-3">
                                                <button
                                                    onClick={() =>
                                                        handleDeleteSlot(
                                                            slot.id,
                                                        )
                                                    }
                                                    disabled={
                                                        deletingId === slot.id
                                                    }
                                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
                                                >
                                                    {deletingId === slot.id
                                                        ? "Deleting..."
                                                        : "Delete"}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default RecruiterDashboard;
