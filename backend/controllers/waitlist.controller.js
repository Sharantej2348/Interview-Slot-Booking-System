import {
    joinWaitlistService,
    getWaitlistBySlotService,
    getMyWaitlistService,
    leaveWaitlistService
} from "../services/waitlist.service.js";

export const joinWaitlist = async (req, res) => {
    try {
        const candidateId = req.user.userId;

        const { slotId } = req.body;

        if (!slotId) {
            return res.status(400).json({
                success: false,
                message: "SlotId required",
            });
        }

        const result = await joinWaitlistService({
            slotId,
            candidateId,
        });

        res.status(201).json({
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

export const getWaitlistBySlot = async (req, res) => {
    try {
        const { slotId } = req.params;

        const waitlist = await getWaitlistBySlotService(slotId);

        res.json({
            success: true,
            data: waitlist,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getMyWaitlist = async (req, res) => {
    try {
        const candidateId = req.user.userId;

        const waitlist = await getMyWaitlistService(candidateId);

        res.json({
            success: true,
            data: waitlist,
        });
    } catch (error) {
        console.error("GET MY WAITLIST ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const leaveWaitlist = async (req, res) => {
    try {
        const candidateId = req.user.userId;
        const { slotId } = req.params;

        await leaveWaitlistService({
            slotId,
            candidateId,
        });

        res.json({
            success: true,
            message: "Left waitlist successfully",
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
