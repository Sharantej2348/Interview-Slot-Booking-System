import React, { useEffect, useState } from "react";
import api from "../api/axios";

function SlotsPage() {
    const [slots, setSlots] = useState([]);

    const role = localStorage.getItem("role");

    useEffect(() => {
        fetchSlots();
    }, []);

    const fetchSlots = async () => {
        const res = await api.get("/slots");
        setSlots(res.data.data);
    };

    const bookSlot = async (slotId) => {
        try {
            await api.post(
                "/bookings",
                {
                    slotId,
                    candidateId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
                    idempotencyKey: Date.now().toString(),
                },
                {
                    headers: { role },
                },
            );

            alert("Booked successfully");
            fetchSlots();
        } catch (err) {
            alert(err.response.data.message);
        }
    };

    const joinWaitlist = async (slotId) => {
        try {
            await api.post(
                "/waitlist",
                {
                    slotId,
                    candidateId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
                },
                {
                    headers: { role },
                },
            );

            alert("Joined waitlist");
        } catch (err) {
            alert(err.response.data.message);
        }
    };

    const logout = () => {
        localStorage.removeItem("role");
        window.location.reload();
    };

    return (
        <div className="p-10">
            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold">Interview Slots ({role})</h1>

                <button
                    onClick={logout}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                >
                    Change Role
                </button>
            </div>

            {slots.map((slot) => (
                <div key={slot.id} className="border p-4 mb-4 rounded">
                    <p>
                        <b>Role:</b> {slot.role}
                    </p>
                    <p>
                        <b>Start:</b> {slot.start_time}
                    </p>
                    <p>
                        <b>End:</b> {slot.end_time}
                    </p>
                    <p>
                        <b>Available Seats:</b> {slot.available_seats}
                    </p>

                    {role === "candidate" && slot.available_seats > 0 && (
                        <button
                            onClick={() => bookSlot(slot.id)}
                            className="bg-green-500 text-white px-4 py-2 mt-2 mr-2 rounded"
                        >
                            Book Slot
                        </button>
                    )}

                    {role === "candidate" && slot.available_seats === 0 && (
                        <button
                            onClick={() => joinWaitlist(slot.id)}
                            className="bg-yellow-500 text-white px-4 py-2 mt-2 rounded"
                        >
                            Join Waitlist
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}

export default SlotsPage;
