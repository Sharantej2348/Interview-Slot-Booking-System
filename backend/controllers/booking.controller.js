import {
    createBookingService,
    cancelBookingService,
    getBookingsByCandidateService,
} from "../services/booking.service.js";

export const createBooking = async (req, res) => {
    try {
        const { slotId, candidateId, idempotencyKey } = req.body;

        if (!slotId || !candidateId || !idempotencyKey) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }

        const booking = await createBookingService({
            slotId,
            candidateId,
            idempotencyKey,
        });

        res.status(201).json({
            success: true,
            data: booking,
        });
    } catch (error) {
        if (error.message === "ALREADY_BOOKED") {
            return res.status(409).json({
                success: false,
                message: "Already booked this slot",
            });
        }

        if (error.message === "SLOT_FULL") {
            return res.status(409).json({
                success: false,
                message: "Slot full",
            });
        }

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;

        await cancelBookingService(bookingId);

        res.json({
            success: true,
            message: "Booking cancelled",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getBookingsByCandidate = async (req, res) => {
    try {
        const { candidateId } = req.params;

        const bookings = await getBookingsByCandidateService(candidateId);

        res.json({
            success: true,
            data: bookings,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
