import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import api from "../api/axios";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

function CandidateCalendar() {
    const { user } = useAuth();

    const [date, setDate] = useState(new Date());
    const [slots, setSlots] = useState([]);
    const [filteredSlots, setFilteredSlots] = useState([]);

    const [loading, setLoading] = useState(true);

    const [bookedSlots, setBookedSlots] = useState(new Set());
    const [waitlistedSlots, setWaitlistedSlots] = useState(new Set());

    //------------------------------------------------
    useEffect(() => {
        fetchAllData();
    }, []);

    //------------------------------------------------
    useEffect(() => {
        filterSlotsByDate(date);
    }, [date, slots]);

    //------------------------------------------------
    const fetchAllData = async () => {
        try {
            setLoading(true);

            const [slotsRes, bookingsRes, waitlistRes] = await Promise.all([
                api.get("/slots"),
                api.get("/bookings/my-bookings"),
                api.get("/waitlist/my-waitlist"),
            ]);

            if (slotsRes.data.success) setSlots(slotsRes.data.data);

            if (bookingsRes.data.success) {
                setBookedSlots(
                    new Set(bookingsRes.data.data.map((b) => b.slot_id)),
                );
            }

            if (waitlistRes.data.success) {
                setWaitlistedSlots(
                    new Set(waitlistRes.data.data.map((w) => w.slot_id)),
                );
            }
        } catch {
            toast.error("Failed to load calendar");
        } finally {
            setLoading(false);
        }
    };

    //------------------------------------------------
    const filterSlotsByDate = (selectedDate) => {
        const selected = new Date(selectedDate).toDateString();

        const filtered = slots.filter(
            (slot) => new Date(slot.start_time).toDateString() === selected,
        );

        setFilteredSlots(filtered);
    };

    //------------------------------------------------
    const handleBooking = async (slotId) => {
        try {
            await api.post("/bookings", {
                slotId,
                idempotencyKey: crypto.randomUUID(),
            });

            toast.success("Slot booked");

            fetchAllData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Booking failed");
        }
    };

    //------------------------------------------------
    const handleJoinWaitlist = async (slotId) => {
        try {
            await api.post("/waitlist", { slotId });

            toast.success("Added to waitlist");

            fetchAllData();
        } catch (err) {
            toast.error(err.response?.data?.message);
        }
    };

    //------------------------------------------------
    const handleLeaveWaitlist = async (slotId) => {
        try {
            await api.delete(`/waitlist/${slotId}/leave`);

            toast.success("Left waitlist");

            fetchAllData();
        } catch (err) {
            toast.error(err.response?.data?.message);
        }
    };

    //------------------------------------------------
    if (loading) return <Loader />;

    //------------------------------------------------
    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-2xl font-bold mb-4">Interview Calendar</h1>

            {/* Calendar */}
            <div className="bg-white p-4 rounded shadow mb-6">
                <Calendar onChange={setDate} value={date} />
            </div>

            {/* Slots for selected date */}
            <div>
                <h2 className="text-xl font-semibold mb-3">
                    Slots for {date.toDateString()}
                </h2>

                {filteredSlots.length === 0 && (
                    <div className="bg-white p-4 rounded shadow">
                        No slots for this day
                    </div>
                )}

                {filteredSlots.map((slot) => {
                    const availableSeats = slot.capacity - slot.booked_count;

                    const isBooked = bookedSlots.has(slot.id);

                    const isWaitlisted = waitlistedSlots.has(slot.id);

                    return (
                        <div
                            key={slot.id}
                            className="bg-white p-4 mb-3 rounded shadow"
                        >
                            <h3 className="font-bold">{slot.role}</h3>

                            <p>
                                {new Date(slot.start_time).toLocaleTimeString()}
                                {" - "}
                                {new Date(slot.end_time).toLocaleTimeString()}
                            </p>

                            <p>Available Seats: {availableSeats}</p>

                            {/* BOOKED */}
                            {isBooked && (
                                <button
                                    disabled
                                    className="bg-green-500 text-white px-4 py-2 mt-2 rounded"
                                >
                                    Booked
                                </button>
                            )}

                            {/* BOOK */}
                            {!isBooked && availableSeats > 0 && (
                                <button
                                    onClick={() => handleBooking(slot.id)}
                                    className="bg-blue-500 text-white px-4 py-2 mt-2 rounded"
                                >
                                    Book Slot
                                </button>
                            )}

                            {/* WAITLIST */}
                            {!isBooked &&
                                availableSeats === 0 &&
                                !isWaitlisted && (
                                    <button
                                        onClick={() =>
                                            handleJoinWaitlist(slot.id)
                                        }
                                        className="bg-yellow-500 text-white px-4 py-2 mt-2 rounded"
                                    >
                                        Join Waitlist
                                    </button>
                                )}

                            {/* LEAVE WAITLIST */}
                            {isWaitlisted && (
                                <button
                                    onClick={() => handleLeaveWaitlist(slot.id)}
                                    className="bg-red-500 text-white px-4 py-2 mt-2 rounded"
                                >
                                    Leave Waitlist
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default CandidateCalendar;
