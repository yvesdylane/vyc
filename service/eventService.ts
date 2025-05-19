export const getAllEvents = async (page: number, limit: number) => {
  const client = await pool.connect();
  try {
    const offset = (page - 1) * limit;
    const result = await client.queryObject(
      `SELECT * FROM events ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  } finally {
    client.release();
  }
};
