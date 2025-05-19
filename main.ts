import { Application } from "https://deno.land/x/oak/mod.ts";
import eventRoutes from "./routes/eventRoutes.ts";
import { authMiddleware } from "./middlewares/authMiddleware.ts";

const app = new Application();

// Global auth protection
app.use(authMiddleware);

app.use(eventRoutes.routes());
app.use(eventRoutes.allowedMethods());

console.log("Server running on http://localhost:8080");
await app.listen({ port: 8000 });
