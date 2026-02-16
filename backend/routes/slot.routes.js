import express from "express";

import {
    createSlot,
    getAllSlots,
    deleteSlot,
    rescheduleSlot
} from "../controllers/slot.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/", authenticate, authorize(["recruiter"]), createSlot);

router.get(
    "/",
    authenticate,
    authorize(["candidate", "recruiter"]),
    getAllSlots,
);

router.delete("/:slotId", authenticate, authorize(["recruiter"]), deleteSlot);

router.put(
    "/:slotId/reschedule",
    authenticate,
    authorize(["recruiter"]),
    rescheduleSlot,
);

export default router;
