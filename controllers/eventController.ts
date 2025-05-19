import { getAllEvents, getEventInfo, getEventParticipant } from "../services/eventService.ts";

export const fetchEvents = async (ctx: any) => {
  try {
    const user = ctx.state.user.sub;
    const events = await getAllEvents(user);
    ctx.response.body = { events };
  } catch (err) {
    ctx.response.status = 500;
    ctx.response.body = { message: "Failed to fetch events", error: err.message };
  }
};

export const fetchEventInfo = async (ctx: any) => {
  try {
    const eventId:number = ctx.params.id;
    const user = ctx.state.user.sub;
    const eventInfo = await getEventInfo(eventId, user);
    ctx.response.body = { eventInfo };
  } catch (err) {
    ctx.response.status = 500;
    ctx.response.body = { message: "Failed to fetch event info", error: err.message };
  }
}

export const fectchEventParticipant = async (ctx: any) => {
  try {
    const eventId:number = ctx.params.eventId;
    const participantId:number = ctx.params.participantId;
    const user = ctx.state.user.sub;
    const participantInfo = await getEventParticipant(eventId, user, participantId);
    ctx.response.body = { participantInfo };
  } catch (err) {
    ctx.response.status = 500;
    ctx.response.body = { message: "Failed to fetch event info", error: err.message };
  }
}