import {
    createBookingService,
    cancelBookingService,
    getBookingsByCandidateService,
} from "../services/booking.service.js";

export const createBooking = async (req, res) => {
    try {
        const booking = await createBookingService(req.body);

        res.status(201).json({
            success: true,
            data: booking,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const cancelBooking = async (req, res) => {
    try {
        const result = await cancelBookingService(req.body);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const getBookingsByCandidate = async (req, res) => {
    try {
        const { candidateId } = req.query;

        const bookings = await getBookingsByCandidateService(candidateId);

        res.status(200).json({
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
