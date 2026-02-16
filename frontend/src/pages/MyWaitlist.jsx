import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import { useNavigate } from "react-router-dom";

function MyWaitlist() {
    const navigate = useNavigate();

    const [waitlist, setWaitlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [leavingId, setLeavingId] = useState(null);

    //------------------------------------------------
    useEffect(() => {
        fetchWaitlist();
    }, []);

    //------------------------------------------------
    const fetchWaitlist = async () => {
        try {
            setLoading(true);

            const res = await api.get("/waitlist/my-waitlist");

            if (res.data.success) {
                setWaitlist(res.data.data);
            }
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to load waitlist",
            );
        } finally {
            setLoading(false);
        }
    };

    //------------------------------------------------
    const handleLeaveWaitlist = async (slotId) => {
        try {
            setLeavingId(slotId);

            await api.delete(`/waitlist/${slotId}`);

            toast.success("Removed from waitlist");

            // Refresh waitlist
            fetchWaitlist();
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to leave waitlist",
            );
        } finally {
            setLeavingId(null);
        }
    };

    //------------------------------------------------
    if (loading) return <Loader />;

    //------------------------------------------------
    return (
        <div className="min-h-screen bg-gray-100 p-6">
            {/* Header */}
            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold">My Waitlist</h1>

                <button
                    onClick={() => navigate("/candidate-dashboard")}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                >
                    Back
                </button>
            </div>

            {/* Empty state */}
            {waitlist.length === 0 ? (
                <div className="bg-white p-6 rounded shadow text-center text-gray-500">
                    You are not in any waitlist
                </div>
            ) : (
                <div className="space-y-4">
                    {waitlist.map((item) => (
                        <div
                            key={item.slot_id}
                            className="bg-white p-5 rounded shadow border-l-4 border-yellow-500"
                        >
                            {/* Status */}
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-yellow-600">
                                    WAITLISTED
                                </span>

                                {/* Position badge */}
                                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm font-semibold">
                                    Position #{item.position}
                                </span>
                            </div>

                            {/* Slot details */}
                            <h3 className="text-lg font-bold mb-1">
                                {item.role}
                            </h3>

                            <p>
                                Start:{" "}
                                {new Date(item.start_time).toLocaleString()}
                            </p>

                            <p>
                                End: {new Date(item.end_time).toLocaleString()}
                            </p>

                            <p className="text-gray-500 text-sm mt-1">
                                Joined:{" "}
                                {new Date(item.created_at).toLocaleString()}
                            </p>

                            {/* Leave button */}
                            <button
                                onClick={() =>
                                    handleLeaveWaitlist(item.slot_id)
                                }
                                disabled={leavingId === item.slot_id}
                                className="mt-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
                            >
                                {leavingId === item.slot_id
                                    ? "Leaving..."
                                    : "Leave Waitlist"}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyWaitlist;
