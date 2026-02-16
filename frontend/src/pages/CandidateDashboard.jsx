import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";

function CandidateDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [slots, setSlots] = useState([]);

    const [bookedSlots, setBookedSlots] = useState(new Set());
    const [waitlistedSlots, setWaitlistedSlots] = useState(new Set());

    const [loading, setLoading] = useState(true);

    const [bookingLoadingId, setBookingLoadingId] = useState(null);
    const [waitlistLoadingId, setWaitlistLoadingId] = useState(null);

    useEffect(() => {
        if (user?.id) {
            loadDashboardData();
        }
    }, [user]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            await Promise.all([fetchSlots(), fetchBookings(), fetchWaitlist()]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSlots = async () => {
        try {
            const res = await api.get("/slots");

            if (res.data.success) {
                setSlots(res.data.data);
            }
        } catch {
            toast.error("Failed to load slots");
        }
    };

    const fetchBookings = async () => {
        try {
            const res = await api.get("/bookings/my-bookings");

            if (res.data.success) {
                const booked = new Set(res.data.data.map((b) => b.slot_id));

                setBookedSlots(booked);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchWaitlist = async () => {
        try {
            const res = await api.get("/waitlist/my-waitlist");

            if (res.data.success) {
                const waitlisted = new Set(res.data.data.map((w) => w.slot_id));

                setWaitlistedSlots(waitlisted);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleBooking = async (slotId) => {
        try {
            setBookingLoadingId(slotId);

            await api.post("/bookings", {
                slotId,
                idempotencyKey: crypto.randomUUID(),
            });

            toast.success("Slot booked successfully");

            await loadDashboardData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Booking failed");
        } finally {
            setBookingLoadingId(null);
        }
    };

    const handleJoinWaitlist = async (slotId) => {
        try {
            setWaitlistLoadingId(slotId);

            await api.post("/waitlist", {
                slotId,
            });

            toast.success("Added to waitlist");

            await loadDashboardData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Waitlist failed");
        } finally {
            setWaitlistLoadingId(null);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            {/* HEADER */}
            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold">Candidate Dashboard</h1>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate("/my-bookings")}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        My Bookings
                    </button>

                    <button
                        onClick={() => navigate("/my-waitlist")}
                        className="bg-yellow-500 text-white px-4 py-2 rounded"
                    >
                        My Waitlist
                    </button>
                </div>
            </div>

            {/* SLOT LIST */}
            <div className="grid gap-4">
                {slots.map((slot) => {
                    const availableSeats = slot.capacity - slot.booked_count;

                    const isBooked = bookedSlots.has(slot.id);

                    const isWaitlisted = waitlistedSlots.has(slot.id);

                    return (
                        <div
                            key={slot.id}
                            className="bg-white p-5 rounded shadow"
                        >
                            <h2 className="text-xl font-bold">{slot.role}</h2>

                            <p>
                                Start:{" "}
                                {new Date(slot.start_time).toLocaleString()}
                            </p>

                            <p>
                                End: {new Date(slot.end_time).toLocaleString()}
                            </p>

                            <p>Available Seats: {availableSeats}</p>

                            {/* BOOKED STATUS */}
                            {isBooked && (
                                <button
                                    disabled
                                    className="mt-3 bg-green-400 text-white px-4 py-2 rounded cursor-not-allowed"
                                >
                                    Booked
                                </button>
                            )}

                            {/* WAITLISTED STATUS */}
                            {!isBooked && isWaitlisted && (
                                <button
                                    disabled
                                    className="mt-3 bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed"
                                >
                                    Waitlisted
                                </button>
                            )}

                            {/* BOOK BUTTON */}
                            {!isBooked &&
                                !isWaitlisted &&
                                availableSeats > 0 && (
                                    <button
                                        onClick={() => handleBooking(slot.id)}
                                        disabled={bookingLoadingId === slot.id}
                                        className="mt-3 bg-green-600 text-white px-4 py-2 rounded"
                                    >
                                        {bookingLoadingId === slot.id
                                            ? "Booking..."
                                            : "Book Slot"}
                                    </button>
                                )}

                            {/* WAITLIST BUTTON */}
                            {!isBooked &&
                                !isWaitlisted &&
                                availableSeats === 0 && (
                                    <button
                                        onClick={() =>
                                            handleJoinWaitlist(slot.id)
                                        }
                                        disabled={waitlistLoadingId === slot.id}
                                        className="mt-3 bg-yellow-500 text-white px-4 py-2 rounded"
                                    >
                                        {waitlistLoadingId === slot.id
                                            ? "Joining..."
                                            : "Join Waitlist"}
                                    </button>
                                )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default CandidateDashboard;
