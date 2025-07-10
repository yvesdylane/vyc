import { Context } from "../deps.ts";
import { getAll, getEventById, getParticipants } from "../services/event.service.ts";
import { Event } from '../models/event.model';

export async function getEvents(ctx: Context) {
    try {
        const events = await getAll();
        ctx.response.status = 200;
        ctx.response.body = events;
    } catch (error) {
        console.error("Error fetching events:", error);
        ctx.response.status = 500;
        ctx.response.body = { error: "Internal server error" };
    }
}

export async function getEvent(ctx: Context) {
    const { id } = await ctx.request.body({ type: "json" }).value;
    try {
        const event = await getEventById(id);
        if (event) {
            ctx.response.status = 200;
            ctx.response.body = event;
        } else {
            ctx.response.status = 404;
            ctx.response.body = { error: "Event not found" };
        }
    } catch (error) {
        console.error("Error fetching event:", error);
        ctx.response.status = 500;
        ctx.response.body = { error: "Internal server error" };
    }
}

export async function getEventParticipants(ctx: Context) {
    const { id } = await ctx.request.body({ type: "json" }).value;
    try {
        const participant = await getParticipants(id);
        ctx.response.status = 200;
        ctx.response.body = participant;
    } catch (error) {
        console.error("Error fetching events participant:", error);
        ctx.response.status = 500;
        ctx.response.body = { error: "Internal server error" };
    }
}

export async function getEventInfoAndParticipant(ctx: Context) {
    const { id } = await ctx.request.body({ type: "json" }).value;
    interface eventFullInfo={
        event: null as Event | null,
        participants: null as Array<{ user_id: number, user_name: string }> | null
    }
    try {
        eventFullInfo.event = await getEventById(id);
        eventFullInfo.participants = await getParticipants(id);
        
        ctx.response.status = 200;
        ctx.response.body = eventFullInfo;
    } catch (error) {
        console.error("Error fetching events:", error);
        ctx.response.status = 500;
        ctx.response.body = { error: "Internal server error" };
    }
}