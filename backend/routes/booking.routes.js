import express from "express";
import { createBooking, cancelBooking } from "../controllers/booking.controller.js";

const router = express.Router();

router.post("/", createBooking);
router.post("/cancel", cancelBooking);

export default router;
