import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import api from "../api/axios";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function CandidateCalendar() {
    const navigate = useNavigate();

    //------------------------------------------------
    // State
    //------------------------------------------------

    const [selectedDate, setSelectedDate] = useState(new Date());

    const [slots, setSlots] = useState([]);

    const [bookedSlots, setBookedSlots] = useState(new Set());

    const [waitlistedSlots, setWaitlistedSlots] = useState(new Set());

    const [loading, setLoading] = useState(true);

    const [actionLoadingId, setActionLoadingId] = useState(null);

    //------------------------------------------------
    // Initial load
    //------------------------------------------------

    useEffect(() => {
        fetchAllData();
    }, []);

    //------------------------------------------------
    // Fetch all data
    //------------------------------------------------

    const fetchAllData = async () => {
        try {
            setLoading(true);

            const [slotsRes, bookingsRes, waitlistRes] = await Promise.all([
                api.get("/slots"),
                api.get("/bookings/my-bookings"),
                api.get("/waitlist/my-waitlist"),
            ]);

            //------------------------------------------------
            // Slots
            //------------------------------------------------

            if (slotsRes.data.success) {
                setSlots(slotsRes.data.data);
            }

            //------------------------------------------------
            // Bookings
            //------------------------------------------------

            if (bookingsRes.data.success) {
                const booked = new Set(
                    bookingsRes.data.data.map((b) => b.slot_id),
                );

                setBookedSlots(booked);
            }

            //------------------------------------------------
            // Waitlist
            //------------------------------------------------

            if (waitlistRes.data.success) {
                const waitlisted = new Set(
                    waitlistRes.data.data.map((w) => w.slot_id),
                );

                setWaitlistedSlots(waitlisted);
            }
        } catch (err) {
            toast.error("Failed to load calendar data");
        } finally {
            setLoading(false);
        }
    };

    //------------------------------------------------
    // Filter slots for selected date
    //------------------------------------------------

    const slotsForSelectedDate = slots.filter((slot) => {
        const slotDate = new Date(slot.start_time).toDateString();
        const selected = new Date(selectedDate).toDateString();

        return slotDate === selected;
    });

    //------------------------------------------------
    // Book slot
    //------------------------------------------------

    const handleBook = async (slotId) => {
        try {
            setActionLoadingId(slotId);

            await api.post("/bookings", {
                slotId,
                idempotencyKey: crypto.randomUUID(),
            });

            toast.success("Slot booked successfully");

            await fetchAllData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Booking failed");
        } finally {
            setActionLoadingId(null);
        }
    };

    //------------------------------------------------
    // Join waitlist
    //------------------------------------------------

    const handleJoinWaitlist = async (slotId) => {
        try {
            setActionLoadingId(slotId);

            await api.post("/waitlist", { slotId });

            toast.success("Joined waitlist");

            await fetchAllData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed");
        } finally {
            setActionLoadingId(null);
        }
    };

    //------------------------------------------------
    // Leave waitlist
    //------------------------------------------------

    const handleLeaveWaitlist = async (slotId) => {
        try {
            setActionLoadingId(slotId);

            await api.delete(`/waitlist/${slotId}`);

            toast.success("Left waitlist");

            await fetchAllData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed");
        } finally {
            setActionLoadingId(null);
        }
    };

    //------------------------------------------------
    // Calendar tile highlight
    //------------------------------------------------

    const tileContent = ({ date }) => {
        const hasSlot = slots.some(
            (slot) =>
                new Date(slot.start_time).toDateString() ===
                date.toDateString(),
        );

        return hasSlot ? (
            <div className="flex justify-center mt-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
        ) : null;
    };

    //------------------------------------------------
    if (loading) return <Loader />;

    //------------------------------------------------
    return (
        <div className="min-h-screen bg-gray-100 p-6">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">
                    Candidate Interview Calendar
                </h1>

                <button
                    onClick={() => navigate("/candidate-dashboard")}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                    Back
                </button>
            </div>

            {/* CALENDAR */}
            <div className="bg-white p-4 rounded shadow mb-6">
                <Calendar
                    onChange={setSelectedDate}
                    value={selectedDate}
                    tileContent={tileContent}
                />
            </div>

            {/* SLOTS */}
            <div className="bg-white p-6 rounded shadow">
                <h2 className="text-xl font-semibold mb-4">
                    Slots for {selectedDate.toDateString()}
                </h2>

                {slotsForSelectedDate.length === 0 ? (
                    <p className="text-gray-500">
                        No slots available for this day
                    </p>
                ) : (
                    <div className="space-y-4">
                        {slotsForSelectedDate.map((slot) => {
                            const available = slot.capacity - slot.booked_count;

                            const isBooked = bookedSlots.has(slot.id);

                            const isWaitlisted = waitlistedSlots.has(slot.id);

                            return (
                                <div
                                    key={slot.id}
                                    className="border p-4 rounded"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-bold">
                                                {slot.role}
                                            </p>

                                            <p>
                                                {new Date(
                                                    slot.start_time,
                                                ).toLocaleTimeString()}
                                                {" - "}
                                                {new Date(
                                                    slot.end_time,
                                                ).toLocaleTimeString()}
                                            </p>

                                            <p>
                                                Available Seats:{" "}
                                                <span className="font-semibold">
                                                    {available}
                                                </span>
                                            </p>
                                        </div>

                                        <div>
                                            {isBooked ? (
                                                <button
                                                    disabled
                                                    className="bg-green-500 text-white px-4 py-2 rounded"
                                                >
                                                    Booked
                                                </button>
                                            ) : available > 0 ? (
                                                <button
                                                    onClick={() =>
                                                        handleBook(slot.id)
                                                    }
                                                    disabled={
                                                        actionLoadingId ===
                                                        slot.id
                                                    }
                                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                                >
                                                    {actionLoadingId === slot.id
                                                        ? "Booking..."
                                                        : "Book Slot"}
                                                </button>
                                            ) : isWaitlisted ? (
                                                <button
                                                    onClick={() =>
                                                        handleLeaveWaitlist(
                                                            slot.id,
                                                        )
                                                    }
                                                    disabled={
                                                        actionLoadingId ===
                                                        slot.id
                                                    }
                                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                                >
                                                    {actionLoadingId === slot.id
                                                        ? "Leaving..."
                                                        : "Leave Waitlist"}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() =>
                                                        handleJoinWaitlist(
                                                            slot.id,
                                                        )
                                                    }
                                                    disabled={
                                                        actionLoadingId ===
                                                        slot.id
                                                    }
                                                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                                                >
                                                    {actionLoadingId === slot.id
                                                        ? "Joining..."
                                                        : "Join Waitlist"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CandidateCalendar;
