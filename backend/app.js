import express from "express";
import cors from "cors";
import slotRoutes from './routes/slot.routes.js'
import bookingRoutes from "./routes/booking.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/slots", slotRoutes);
app.use("/api/bookings", bookingRoutes);

export default app;
