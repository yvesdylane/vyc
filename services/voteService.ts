import { client } from "../config/db.ts";

export const getAllVotes = async (eventId: number): Promise<any[]> => {
  try {
    const result = await client.queryObject(
      'SELECT * FROM votes WHERE event_id = $1 ORDER BY created_at DESC',
      [eventId]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching all votes:', error);
    throw new Error('Failed to fetch votes');
  }
};

export const voteForParticipant = async (
  eventId: number,
  participantId: number,
  userId: string,
  maxVotes: number
): Promise<void> => {
  try {
    const existingVote = await client.queryObject(
      'SELECT * FROM votes WHERE event_id = $1 AND participant_id = $2 AND user_id = $3',
      [eventId, participantId, userId]
    );

    if (existingVote.rows.length > maxVotes && maxVotes != 0) {
      throw new Error('User has already voted for this participant');
    }

    await client.queryObject(
      'INSERT INTO votes (event_id, participant_id, user_id) VALUES ($1, $2, $3)',
      [eventId, participantId, userId]
    );
  } catch (error) {
    console.error('Error voting for participant:', error);
    throw new Error('Failed to vote for participant');
  }
}