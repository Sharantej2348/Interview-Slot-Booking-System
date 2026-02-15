import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { getMe } from "../controllers/auth.controller.js";

import { register, login } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/me", authenticate, getMe);

export default router;
