import {
    createBookingService,
    cancelBookingService,
    getBookingsByCandidateService,
} from "../services/booking.service.js";

/*
Create Booking
Candidate ID comes from JWT
*/
export const createBooking = async (req, res) => {
    try {
        const { slotId, idempotencyKey } = req.body;

        const candidateId = req.user.userId;

        if (!slotId || !idempotencyKey) {
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
                message: "Slot is full",
            });
        }

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/*
Cancel Booking
*/
export const cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;

        await cancelBookingService(bookingId);

        res.json({
            success: true,
            message: "Booking cancelled successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/*
Get My Bookings
Candidate ID comes from JWT
*/
export const getMyBookings = async (req, res) => {
    try {
        const candidateId = req.user.userId;

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

