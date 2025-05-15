import { Context } from "../deps.ts";
import { registerUser, loginUser, verifyEmail } from "../services/auth.service.ts";

export async function register(ctx: Context) {
    const info = await ctx.request.body({ type: "json" }).value;
    const result = await registerUser(info);
    ctx.response.status = 201;
    ctx.response.body = result;
}

export async function login(ctx: Context) {
    const { email, password } = await ctx.request.body({ type: "json" }).value;
    try {
        const result = await loginUser(email, password);
        ctx.response.body = result;
    } catch (e) {
        ctx.response.status = 401;
        ctx.response.body = { error: e.message };
    }
}

export async function verification(ctx: Context) {
    const { token } = await ctx.request.body({ type: "json" }).value;
    try {
        console.log("Token:", token);
        const result = await verifyEmail(token);
        if (result) {
            ctx.response.status = 200;
            ctx.response.body = { message: "Email verified successfully." };
        } else {
            ctx.response.status = 400;
            ctx.response.body = { error: "Invalid or expired token." };
        }
    } catch (error) {
        console.error("Error verifying email:", error);
        ctx.response.status = 500;
        ctx.response.body = { error: "Error verifying email, Internal server error" };
        
    }
}
