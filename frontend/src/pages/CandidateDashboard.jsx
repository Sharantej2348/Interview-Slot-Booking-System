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
    const [waitlistedSlots, setWaitlistedSlots] = useState(new Set());
    const [bookedSlots, setBookedSlots] = useState(new Set());

    const [loading, setLoading] = useState(true);

    const [bookingLoadingId, setBookingLoadingId] = useState(null);
    const [waitlistLoadingId, setWaitlistLoadingId] = useState(null);
    const [leaveWaitlistLoadingId, setLeaveWaitlistLoadingId] = useState(null);

    //--------------------------------------------------
    useEffect(() => {
        if (user?.id) {
            fetchAllData();
        }
    }, [user]);

    //--------------------------------------------------
    const fetchAllData = async () => {
        try {
            setLoading(true);

            await Promise.all([fetchSlots(), fetchWaitlist(), fetchBookings()]);
        } finally {
            setLoading(false);
        }
    };

    //--------------------------------------------------
    const fetchSlots = async () => {
        const res = await api.get("/slots");

        if (res.data.success) {
            setSlots(res.data.data);
        }
    };

    //--------------------------------------------------
    const fetchBookings = async () => {
        const res = await api.get("/bookings/my-bookings");

        if (res.data.success) {
            const ids = new Set(res.data.data.map((b) => b.slot_id));

            setBookedSlots(ids);
        }
    };

    //--------------------------------------------------
    const fetchWaitlist = async () => {
        const res = await api.get("/waitlist/my-waitlist");

        if (res.data.success) {
            const ids = new Set(res.data.data.map((w) => w.slot_id));

            setWaitlistedSlots(ids);
        }
    };

    //--------------------------------------------------
    // BOOK SLOT
    //--------------------------------------------------
    const handleBooking = async (slotId) => {
        try {
            setBookingLoadingId(slotId);

            await api.post("/bookings", {
                slotId,
                idempotencyKey: crypto.randomUUID(),
            });

            toast.success("Slot booked successfully");

            fetchAllData();
        } catch (err) {
            toast.error(err.response?.data?.message);
        } finally {
            setBookingLoadingId(null);
        }
    };

    //--------------------------------------------------
    // JOIN WAITLIST
    //--------------------------------------------------
    const handleJoinWaitlist = async (slotId) => {
        try {
            setWaitlistLoadingId(slotId);

            await api.post("/waitlist", { slotId });

            toast.success("Added to waitlist");

            fetchWaitlist();
        } catch (err) {
            toast.error(err.response?.data?.message);
        } finally {
            setWaitlistLoadingId(null);
        }
    };

    //--------------------------------------------------
    // LEAVE WAITLIST  ⭐ NEW FEATURE
    //--------------------------------------------------
    const handleLeaveWaitlist = async (slotId) => {
        try {
            setLeaveWaitlistLoadingId(slotId);

            await api.delete(`/waitlist/${slotId}`);

            toast.success("Removed from waitlist");

            setWaitlistedSlots((prev) => {
                const updated = new Set(prev);
                updated.delete(slotId);
                return updated;
            });
        } catch (err) {
            toast.error(err.response?.data?.message);
        } finally {
            setLeaveWaitlistLoadingId(null);
        }
    };

    //--------------------------------------------------
    if (loading) return <Loader />;

    //--------------------------------------------------
    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold">Candidate Dashboard</h1>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate("/candidate-calendar")}
                        className="bg-purple-600 text-white px-4 py-2 rounded"
                    >
                        Calendar View
                    </button>

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

                            {/* BOOKED */}
                            {isBooked && (
                                <button
                                    disabled
                                    className="mt-3 bg-green-400 text-white px-4 py-2 rounded"
                                >
                                    Booked
                                </button>
                            )}

                            {/* BOOK SLOT */}
                            {!isBooked && availableSeats > 0 && (
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

                            {/* JOIN WAITLIST */}
                            {!isBooked &&
                                availableSeats === 0 &&
                                !isWaitlisted && (
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

                            {/* LEAVE WAITLIST ⭐ */}
                            {isWaitlisted && (
                                <button
                                    onClick={() => handleLeaveWaitlist(slot.id)}
                                    disabled={
                                        leaveWaitlistLoadingId === slot.id
                                    }
                                    className="mt-3 bg-red-500 text-white px-4 py-2 rounded"
                                >
                                    {leaveWaitlistLoadingId === slot.id
                                        ? "Leaving..."
                                        : "Leave Waitlist"}
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
