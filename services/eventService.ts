import { client } from "../config/db.ts";

export const getAllEvents = async (user: string) => {
  try {
    console.log("Executing query to fetch events for user:", user);

    // Check if user exists
    const userResult = await client.queryObject(
      `SELECT * FROM users WHERE id = $1`,
      [user],
    );

    if (userResult.rows.length === 0) {
      throw new Error("User not found");
    }

    // Check if user is a student
    const studentResult = await client.queryObject(
      `SELECT * FROM students WHERE user_id = $1`,
      [user],
    );

    if (studentResult.rows.length === 0) {
      // Not a student → check if user is institution staff
      const staffResult = await client.queryObject(
        `SELECT * FROM institution_users WHERE user_id = $1`,
        [user],
      );

      if (staffResult.rows.length === 0) {
        // Global events only
        const result = await client.queryObject(
          `SELECT * FROM events WHERE who_can_participate->'scope' @> '["global"]'`
        );

        console.log("Fetched global events:", result.rows);
        return result.rows;
      }

      // Is institution staff → get global + institution-level events and those specify for his department
      const institution_id = staffResult.rows[0].institution_id;
      const department_id = staffResult.rows[0].department_id;

      const result = await client.queryObject(
        `SELECT * FROM events
         WHERE
           who_can_participate->'scope' @> '["global"]'
           OR (
             who_can_participate->'scope' @> '["institution_students"]'
             AND institution_id = $1
             AND (
             who_can_participate->'department' IS NULL
             OR who_can_participate->'department' @> to_jsonb($2::text)
           )
           )`,
        [institution_id, department_id.toString()]
      );

      console.log("Fetched events for staff:", result.rows);
      return result.rows;
    }

    // Is student → get global + institution + department + specialties
    const { institution_id, department_id, specialty_id } = studentResult.rows[0];

    const result = await client.queryObject(
      `SELECT * FROM events
       WHERE
         who_can_participate->'scope' @> '["global"]'
         OR (
           who_can_participate->'scope' @> '["institution_students"]'
           AND institution_id = $1
           AND (
             who_can_participate->'department' IS NULL
             OR who_can_participate->'department' @> to_jsonb($2::text)
           )
           AND (
             who_can_participate->'specialities' IS NULL
             OR who_can_participate->'specialities' @> to_jsonb($3::text)
           )
         )`,
      [institution_id, department_id.toString(), specialty_id.toString()]
    );

    console.log("Fetched events for student:", result.rows);
    return result.rows;

  } catch (error) {
    console.error("Database query error:", error.message);
    throw error;
  }
};

export const getEventInfo = async (event_id: number, user: string) => {
  
}