import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";
import { promoteFromWaitlistService } from "./waitlist.service.js";

export const createBookingService = async ({
    slotId,
    candidateId,
    idempotencyKey,
}) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        /*
        1. Check if candidate already booked this slot
        */
        const existingBooking = await client.query(
            `
            SELECT id
            FROM bookings
            WHERE slot_id = $1
            AND candidate_id = $2
            `,
            [slotId, candidateId],
        );

        if (existingBooking.rows.length > 0) {
            throw new Error("ALREADY_BOOKED");
        }

        /*
        2. Lock slot row to prevent race condition
        */
        const slotResult = await client.query(
            `
            SELECT capacity, booked_count
            FROM slots
            WHERE id = $1
            FOR UPDATE
            `,
            [slotId],
        );

        if (slotResult.rows.length === 0) {
            throw new Error("Slot not found");
        }

        const { capacity, booked_count } = slotResult.rows[0];

        /*
        3. Check if slot is full
        */
        if (booked_count >= capacity) {
            throw new Error("SLOT_FULL");
        }

        /*
        4. Create booking
        */
        const bookingResult = await client.query(
            `
            INSERT INTO bookings
            (
                id,
                slot_id,
                candidate_id,
                status,
                idempotency_key,
                created_at
            )
            VALUES ($1,$2,$3,$4,$5,NOW())
            RETURNING *
            `,
            [uuidv4(), slotId, candidateId, "confirmed", idempotencyKey],
        );

        /*
        5. Update slot booked_count
        */
        await client.query(
            `
            UPDATE slots
            SET booked_count = booked_count + 1
            WHERE id = $1
            `,
            [slotId],
        );

        await client.query("COMMIT");

        return bookingResult.rows[0];
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

        /*
        Delete booking
        */
        const booking = await client.query(
            `
            DELETE FROM bookings
            WHERE id=$1
            RETURNING slot_id
            `,
            [bookingId],
        );

        if (booking.rows.length === 0) {
            throw new Error("Booking not found");
        }

        const slotId = booking.rows[0].slot_id;

        /*
        Reduce booked_count
        */
        await client.query(
            `
            UPDATE slots
            SET booked_count = booked_count - 1
            WHERE id=$1
            `,
            [slotId],
        );

        /*
        Promote from waitlist automatically
        */
        await promoteFromWaitlistService(slotId, client);

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
        SELECT
            b.id,
            b.status,
            b.created_at,

            s.id AS slot_id,
            s.role,
            s.start_time,
            s.end_time,
            s.interviewer_id

        FROM bookings b

        JOIN slots s
        ON b.slot_id = s.id

        WHERE b.candidate_id = $1

        ORDER BY s.start_time ASC
        `,
        [candidateId],
    );

    return result.rows;
};
