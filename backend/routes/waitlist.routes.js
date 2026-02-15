import express from "express";
import {
    joinWaitlist,
    getWaitlistBySlot,
} from "../controllers/waitlist.controller.js";
import { checkRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/", checkRole(["candidate"]), joinWaitlist);
router.get("/:slotId", getWaitlistBySlot);

export default router;
