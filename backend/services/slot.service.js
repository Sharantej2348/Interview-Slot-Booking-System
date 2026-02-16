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

export const rescheduleSlotService = async ({
    slotId,
    recruiterId,
    startTime,
    endTime,
}) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        //------------------------------------------------
        // 1. Lock and validate slot ownership
        //------------------------------------------------
        const slotResult = await client.query(
            `
            SELECT *
            FROM slots
            WHERE id = $1
            AND interviewer_id = $2
            FOR UPDATE
            `,
            [slotId, recruiterId],
        );

        if (slotResult.rows.length === 0)
            throw new Error("Slot not found or unauthorized");

        const existingSlot = slotResult.rows[0];

        //------------------------------------------------
        // 2. Validate time range
        //------------------------------------------------
        if (new Date(startTime) >= new Date(endTime))
            throw new Error("Invalid time range");

        //------------------------------------------------
        // 3. Prevent past scheduling
        //------------------------------------------------
        if (new Date(startTime) < new Date())
            throw new Error("Cannot reschedule to past time");

        //------------------------------------------------
        // 4. Prevent conflict with other slots
        //------------------------------------------------
        const conflictCheck = await client.query(
            `
            SELECT id
            FROM slots
            WHERE interviewer_id = $1
            AND id != $2
            AND start_time < $3
            AND end_time > $4
            `,
            [recruiterId, slotId, endTime, startTime],
        );

        if (conflictCheck.rows.length > 0)
            throw new Error("Schedule conflict with another slot");

        //------------------------------------------------
        // 5. Protect existing bookings
        //------------------------------------------------
        const bookingCheck = await client.query(
            `
            SELECT COUNT(*) as count
            FROM bookings
            WHERE slot_id = $1
            `,
            [slotId],
        );

        const bookingCount = parseInt(bookingCheck.rows[0].count);

        if (bookingCount > 0) {
            const oldStart = new Date(existingSlot.start_time);
            const oldEnd = new Date(existingSlot.end_time);

            const newStart = new Date(startTime);
            const newEnd = new Date(endTime);

            const shiftHours = Math.abs(newStart - oldStart) / (1000 * 60 * 60);

            /*
            Business rule: restrict excessive change
            */
            if (shiftHours > 4)
                throw new Error(
                    "Cannot reschedule significantly — candidates already booked",
                );
        }

        //------------------------------------------------
        // 6. Update slot
        //------------------------------------------------
        const updatedSlot = await client.query(
            `
            UPDATE slots
            SET start_time = $1,
                end_time   = $2
            WHERE id = $3
            RETURNING *
            `,
            [startTime, endTime, slotId],
        );

        await client.query("COMMIT");

        return updatedSlot.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};
