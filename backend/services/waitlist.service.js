import pool from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export const joinWaitlistService = async ({ slotId, candidateId }) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        /*
        Check slot exists
        */
        const slotResult = await client.query(
            `
            SELECT capacity, booked_count
            FROM slots
            WHERE id=$1
            `,
            [slotId],
        );

        if (slotResult.rows.length === 0) {
            throw new Error("Slot not found");
        }

        /*
        Check already booked
        */
        const bookingCheck = await client.query(
            `
            SELECT id
            FROM bookings
            WHERE slot_id=$1
            AND candidate_id=$2
            `,
            [slotId, candidateId],
        );

        if (bookingCheck.rows.length > 0) {
            throw new Error("Already booked");
        }

        /*
        Check already waitlisted
        */
        const waitlistCheck = await client.query(
            `
            SELECT id
            FROM waitlist
            WHERE slot_id=$1
            AND candidate_id=$2
            `,
            [slotId, candidateId],
        );

        if (waitlistCheck.rows.length > 0) {
            throw new Error("Already in waitlist");
        }

        /*
        Insert waitlist entry
        */
        const result = await client.query(
            `
            INSERT INTO waitlist
            (
                id,
                slot_id,
                candidate_id,
                created_at
            )
            VALUES ($1,$2,$3,NOW())
            RETURNING *
            `,
            [uuidv4(), slotId, candidateId],
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

export const getWaitlistBySlotService = async (slotId) => {
    const result = await pool.query(
        `
        SELECT
            w.id,
            w.slot_id,
            w.created_at,

            u.id AS candidate_id,
            u.email,
            u.name

        FROM waitlist w

        JOIN users u
        ON w.candidate_id = u.id

        WHERE w.slot_id = $1

        ORDER BY w.created_at ASC
        `,
        [slotId],
    );

    return result.rows;
};


export const promoteFromWaitlistService = async (slotId, client) => {
    /*
    Get first waitlisted candidate
    */
    const waitlist = await client.query(
        `
        SELECT id, candidate_id
        FROM waitlist
        WHERE slot_id=$1
        ORDER BY created_at ASC
        LIMIT 1
        FOR UPDATE
        `,
        [slotId],
    );

    if (waitlist.rows.length === 0) return;

    const candidateId = waitlist.rows[0].candidate_id;
    const waitlistId = waitlist.rows[0].id;

    /*
    Create booking
    */
    await client.query(
        `
        INSERT INTO bookings
        (
            id,
            slot_id,
            candidate_id,
            status,
            created_at
        )
        VALUES ($1,$2,$3,'confirmed',NOW())
        `,
        [uuidv4(), slotId, candidateId],
    );

    /*
    Remove from waitlist
    */
    await client.query(
        `
        DELETE FROM waitlist
        WHERE id=$1
        `,
        [waitlistId],
    );

    /*
    Update slot count
    */
    await client.query(
        `
        UPDATE slots
        SET booked_count = booked_count + 1
        WHERE id=$1
        `,
        [slotId],
    );
};

export const getMyWaitlistService = async (candidateId) => {
    const result = await pool.query(
        `
        SELECT
            w.id,
            w.created_at,

            s.id AS slot_id,
            s.role,
            s.start_time,
            s.end_time,
            s.interviewer_id

        FROM waitlist w

        JOIN slots s
        ON w.slot_id = s.id

        WHERE w.candidate_id = $1

        ORDER BY s.start_time ASC
        `,
        [candidateId],
    );

    return result.rows;
};
