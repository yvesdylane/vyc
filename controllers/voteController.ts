import { getAllVotes, voteForParticipant } from "../services/voteService";

export const fetchVotes = async (ctx: any) => {
  try {
    const eventId: number = ctx.params.eventId;
    const votes = await getAllVotes(eventId);
    ctx.response.body = { votes };
  } catch (err) {
    ctx.response.status = 500;
    ctx.response.body = { message: "Failed to fetch votes", error: err.message };
  }
};

export const castVote = async (ctx: any) => {
  try {
    const { eventId, participantId } = ctx.request.body;
    const userId: string = ctx.state.user.sub;
    const maxVotes: number = ctx.state.user.maxVotes;

    await voteForParticipant(eventId, participantId, userId, maxVotes);
    ctx.response.status = 201;
    ctx.response.body = { message: "Vote cast successfully" };
  } catch (err) {
    ctx.response.status = 500;
    ctx.response.body = { message: "Failed to cast vote", error: err.message };
  }
};  