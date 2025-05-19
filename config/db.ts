import { ENV } from "./env.ts";

export const pool = new Pool({
  user: ENV.DB_USER,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_NAME,
  hostname: ENV.DB_HOST,
  port: ENV.DB_PORT,
}, 10);
