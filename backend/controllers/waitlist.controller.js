import {
    joinWaitlistService,
    getWaitlistBySlotService,
} from "../services/waitlist.service.js";

export const joinWaitlist = async (req, res) => {
    try {
        const result = await joinWaitlistService(req.body);

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

        res.status(200).json({
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
