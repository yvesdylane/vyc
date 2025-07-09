import { Router } from "../deps.ts";
import { login, register, verification } from "../controllers/auth.controller.ts";

const router = new Router();

router
    .post("/auth/register", register)
    .post("/auth/login", login)
    .post("/auth/verification", verification)
    .get("/", (ctx) => {
        ctx.response.body = "Welcome to the Auth API!";
        ctx.response.status = 200;
    });

export default router;
