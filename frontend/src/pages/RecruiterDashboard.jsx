import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RescheduleModal from "../components/RescheduleModal";

function RecruiterDashboard() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);

    //------------------------------------------------
    // Waitlist Modal
    //------------------------------------------------
    const [waitlistModal, setWaitlistModal] = useState(false);
    const [waitlistData, setWaitlistData] = useState([]);
    const [selectedSlotRole, setSelectedSlotRole] = useState("");

    //------------------------------------------------
    // Reschedule Modal
    //------------------------------------------------
    const [rescheduleModal, setRescheduleModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);

    //------------------------------------------------
    // Waitlist counts
    //------------------------------------------------
    const [waitlistCounts, setWaitlistCounts] = useState({});

    //------------------------------------------------
    useEffect(() => {
        fetchSlots();
    }, []);

    //------------------------------------------------
    const fetchSlots = async () => {
        try {
            setLoading(true);

            const res = await api.get("/slots");

            if (res.data.success) {
                const slotData = res.data.data;
                setSlots(slotData);

                fetchWaitlistCounts(slotData);
            }
        } catch {
            toast.error("Failed to load slots");
        } finally {
            setLoading(false);
        }
    };

    //------------------------------------------------
    const fetchWaitlistCounts = async (slotData) => {
        try {
            const counts = {};

            await Promise.all(
                slotData.map(async (slot) => {
                    try {
                        const res = await api.get(`/waitlist/${slot.id}`);
                        counts[slot.id] = res.data.data.length;
                    } catch {
                        counts[slot.id] = 0;
                    }
                }),
            );

            setWaitlistCounts(counts);
        } catch (err) {
            console.error(err);
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
            toast.error(err.response?.data?.message || "Delete failed");
        }
    };

    //------------------------------------------------
    // VIEW WAITLIST
    //------------------------------------------------
    const handleViewWaitlist = async (slotId, role) => {
        try {
            const res = await api.get(`/waitlist/${slotId}`);

            if (res.data.success) {
                setWaitlistData(res.data.data);
                setSelectedSlotRole(role);
                setWaitlistModal(true);
            }
        } catch {
            toast.error("Failed to load waitlist");
        }
    };

    //------------------------------------------------
    // OPEN RESCHEDULE MODAL
    //------------------------------------------------
    const openRescheduleModal = (slot) => {
        setSelectedSlot(slot);
        setRescheduleModal(true);
    };

    //------------------------------------------------
    if (loading) return <Loader />;

    //------------------------------------------------
    return (
        <div className="min-h-screen bg-gray-100 p-6">
            {/* HEADER */}
            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold">Recruiter Dashboard</h1>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate("/create-slot")}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Create Slot
                    </button>

                    <button
                        onClick={() => navigate("/recruiter-calendar")}
                        className="bg-purple-600 text-white px-4 py-2 rounded"
                    >
                        Calendar View
                    </button>
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white p-6 rounded shadow">
                <h2 className="text-xl font-bold mb-4">All Slots</h2>

                <table className="w-full">
                    <thead>
                        <tr className="border-b text-left">
                            <th>Role</th>
                            <th>Start</th>
                            <th>End</th>
                            <th>Capacity</th>
                            <th>Booked</th>
                            <th>Waitlist</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {slots.map((slot) => {
                            const waitlistCount = waitlistCounts[slot.id] || 0;

                            return (
                                <tr key={slot.id} className="border-b">
                                    <td>{slot.role}</td>

                                    <td>
                                        {new Date(
                                            slot.start_time,
                                        ).toLocaleString()}
                                    </td>

                                    <td>
                                        {new Date(
                                            slot.end_time,
                                        ).toLocaleString()}
                                    </td>

                                    <td>{slot.capacity}</td>

                                    <td>{slot.booked_count}</td>

                                    <td className="text-yellow-600 font-semibold">
                                        {waitlistCount}
                                    </td>

                                    <td className="flex gap-2 py-2">
                                        {waitlistCount > 0 ? (
                                            <button
                                                onClick={() =>
                                                    handleViewWaitlist(
                                                        slot.id,
                                                        slot.role,
                                                    )
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
                                            onClick={() =>
                                                openRescheduleModal(slot)
                                            }
                                            className="bg-blue-500 text-white px-3 py-1 rounded"
                                        >
                                            Reschedule
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleDelete(slot.id)
                                            }
                                            className="bg-red-500 text-white px-3 py-1 rounded"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
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
            {rescheduleModal && selectedSlot && (
                <RescheduleModal
                    slot={selectedSlot}
                    onClose={() => setRescheduleModal(false)}
                    onSuccess={fetchSlots}
                />
            )}
        </div>
    );
}

export default RecruiterDashboard;
