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

        // 1️⃣ Idempotency check
        if (idempotencyKey) {
            const existing = await client.query(
                "SELECT * FROM bookings WHERE idempotency_key = $1",
                [idempotencyKey],
            );

            if (existing.rows.length > 0) {
                await client.query("COMMIT");
                return existing.rows[0];
            }
        }

        // 2️⃣ Lock slot row
        const slotRes = await client.query(
            "SELECT * FROM slots WHERE id = $1 FOR UPDATE",
            [slotId],
        );

        if (slotRes.rows.length === 0) {
            throw new Error("Slot not found");
        }

        const slot = slotRes.rows[0];

        // 3️⃣ Capacity check
        if (slot.booked_count >= slot.capacity) {
            throw new Error("Slot is full");
        }

        // 4️⃣ Insert booking
        const booking = await client.query(
            `
      INSERT INTO bookings
      (id, slot_id, candidate_id, status, idempotency_key)
      VALUES ($1, $2, $3, 'confirmed', $4)
      RETURNING *
      `,
            [uuidv4(), slotId, candidateId, idempotencyKey || null],
        );

        // 5️⃣ Update slot count
        await client.query(
            `
      UPDATE slots
      SET booked_count = booked_count + 1
      WHERE id = $1
      `,
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

export const cancelBookingService = async ({ slotId, candidateId }) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // 1️⃣ Lock slot row
        const slotRes = await client.query(
            "SELECT * FROM slots WHERE id = $1 FOR UPDATE",
            [slotId],
        );

        if (slotRes.rows.length === 0) {
            throw new Error("Slot not found");
        }

        // 2️⃣ Mark booking cancelled
        const bookingRes = await client.query(
            `
      UPDATE bookings
      SET status = 'cancelled'
      WHERE slot_id = $1 AND candidate_id = $2 AND status = 'confirmed'
      RETURNING *
      `,
            [slotId, candidateId],
        );

        if (bookingRes.rows.length === 0) {
            throw new Error("Confirmed booking not found");
        }

        // 3️⃣ Decrement seat count
        await client.query(
            `
      UPDATE slots
      SET booked_count = booked_count - 1
      WHERE id = $1
      `,
            [slotId],
        );

        // 4️⃣ Check waitlist
        const waitlistRes = await client.query(
            `
      SELECT * FROM waitlist
      WHERE slot_id = $1
      ORDER BY created_at ASC
      LIMIT 1
      FOR UPDATE
      `,
            [slotId],
        );

        let promoted = null;

        if (waitlistRes.rows.length > 0) {
            const nextCandidate = waitlistRes.rows[0];

            // Promote candidate
            const newBooking = await client.query(
                `
        INSERT INTO bookings
        (id, slot_id, candidate_id, status)
        VALUES ($1, $2, $3, 'confirmed')
        RETURNING *
        `,
                [uuidv4(), slotId, nextCandidate.candidate_id],
            );

            // Remove from waitlist
            await client.query("DELETE FROM waitlist WHERE id = $1", [
                nextCandidate.id,
            ]);

            // Increment seat count again
            await client.query(
                `
        UPDATE slots
        SET booked_count = booked_count + 1
        WHERE id = $1
        `,
                [slotId],
            );

            promoted = newBooking.rows[0];
        }

        await client.query("COMMIT");

        return {
            cancelled: bookingRes.rows[0],
            promoted,
        };
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
      b.slot_id,
      b.candidate_id,
      b.status,
      s.start_time,
      s.end_time,
      s.role
    FROM bookings b
    JOIN slots s ON b.slot_id = s.id
    WHERE b.candidate_id = $1
    ORDER BY s.start_time ASC
    `,
        [candidateId],
    );

    return result.rows;
};
