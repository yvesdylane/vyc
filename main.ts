import { Application } from "./deps.ts";
import apiRoutes from "./routes/api.routes.ts";
import "https://deno.land/std@0.224.0/dotenv/load.ts";

const app = new Application();

app.use(apiRoutes.routes());
app.use(apiRoutes.allowedMethods());

console.log("Server running on http://localhost:8081");
await app.listen({ port: 8081 });
