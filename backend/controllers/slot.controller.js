import { createSlotService } from "../services/slot.service.js";

export const createSlot = async (req, res) => {
  try {
    const slot = await createSlotService(req.body);

    res.status(201).json({
      success: true,
      data: slot
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
