import { db } from "../config/db.ts";
import { Event } from '../models/event.model.ts';
import { participant } from '../models/participant.model.ts';

export async function getAll(): Promise<Event[]> {
    const result = await db.queryObject<Event>(`
        SELECT * FROM events
    `);
    return result.rows;
}

export async function getEventById(id: number): Promise<Event | null> {
    const result = await db.queryObject<Event>(`
        SELECT * FROM events WHERE id = $1
    `, id);
    return result.rows.length > 0 ? result.rows[0] : null;
}

export async function getParticipants(eventId: number): Promise<participant[]> {
    const result = await db.queryObject<participant>(`
        SELECT id, event_id, name, images, bio, vote_power, ranking_position
        FROM participants WHERE event_id = $1
    `, eventId);
    return result.rows;
}

export async function getEventInfoAndParticipant(id: number): Promise<{ event: Event | null, participants: participant[] }> {
    const event = await getEventById(id);
    const participants = await getParticipants(id);
    return { event, participants };
}
export async function createEvent(event: Event): Promise<void> {
    const query = `
        INSERT INTO events (institution_id, create_by, created_at, updated_at, status, start_on, end_on, vote_cost, maximum_vote, who_can_participate, name)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `;
    await db.queryObject(query, 
        event.institution_id,
        event.create_by,
        event.created_at,
        event.updated_at,
        event.status,
        event.start_on,
        event.end_on,
        event.vote_cost,
        event.maximum_vote,
        JSON.stringify(event.who_can_participate),
        event.name
    );
}