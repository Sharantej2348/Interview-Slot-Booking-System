import {
    createSlotService,
    getAllSlotsService,
} from "../services/slot.service.js";

export const createSlot = async (req, res) => {
    try {
        const slot = await createSlotService(req.body);

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

        res.status(200).json({
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

import { deleteSlotService } from "../services/slot.service.js";

export const deleteSlot = async (req, res) => {
    try {
        const { slotId } = req.params;

        await deleteSlotService(slotId);

        res.json({
            success: true,
            message: "Slot deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
