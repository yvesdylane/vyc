import { Router } from "https://deno.land/x/oak/mod.ts";
import { fetchEvents, fetchEventInfo, fectchEventParticipant } from "../controllers/eventController.ts";

const router = new Router();

router.get("/events", fetchEvents)
    .get("/event_info/:id", fetchEventInfo)
    .get("/event/:eventId/participant/:participantId", fectchEventParticipant);

export default router;
