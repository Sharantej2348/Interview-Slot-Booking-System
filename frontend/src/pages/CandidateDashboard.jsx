import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function CandidateDashboard() {
    const navigate = useNavigate();

    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingLoadingId, setBookingLoadingId] = useState(null);

    const candidateId = localStorage.getItem("candidateId");

    useEffect(() => {
        fetchSlots();
    }, []);

    const fetchSlots = async () => {
        try {
            const res = await api.get("/slots");
            setSlots(res.data.data);
        } catch (err) {
            alert("Failed to fetch slots");
        } finally {
            setLoading(false);
        }
    };

    const handleBooking = async (slotId) => {
        try {
            setBookingLoadingId(slotId);

            await api.post("/bookings", {
                slotId,
                candidateId,
                idempotencyKey: crypto.randomUUID(),
            });

            alert("Slot booked successfully");

            fetchSlots();
        } catch (err) {
            alert(err.response?.data?.message || "Booking failed");
        } finally {
            setBookingLoadingId(null);
        }
    };

    const formatDate = (date) =>
        date ? new Date(date).toLocaleString() : "Invalid Date";

    const getAvailableSeats = (slot) =>
        slot.capacity - slot.booked_count;

    if (loading)
        return <div className="p-10 text-xl">Loading...</div>;

    return (
        <div className="p-8 bg-gray-100 min-h-screen">

            <div className="flex justify-between mb-6">

                <h1 className="text-3xl font-bold">
                    Candidate Dashboard
                </h1>

                <div className="flex gap-3">

                    <button
                        onClick={() => navigate("/my-bookings")}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        My Bookings
                    </button>

                    <button
                        onClick={() => {
                            localStorage.clear();
                            navigate("/");
                        }}
                        className="bg-gray-600 text-white px-4 py-2 rounded"
                    >
                        Switch Role
                    </button>

                </div>

            </div>

            <div className="space-y-4">

                {slots.map((slot) => {

                    const availableSeats = getAvailableSeats(slot);

                    return (
                        <div
                            key={slot.id}
                            className="bg-white p-5 rounded shadow"
                        >

                            <h2 className="text-xl font-semibold">
                                {slot.role}
                            </h2>

                            <p>
                                Start: {formatDate(slot.start_time)}
                            </p>

                            <p>
                                End: {formatDate(slot.end_time)}
                            </p>

                            <p>
                                Available Seats: {availableSeats}
                            </p>

                            {availableSeats > 0 ? (
                                <button
                                    onClick={() =>
                                        handleBooking(slot.id)
                                    }
                                    disabled={
                                        bookingLoadingId === slot.id
                                    }
                                    className="mt-3 bg-green-600 text-white px-4 py-2 rounded"
                                >
                                    {bookingLoadingId === slot.id
                                        ? "Booking..."
                                        : "Book Slot"}
                                </button>
                            ) : (
                                <p className="text-red-500 mt-2">
                                    Slot Full
                                </p>
                            )}
                        </div>
                    );
                })}

            </div>

        </div>
    );
}

export default CandidateDashboard;
