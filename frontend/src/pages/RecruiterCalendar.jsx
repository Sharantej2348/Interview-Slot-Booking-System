import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import api from "../api/axios";
import Loader from "../components/Loader";
import { toast } from "react-toastify";

import RescheduleModal from "../components/RescheduleModal";

function RecruiterCalendar() {
    //------------------------------------------------
    // STATE
    //------------------------------------------------
    const [date, setDate] = useState(new Date());

    const [slots, setSlots] = useState([]);
    const [filteredSlots, setFilteredSlots] = useState([]);

    const [loading, setLoading] = useState(true);

    const [waitlistModal, setWaitlistModal] = useState(false);
    const [waitlistData, setWaitlistData] = useState([]);
    const [selectedSlotRole, setSelectedSlotRole] = useState("");

    const [rescheduleSlot, setRescheduleSlot] = useState(null);

    //------------------------------------------------
    // FETCH SLOTS
    //------------------------------------------------
    useEffect(() => {
        fetchSlots();
    }, []);

    //------------------------------------------------
    // FILTER BY DATE
    //------------------------------------------------
    useEffect(() => {
        filterSlotsByDate(date);
    }, [date, slots]);

    //------------------------------------------------
    const fetchSlots = async () => {
        try {
            setLoading(true);

            const res = await api.get("/slots");

            if (res.data.success) {
                setSlots(res.data.data);
            }
        } catch {
            toast.error("Failed to load slots");
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
    // VIEW WAITLIST
    //------------------------------------------------
    const handleViewWaitlist = async (slot) => {
        try {
            const res = await api.get(`/waitlist/${slot.id}`);

            if (res.data.success) {
                setWaitlistData(res.data.data);
                setSelectedSlotRole(slot.role);
                setWaitlistModal(true);
            }
        } catch {
            toast.error("Failed to load waitlist");
        }
    };

    //------------------------------------------------
    // DELETE SLOT
    //------------------------------------------------
    const handleDelete = async (slotId) => {
        if (!window.confirm("Delete this slot?")) return;

        try {
            await api.delete(`/slots/${slotId}`);

            toast.success("Slot deleted");

            fetchSlots();
        } catch (err) {
            toast.error(err.response?.data?.message);
        }
    };

    //------------------------------------------------
    // CALENDAR TILE INDICATOR
    //------------------------------------------------
    const tileContent = ({ date }) => {
        const hasSlots = slots.some(
            (slot) =>
                new Date(slot.start_time).toDateString() ===
                date.toDateString(),
        );

        return hasSlots ? (
            <div className="text-green-500 text-xs text-center">•</div>
        ) : null;
    };

    //------------------------------------------------
    if (loading) return <Loader />;

    //------------------------------------------------
    return (
        <div className="min-h-screen bg-gray-100 p-6">
            {/* HEADER */}
            <h1 className="text-2xl font-bold mb-4">Recruiter Calendar</h1>

            {/* CALENDAR */}
            <div className="bg-white p-4 rounded shadow mb-6">
                <Calendar
                    value={date}
                    onChange={setDate}
                    tileContent={tileContent}
                />
            </div>

            {/* SLOTS LIST */}
            <div>
                <h2 className="text-xl font-semibold mb-3">
                    Slots on {date.toDateString()}
                </h2>

                {filteredSlots.length === 0 && (
                    <div className="bg-white p-4 rounded shadow">
                        No slots on this day
                    </div>
                )}

                {filteredSlots.map((slot) => {
                    const available = slot.capacity - slot.booked_count;

                    const waitlistCount = Number(slot.waitlist_count || 0);

                    const isPast = new Date(slot.end_time) < new Date();

                    //------------------------------------------------
                    return (
                        <div
                            key={slot.id}
                            className={`bg-white p-4 mb-3 rounded shadow border-l-4 ${
                                isPast
                                    ? "border-gray-400"
                                    : available > 0
                                      ? "border-green-500"
                                      : "border-yellow-500"
                            }`}
                        >
                            {/* ROLE */}
                            <h3 className="text-lg font-bold">{slot.role}</h3>

                            {/* TIME */}
                            <p>
                                {new Date(slot.start_time).toLocaleTimeString()}{" "}
                                - {new Date(slot.end_time).toLocaleTimeString()}
                            </p>

                            {/* STATUS */}
                            <p>
                                Capacity: {slot.capacity} | Booked:{" "}
                                {slot.booked_count} | Available: {available}
                            </p>

                            <p>
                                Waitlist:{" "}
                                <span className="text-yellow-600 font-semibold">
                                    {waitlistCount}
                                </span>
                            </p>

                            {/* STATUS BADGE */}
                            <div className="mt-2">
                                {isPast && (
                                    <span className="bg-gray-500 text-white px-2 py-1 rounded text-sm">
                                        Completed
                                    </span>
                                )}

                                {!isPast && available > 0 && (
                                    <span className="bg-green-500 text-white px-2 py-1 rounded text-sm">
                                        Open
                                    </span>
                                )}

                                {!isPast && available === 0 && (
                                    <span className="bg-yellow-500 text-white px-2 py-1 rounded text-sm">
                                        Full
                                    </span>
                                )}
                            </div>

                            {/* ACTIONS */}
                            {!isPast && (
                                <div className="flex gap-2 mt-3 flex-wrap">
                                    {waitlistCount > 0 ? (
                                        <button
                                            onClick={() =>
                                                handleViewWaitlist(slot)
                                            }
                                            className="bg-yellow-500 text-white px-3 py-1 rounded"
                                        >
                                            View Waitlist
                                        </button>
                                    ) : (
                                        <button
                                            disabled
                                            className="bg-gray-400 text-white px-3 py-1 rounded"
                                        >
                                            No Waitlist
                                        </button>
                                    )}

                                    <button
                                        onClick={() => setRescheduleSlot(slot)}
                                        className="bg-blue-500 text-white px-3 py-1 rounded"
                                    >
                                        Reschedule
                                    </button>

                                    <button
                                        onClick={() => handleDelete(slot.id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* WAITLIST MODAL */}
            {waitlistModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded shadow w-96">
                        <h2 className="text-xl font-bold mb-4">
                            Waitlist — {selectedSlotRole}
                        </h2>

                        {waitlistData.length === 0 ? (
                            <p>No candidates</p>
                        ) : (
                            <ul className="space-y-2">
                                {waitlistData.map((c, index) => (
                                    <li
                                        key={c.id}
                                        className="border p-2 rounded"
                                    >
                                        #{index + 1} —{" "}
                                        {c.email || c.candidate_id}
                                    </li>
                                ))}
                            </ul>
                        )}

                        <button
                            onClick={() => setWaitlistModal(false)}
                            className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* RESCHEDULE MODAL */}
            {rescheduleSlot && (
                <RescheduleModal
                    slot={rescheduleSlot}
                    onClose={() => setRescheduleSlot(null)}
                    onSuccess={fetchSlots}
                />
            )}
        </div>
    );
}

export default RecruiterCalendar;
