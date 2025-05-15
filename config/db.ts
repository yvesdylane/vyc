import { Client } from "../deps.ts";

export const db = new Client({
  user: "postgres",
  password: "0524@12",
  database: "vyc",
  hostname: "localhost",
  port: 5432,
});

await db.connect();
