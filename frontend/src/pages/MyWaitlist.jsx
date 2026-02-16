import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import { useNavigate } from "react-router-dom";

function MyWaitlist() {
    const [waitlist, setWaitlist] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        fetchWaitlist();
    }, []);

    const fetchWaitlist = async () => {
        try {
            const res = await api.get("/waitlist/my-waitlist");

            if (res.data.success) {
                setWaitlist(res.data.data);
            }
        } catch (error) {
            toast.error("Failed to load waitlist");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold">My Waitlist</h1>

                <button
                    onClick={() => navigate("/candidate-dashboard")}
                    className="bg-gray-600 text-white px-4 py-2 rounded"
                >
                    Back
                </button>
            </div>

            {waitlist.length === 0 ? (
                <div className="bg-white p-6 rounded shadow text-center">
                    No waitlist entries
                </div>
            ) : (
                waitlist.map((item) => (
                    <div
                        key={item.id}
                        className="bg-white p-5 rounded shadow mb-4"
                    >
                        <h3 className="font-bold text-lg text-yellow-600">
                            WAITLISTED
                        </h3>

                        <p>Role: {item.role}</p>

                        <p>
                            Start: {new Date(item.start_time).toLocaleString()}
                        </p>

                        <p>End: {new Date(item.end_time).toLocaleString()}</p>

                        <p className="text-gray-500 text-sm">
                            Joined: {new Date(item.created_at).toLocaleString()}
                        </p>
                    </div>
                ))
            )}
        </div>
    );
}

export default MyWaitlist;
