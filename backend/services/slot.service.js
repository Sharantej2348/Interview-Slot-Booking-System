import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export const createSlotService = async ({
    interviewerId,
    role,
    startTime,
    endTime,
    capacity,
}) => {
    if (new Date(startTime) >= new Date(endTime)) {
        throw new Error("Invalid time range");
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // 🔥 Conflict Detection
        const conflictCheck = await client.query(
            `
      SELECT 1 FROM slots
      WHERE interviewer_id = $1
      AND start_time < $2
      AND end_time > $3
      `,
            [interviewerId, endTime, startTime],
        );

        if (conflictCheck.rows.length > 0) {
            throw new Error("Interviewer schedule conflict");
        }

        const newSlot = await client.query(
            `
      INSERT INTO slots
      (id, interviewer_id, role, start_time, end_time, capacity)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
            [uuidv4(), interviewerId, role, startTime, endTime, capacity],
        );

        await client.query("COMMIT");

        return newSlot.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

export const getAllSlotsService = async () => {
    const result = await pool.query(`
    SELECT 
      id,
      interviewer_id,
      role,
      start_time,
      end_time,
      capacity,
      booked_count,
      (capacity - booked_count) AS available_seats
    FROM slots
    ORDER BY start_time ASC
  `);

    return result.rows;
};

export const deleteSlotService = async (slotId) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Check if slot exists
        const slot = await client.query(`SELECT id FROM slots WHERE id = $1`, [
            slotId,
        ]);

        if (slot.rows.length === 0) {
            throw new Error("Slot not found");
        }

        // Delete related bookings first
        await client.query(`DELETE FROM bookings WHERE slot_id = $1`, [slotId]);

        // Delete waitlist entries
        await client.query(`DELETE FROM waitlist WHERE slot_id = $1`, [slotId]);

        // Delete slot
        await client.query(`DELETE FROM slots WHERE id = $1`, [slotId]);

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};
