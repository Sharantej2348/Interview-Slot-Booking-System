import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function CreateSlotPage() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    interviewerId: "",
    role: "",
    startTime: "",
    endTime: "",
    capacity: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await api.post(
        "/slots",
        {
          interviewerId: form.interviewerId,
          role: form.role,
          startTime: form.startTime,
          endTime: form.endTime,
          capacity: Number(form.capacity)
        },
        {
          headers: {
            role: "recruiter"
          }
        }
      );

      alert("Slot created successfully");

      navigate("/recruiter-dashboard");

    } catch (err) {

      alert(err.response?.data?.message || "Error creating slot");

    }
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow w-96"
      >

        <h2 className="text-2xl font-bold mb-6">
          Create Interview Slot
        </h2>

        <input
          name="interviewerId"
          placeholder="Interviewer ID"
          onChange={handleChange}
          className="w-full mb-4 p-2 border rounded"
          required
        />

        <input
          name="role"
          placeholder="Role"
          onChange={handleChange}
          className="w-full mb-4 p-2 border rounded"
          required
        />

        <input
          type="datetime-local"
          name="startTime"
          onChange={handleChange}
          className="w-full mb-4 p-2 border rounded"
          required
        />

        <input
          type="datetime-local"
          name="endTime"
          onChange={handleChange}
          className="w-full mb-4 p-2 border rounded"
          required
        />

        <input
          type="number"
          name="capacity"
          placeholder="Capacity"
          onChange={handleChange}
          className="w-full mb-4 p-2 border rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Create Slot
        </button>

      </form>

    </div>
  );
}

export default CreateSlotPage;
