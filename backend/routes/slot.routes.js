import express from "express";
import { createSlot, getAllSlots } from "../controllers/slot.controller.js";
import { checkRole } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/", checkRole(["recruiter"]), createSlot);
router.get("/", getAllSlots);

export default router;
