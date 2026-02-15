import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";

function MyBookings() {
    const navigate = useNavigate();

    const { user, loading: authLoading } = useAuth();

    console.log(user);

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelLoadingId, setCancelLoadingId] = useState(null);

    //--------------------------------------------------
    // Fetch bookings ONLY when user exists
    //--------------------------------------------------
    useEffect(() => {
        if (!authLoading && user?.id) {
            fetchBookings();
        }
    }, [authLoading, user]);

    //--------------------------------------------------
    const fetchBookings = async () => {
        try {
            setLoading(true);

            const res = await api.get("/bookings/my-bookings");
            console.log("Bookings:", res.data);

            if (res.data.success) {
                setBookings(res.data.data);
            }
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to load bookings",
            );
        } finally {
            setLoading(false);
        }
    };

    //--------------------------------------------------
    // Cancel booking
    //--------------------------------------------------
    const handleCancelBooking = async (bookingId) => {
        try {
            setCancelLoadingId(bookingId);

            await api.delete(`/bookings/${bookingId}`);

            toast.success("Booking cancelled");

            setBookings((prev) => prev.filter((b) => b.id !== bookingId));
        } catch (err) {
            toast.error(err.response?.data?.message || "Cancel failed");
        } finally {
            setCancelLoadingId(null);
        }
    };

    //--------------------------------------------------
    // Show loader while auth OR bookings loading
    //--------------------------------------------------
    if (authLoading) {
        return <Loader />;
    }

    //--------------------------------------------------
    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold">My Bookings</h1>

                <button
                    onClick={() => navigate("/candidate-dashboard")}
                    className="bg-gray-600 text-white px-4 py-2 rounded"
                >
                    Back
                </button>
            </div>

            {bookings.length === 0 ? (
                <div className="bg-white p-6 rounded shadow text-center">
                    No bookings found
                </div>
            ) : (
                bookings.map((booking) => (
                    <div
                        key={booking.id}
                        className="bg-white p-5 rounded shadow mb-4"
                    >
                        <h3 className="font-bold text-lg">{booking.role}</h3>

                        <p>
                            Start:{" "}
                            {new Date(booking.start_time).toLocaleString()}
                        </p>

                        <p>
                            End: {new Date(booking.end_time).toLocaleString()}
                        </p>

                        <button
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={cancelLoadingId === booking.id}
                            className="mt-3 bg-red-500 text-white px-4 py-2 rounded"
                        >
                            Cancel
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}

export default MyBookings;
