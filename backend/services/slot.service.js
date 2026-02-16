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

        /*
        Prevent overlapping slots for recruiter
        */
        const conflictCheck = await client.query(
            `
            SELECT id FROM slots
            WHERE interviewer_id = $1
            AND start_time < $2
            AND end_time > $3
            `,
            [interviewerId, endTime, startTime],
        );

        if (conflictCheck.rows.length > 0) {
            throw new Error("Schedule conflict");
        }

        /*
        Insert slot
        */
        const result = await client.query(
            `
            INSERT INTO slots
            (
                id,
                interviewer_id,
                role,
                start_time,
                end_time,
                capacity,
                booked_count,
                created_at
            )
            VALUES ($1,$2,$3,$4,$5,$6,0,NOW())
            RETURNING *
            `,
            [uuidv4(), interviewerId, role, startTime, endTime, capacity],
        );

        await client.query("COMMIT");

        return result.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

export const getAllSlotsService = async () => {
    const result = await pool.query(
        `
        SELECT
            s.id,
            s.interviewer_id,
            s.role,
            s.start_time,
            s.end_time,
            s.capacity,
            s.booked_count,
            (s.capacity - s.booked_count) AS available_seats,
            COUNT(w.id) AS waitlist_count
        FROM slots s
        LEFT JOIN waitlist w
        ON s.id = w.slot_id
        GROUP BY s.id
        ORDER BY s.start_time ASC
        `,
    );

    return result.rows;
};

export const deleteSlotService = async (slotId, recruiterId) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        /*
        Verify slot exists AND belongs to recruiter
        */
        const slotResult = await client.query(
            `
            SELECT id
            FROM slots
            WHERE id = $1
            AND interviewer_id = $2
            `,
            [slotId, recruiterId],
        );

        if (slotResult.rows.length === 0) {
            throw new Error("Unauthorized");
        }

        /*
        Delete bookings
        */
        await client.query("DELETE FROM bookings WHERE slot_id = $1", [slotId]);

        /*
        Delete waitlist
        */
        await client.query("DELETE FROM waitlist WHERE slot_id = $1", [slotId]);

        /*
        Delete slot
        */
        await client.query("DELETE FROM slots WHERE id = $1", [slotId]);

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");

        throw error;
    } finally {
        client.release();
    }
};
