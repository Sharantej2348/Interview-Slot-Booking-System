import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";

function CandidateDashboard() {
    const navigate = useNavigate();

    const { user, logout } = useAuth();

    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingId, setBookingId] = useState(null);

    useEffect(() => {
        fetchSlots();
    }, []);

    //-----------------------------------------
    // Fetch Slots
    //-----------------------------------------
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

    //-----------------------------------------
    // Book Slot
    //-----------------------------------------
    const handleBookSlot = async (slotId) => {
        try {
            setBookingId(slotId);

            await api.post("/bookings", {
                slotId,
                idempotencyKey: crypto.randomUUID(),
            });

            toast.success("Slot booked successfully");

            fetchSlots();
        } catch (err) {
            toast.error(err.response?.data?.message || "Booking failed");
        } finally {
            setBookingId(null);
        }
    };

    const formatDate = (date) => new Date(date).toLocaleString();

    const getAvailableSeats = (slot) =>
        slot.available_seats ?? slot.capacity - slot.booked_count;

    if (loading) {
        return <Loader />;
    }
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white shadow p-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Candidate Dashboard</h1>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate("/my-bookings")}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                        My Bookings
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
                <h2 className="text-lg font-semibold mb-4">
                    Welcome, {user?.email}
                </h2>

                {/* Slots */}
                <div className="grid gap-5">
                    {slots.length === 0 && (
                        <div className="bg-white p-6 rounded shadow text-center">
                            No slots available
                        </div>
                    )}

                    {slots.map((slot) => {
                        const availableSeats = getAvailableSeats(slot);

                        return (
                            <div
                                key={slot.id}
                                className="bg-white p-6 rounded shadow hover:shadow-md transition"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-semibold">
                                            {slot.role}
                                        </h3>

                                        <p className="text-gray-600 mt-1">
                                            Start: {formatDate(slot.start_time)}
                                        </p>

                                        <p className="text-gray-600">
                                            End: {formatDate(slot.end_time)}
                                        </p>

                                        <p className="mt-2 font-medium">
                                            Available Seats:{" "}
                                            <span className="text-blue-600">
                                                {availableSeats}
                                            </span>
                                        </p>
                                    </div>

                                    <div>
                                        {availableSeats > 0 ? (
                                            <button
                                                onClick={() =>
                                                    handleBookSlot(slot.id)
                                                }
                                                disabled={bookingId === slot.id}
                                                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded disabled:opacity-50"
                                            >
                                                {bookingId === slot.id
                                                    ? "Booking..."
                                                    : "Book Slot"}
                                            </button>
                                        ) : (
                                            <span className="text-red-500 font-semibold">
                                                Slot Full
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default CandidateDashboard;
