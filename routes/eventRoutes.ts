import { Router } from "https://deno.land/x/oak/mod.ts";
import { fetchEvents, fetchEventInfo } from "../controllers/eventController.ts";

const router = new Router();

router.get("/events", fetchEvents)
    .get("/event_info/:id", fetchEventInfo)
    .get("/event/participant/:id", fetchEventInfo);

export default router;
