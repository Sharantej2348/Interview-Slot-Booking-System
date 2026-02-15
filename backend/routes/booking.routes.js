import express from "express";

import {
    createBooking,
    cancelBooking,
    getMyBookings,
} from "../controllers/booking.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = express.Router();

/*
Candidate only routes
*/

router.post(
    "/",
    authenticate,
    authorize(["candidate"]),
    createBooking
);

router.delete(
    "/:bookingId",
    authenticate,
    authorize(["candidate"]),
    cancelBooking
);

router.get(
    "/my-bookings",
    authenticate,
    authorize(["candidate"]),
    getMyBookings
);

export default router;
