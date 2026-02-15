import {
    createSlotService,
    getAllSlotsService,
    deleteSlotService,
} from "../services/slot.service.js";

export const createSlot = async (req, res) => {
    try {
        const interviewerId = req.user.userId;

        const { role, startTime, endTime, capacity } = req.body;

        if (!role || !startTime || !endTime || !capacity) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }

        const slot = await createSlotService({
            interviewerId,
            role,
            startTime,
            endTime,
            capacity,
        });

        res.status(201).json({
            success: true,
            data: slot,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const getAllSlots = async (req, res) => {
    try {
        const slots = await getAllSlotsService();

        res.json({
            success: true,
            data: slots,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const deleteSlot = async (req, res) => {
    try {
        const { slotId } = req.params;

        const recruiterId = req.user.userId;

        await deleteSlotService(slotId, recruiterId);

        res.json({
            success: true,
            message: "Slot deleted successfully",
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
