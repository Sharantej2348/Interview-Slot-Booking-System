import express from "express";
import {
    createBooking,
    cancelBooking,
    getBookingsByCandidate,
} from "../controllers/booking.controller.js";

import { checkRole } from "../middlewares/role.middleware.js";

const router = express.Router();

// Create booking
router.post("/", checkRole(["candidate"]), createBooking);

// Cancel booking
router.delete("/:bookingId", checkRole(["candidate"]), cancelBooking);

// Get candidate bookings
router.get(
    "/candidate/:candidateId",
    checkRole(["candidate"]),
    getBookingsByCandidate,
);

export default router;
