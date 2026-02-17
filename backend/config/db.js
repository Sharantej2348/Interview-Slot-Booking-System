import dotenv from "dotenv";
dotenv.config(); // 👈 put here

import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.connect()
    .then((client) => {
        console.log("✅ PostgreSQL connected successfully");
        client.release();
    })
    .catch((err) => {
        console.error("❌ PostgreSQL connection failed:", err.message);
    });

export default pool;
