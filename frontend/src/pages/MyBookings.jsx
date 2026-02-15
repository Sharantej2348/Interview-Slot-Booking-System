import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

function MyBookings() {
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const candidateId = localStorage.getItem("candidateId");

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await api.get(`/bookings/candidate/${candidateId}`);

            setBookings(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (bookingId) => {
        try {
            await api.delete(`/bookings/${bookingId}`);

            alert("Booking cancelled successfully");

            // Update UI instantly
            setBookings((prevBookings) =>
                prevBookings.filter((booking) => booking.id !== bookingId),
            );
        } catch (err) {
            alert(err.response?.data?.message || "Cancel failed");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-100">
                <p className="text-xl font-semibold text-gray-600">
                    Loading bookings...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    My Bookings
                </h1>

                <button
                    onClick={() => navigate("/candidate-dashboard")}
                    className="bg-gray-700 hover:bg-gray-800 text-white px-5 py-2 rounded-lg shadow"
                >
                    Back
                </button>
            </div>

            {/* Empty state */}
            {bookings.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-10 text-center">
                    <h2 className="text-xl font-semibold text-gray-700">
                        No bookings found
                    </h2>

                    <p className="text-gray-500 mt-2">
                        Book a slot from dashboard
                    </p>
                </div>
            ) : (
                <div className="grid gap-5">
                    {bookings.map((booking) => (
                        <div
                            key={booking.id}
                            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        {booking.role}
                                    </h2>

                                    <p className="text-gray-600 mt-1">
                                        Start:{" "}
                                        {new Date(
                                            booking.start_time,
                                        ).toLocaleString()}
                                    </p>

                                    <p className="text-gray-600">
                                        End:{" "}
                                        {new Date(
                                            booking.end_time,
                                        ).toLocaleString()}
                                    </p>
                                </div>

                                <button
                                    onClick={() => handleCancel(booking.id)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyBookings;
