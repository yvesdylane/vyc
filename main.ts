import { Application } from "https://deno.land/x/oak/mod.ts";
import eventRoutes from "./routes/eventRoutes.ts";
import { connectDB } from "./config/db.ts";
import { authMiddleware } from "./middlewares/authMiddleware.ts";

const app = new Application();

// Global auth protection
app.use(authMiddleware);

// Connect to database on startup
try {
  await connectDB();
} catch (err) {
  console.error("Failed to connect to database, exiting:", err);
  Deno.exit(1);
}

app.use(eventRoutes.routes());
app.use(eventRoutes.allowedMethods());

console.log("Server running on http://localhost:8080");
await app.listen({ port: 8080 });
