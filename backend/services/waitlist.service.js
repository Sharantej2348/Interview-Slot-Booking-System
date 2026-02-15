import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export const joinWaitlistService = async ({ slotId, candidateId }) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Step 1: Check slot exists
        const slotResult = await client.query(
            "SELECT * FROM slots WHERE id = $1",
            [slotId],
        );

        if (slotResult.rows.length === 0) {
            throw new Error("Slot not found");
        }

        // Step 2: Check already booked
        const bookingCheck = await client.query(
            `
      SELECT * FROM bookings
      WHERE slot_id = $1
      AND candidate_id = $2
      AND status = 'confirmed'
      `,
            [slotId, candidateId],
        );

        if (bookingCheck.rows.length > 0) {
            throw new Error("Candidate already booked");
        }

        // Step 3: Check already in waitlist
        const waitlistCheck = await client.query(
            `
      SELECT * FROM waitlist
      WHERE slot_id = $1
      AND candidate_id = $2
      `,
            [slotId, candidateId],
        );

        if (waitlistCheck.rows.length > 0) {
            throw new Error("Candidate already in waitlist");
        }

        // Step 4: Insert into waitlist
        const waitlistEntry = await client.query(
            `
      INSERT INTO waitlist
      (id, slot_id, candidate_id)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
            [uuidv4(), slotId, candidateId],
        );

        await client.query("COMMIT");

        return waitlistEntry.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

export const getWaitlistBySlotService = async (slotId) => {
    const result = await pool.query(
        `
    SELECT 
      id,
      slot_id,
      candidate_id,
      created_at
    FROM waitlist
    WHERE slot_id = $1
    ORDER BY created_at ASC
    `,
        [slotId],
    );

    return result.rows;
};
