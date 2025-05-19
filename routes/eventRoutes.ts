import { Router } from "https://deno.land/x/oak/mod.ts";
import { fetchEvents } from "../controllers/eventController.ts";

const router = new Router();

router.get("/events", fetchEvents);

export default router;
