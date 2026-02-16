import {
    createSlotService,
    getAllSlotsService,
    deleteSlotService,
    rescheduleSlotService
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
        console.error("DELETE SLOT ERROR:", error.message);

        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const rescheduleSlot = async (req, res) => {
    try {
        const { slotId } = req.params;
        const recruiterId = req.user.userId;

        const { startTime, endTime } = req.body;

        if (!startTime || !endTime) {
            return res.status(400).json({
                success: false,
                message: "startTime and endTime required",
            });
        }

        const updatedSlot = await rescheduleSlotService({
            slotId,
            recruiterId,
            startTime,
            endTime,
        });

        res.json({
            success: true,
            data: updatedSlot,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
