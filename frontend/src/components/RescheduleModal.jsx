import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";

function RescheduleModal({ slot, onClose, onSuccess }) {
    //------------------------------------------------
    // Convert ISO → datetime-local
    //------------------------------------------------
    const formatDatetimeLocal = (isoString) => {
        const date = new Date(isoString);

        const pad = (n) => String(n).padStart(2, "0");

        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    //------------------------------------------------
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [loading, setLoading] = useState(false);

    //------------------------------------------------
    // Initialize values when modal opens
    //------------------------------------------------
    useEffect(() => {
        if (slot) {
            setStartTime(formatDatetimeLocal(slot.start_time));
            setEndTime(formatDatetimeLocal(slot.end_time));
        }
    }, [slot]);

    //------------------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            await api.put(`/slots/${slot.id}/reschedule`, {
                startTime: new Date(startTime).toISOString(),
                endTime: new Date(endTime).toISOString(),
            });

            toast.success("Slot rescheduled successfully");

            onSuccess(); // refresh dashboard
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Reschedule failed");
        } finally {
            setLoading(false);
        }
    };

    //------------------------------------------------
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
            <div className="bg-white p-6 rounded shadow w-96">
                <h2 className="text-xl font-bold mb-4">
                    Reschedule Slot — {slot.role}
                </h2>

                <form onSubmit={handleSubmit}>
                    <label className="block mb-2 font-medium">
                        New Start Time
                    </label>

                    <input
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full mb-4 p-2 border rounded"
                        required
                    />

                    <label className="block mb-2 font-medium">
                        New End Time
                    </label>

                    <input
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full mb-4 p-2 border rounded"
                        required
                    />

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-500 text-white px-4 py-2 rounded"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-4 py-2 rounded"
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default RescheduleModal;
