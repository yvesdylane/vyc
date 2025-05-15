import { hash, compare } from "../deps.ts";

export async function hashPassword(password: string): Promise<string> {
  return await hash(password);
}

export async function verifyPassword(password: string, hashValue: string): Promise<boolean> {
  return await compare(password, hashValue);
}
