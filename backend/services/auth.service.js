import pool from "../config/db.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export const registerService = async ({ name, email, password, role }) => {
    const existingUser = await pool.query(
        "SELECT id FROM users WHERE email=$1",
        [email],
    );

    if (existingUser.rows.length > 0) {
        throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await pool.query(
        `
        INSERT INTO users
        (id, name, email, password, role)
        VALUES ($1,$2,$3,$4,$5)
        RETURNING id, name, email, role
        `,
        [uuidv4(), name, email, hashedPassword, role],
    );

    return user.rows[0];
};

export const loginService = async ({ email, password }) => {
    const user = await pool.query(
        `
        SELECT *
        FROM users
        WHERE email=$1
        `,
        [email],
    );

    if (user.rows.length === 0) {
        throw new Error("Invalid credentials");
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);

    if (!validPassword) {
        throw new Error("Invalid credentials");
    }

    return user.rows[0];
};
