import { verifyToken } from "../utils/jwt.ts";
import { Context } from "https://deno.land/x/oak/mod.ts";

export const authMiddleware = async (ctx: Context, next: () => Promise<unknown>) => {
  const authHeader = ctx.request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    ctx.response.status = 401;
    ctx.response.body = { message: "Authorization token missing" };
    return;
  }

  const payload = await verifyToken(token);
  if (!payload) {
    ctx.response.status = 403;
    ctx.response.body = { message: "Invalid or expired token" };
    return;
  }

  ctx.state.user = payload; // store user info in state
  await next();
};
