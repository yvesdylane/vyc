import { config as loadEnv } from "https://deno.land/x/dotenv/mod.ts";

const env = await loadEnv();

export const ENV = {
  DB_USER: env.DB_USER,
  DB_PASSWORD: env.DB_PASSWORD,
  DB_NAME: env.DB_NAME,
  DB_HOST: env.DB_HOST,
  DB_PORT: parseInt(env.DB_PORT),
  JWT_SECRET: env.JWT_SECRET,
};
