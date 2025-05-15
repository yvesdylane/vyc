import { Application } from "./deps.ts";
import authRoutes from "./routes/auth.routes.ts";
import "https://deno.land/std@0.224.0/dotenv/load.ts";

const app = new Application();

app.use(authRoutes.routes());
app.use(authRoutes.allowedMethods());

console.log("Server running on http://localhost:8000");
await app.listen({ port: 8000 });
