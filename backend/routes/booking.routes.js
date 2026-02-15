import express from "express";
import {
    createBooking,
    cancelBooking,
    getBookingsByCandidate,
} from "../controllers/booking.controller.js";
import { checkRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/", checkRole(["candidate"]), createBooking);
router.post("/cancel", checkRole(["candidate"]), cancelBooking);
router.get("/", getBookingsByCandidate);

export default router;
