export const fetchEvents = async (ctx: any) => {
  try {
    const page = parseInt(ctx.request.url.searchParams.get("page") || "1");
    const limit = parseInt(ctx.request.url.searchParams.get("limit") || "10");

    const events = await getAllEvents(page, limit);
    ctx.response.body = { page, limit, events };
  } catch (err) {
    ctx.response.status = 500;
    ctx.response.body = { message: "Failed to fetch events", error: err.message };
  }
};
