import express from "express";
import cors from "cors";
import slotRoutes from "./routes/slot.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import waitlistRoutes from "./routes/waitlist.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "https://interview-slot-booking-system-front.vercel.app",
        ],
        credentials: true,
    }),
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/waitlist", waitlistRoutes);

export default app;
