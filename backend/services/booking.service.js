import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export const createBookingService = async ({
    slotId,
    candidateId,
    idempotencyKey,
}) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Check duplicate booking
        const existing = await client.query(
            `SELECT 1 FROM bookings
             WHERE slot_id=$1 AND candidate_id=$2`,
            [slotId, candidateId],
        );

        if (existing.rows.length > 0) {
            throw new Error("ALREADY_BOOKED");
        }

        // Check slot availability
        const slot = await client.query(
            `SELECT capacity, booked_count
             FROM slots WHERE id=$1 FOR UPDATE`,
            [slotId],
        );

        if (slot.rows.length === 0) {
            throw new Error("Slot not found");
        }

        const { capacity, booked_count } = slot.rows[0];

        if (booked_count >= capacity) {
            throw new Error("SLOT_FULL");
        }

        // Create booking
        const booking = await client.query(
            `INSERT INTO bookings
            (id, slot_id, candidate_id, idempotency_key)
            VALUES ($1,$2,$3,$4)
            RETURNING *`,
            [uuidv4(), slotId, candidateId, idempotencyKey],
        );

        // Update slot count
        await client.query(
            `UPDATE slots
             SET booked_count = booked_count + 1
             WHERE id=$1`,
            [slotId],
        );

        await client.query("COMMIT");

        return booking.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

export const cancelBookingService = async (bookingId) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const booking = await client.query(
            `DELETE FROM bookings
             WHERE id=$1
             RETURNING slot_id`,
            [bookingId],
        );

        if (booking.rows.length === 0) {
            throw new Error("Booking not found");
        }

        const slotId = booking.rows[0].slot_id;

        await client.query(
            `UPDATE slots
             SET booked_count = booked_count - 1
             WHERE id=$1`,
            [slotId],
        );

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

export const getBookingsByCandidateService = async (candidateId) => {
    const result = await pool.query(
        `
        SELECT b.id,
               s.role,
               s.start_time,
               s.end_time
        FROM bookings b
        JOIN slots s ON b.slot_id = s.id
        WHERE b.candidate_id=$1
        ORDER BY s.start_time
        `,
        [candidateId],
    );

    return result.rows;
};
