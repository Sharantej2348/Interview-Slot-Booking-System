import express from "express";

import {
    joinWaitlist,
    getWaitlistBySlot,
    getMyWaitlist,
    leaveWaitlist,
} from "../controllers/waitlist.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/", authenticate, authorize(["candidate"]), joinWaitlist);

router.delete(
    "/:slotId",
    authenticate,
    authorize(["candidate"]),
    leaveWaitlist,
);

router.get(
    "/my-waitlist",
    authenticate,
    authorize(["candidate"]),
    getMyWaitlist,
);

router.get(
    "/:slotId",
    authenticate,
    authorize(["candidate", "recruiter"]),
    getWaitlistBySlot,
);

export default router;
