import { ENV } from "./env.ts";
import { Client } from "../deps.ts";

// Create a single client instance
export const client = new Client({
  user: ENV.DB_USER,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_NAME,
  hostname: ENV.DB_HOST,
  port: ENV.DB_PORT,
});

// Function to connect to database
export async function connectDB() {
  try {
    await client.connect();
    console.log("Database connected successfully");
  } catch (err) {
    console.error("Database connection error:", err);
    throw err;
  }
}