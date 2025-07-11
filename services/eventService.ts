import { client } from "../config/db.ts";

export const getAllEvents = async (userId: string) => {
  try {
    console.log("Executing query to fetch events for user:", userId);
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      throw new Error("Invalid user ID format");
    }

    // Check if user exists
    const userResult = await client.queryObject<{ id: string }>(
      `SELECT id FROM users WHERE id = $1`,
      [userId],
    );

    if (userResult.rows.length === 0) {
      throw new Error(`User not found with ID: ${userId}`);
    }

    // Check if student
    const studentResult = await client.queryObject<{
      institution_id: string;
      department_id: string;
      specialty_id: string;
    }>(
      `SELECT institution_id, department_id, specialty_id FROM students WHERE user_id = $1`,
      [userId],
    );

    if (studentResult.rows.length > 0) {
      const { institution_id, department_id, specialty_id } = studentResult.rows[0];

      const result = await client.queryObject(
        `SELECT * FROM events 
         WHERE status = 'ongoing'
         AND (
           who_can_participate->>'scope' = 'global'
           OR (
             who_can_participate->>'scope' = 'institution_students'
             AND institution_id = $1
             AND (
               who_can_participate->'department' IS NULL
               OR jsonb_array_length(who_can_participate->'department') = 0
               OR who_can_participate->'department' @> to_jsonb(ARRAY[$2])
             )
             AND (
               who_can_participate->'specialties' IS NULL
               OR jsonb_array_length(who_can_participate->'specialties') = 0
               OR who_can_participate->'specialties' @> to_jsonb(ARRAY[$3])
             )
           )
         )`,
        [institution_id, department_id, specialty_id],
      );

      console.log("Fetched events for student:", result.rows.length);
      return result.rows;
    }

    // Check if institution staff
    const staffResult = await client.queryObject<{
      institution_id: string;
      department_id: string;
    }>(
      `SELECT institution_id, department_id FROM institution_users WHERE user_id = $1`,
      [userId],
    );

    if (staffResult.rows.length > 0) {
      const { institution_id, department_id } = staffResult.rows[0];

      const result = await client.queryObject(
        `SELECT * FROM events 
         WHERE status = 'ongoing'
         AND (
           who_can_participate->>'scope' = 'global'
           OR (
             who_can_participate->>'scope' = 'institution_students'
             AND institution_id = $1
             AND (
               who_can_participate->'department' IS NULL
               OR jsonb_array_length(who_can_participate->'department') = 0
               OR who_can_participate->'department' @> to_jsonb(ARRAY[$2])
             )
           )
         )`,
        [institution_id, department_id],
      );

      console.log("Fetched events for staff:", result.rows.length);
      return result.rows;
    }
    
    // Fallback: only global events
    const result = await client.queryObject(
      `SELECT * FROM events 
       WHERE who_can_participate->>'scope' = 'global'
       AND status = 'ongoing'`
    );

    console.log("Fetched global events:", result.rows.length);
    return result.rows;

  } catch (error) {
    console.error(`Error fetching events for user ${userId}:`, error);
    throw new Error(`Failed to fetch events: ${error.message}`);
  }
};

export const getEventInfo = async (event_id: number, user: string) => {
  const eventResult = await client.queryObject<{
    institution_id: string;
    name: string;
    status: string;
    start_on: string;
    end_on: string;
    who_can_participate: any;
    bio: string;
  }>(
    `SELECT institution_id, name, status, start_on, end_on, who_can_participate, bio 
     FROM events 
     WHERE id = $1 AND status = 'ongoing'`,
    [event_id],
  );

  if (eventResult.rows.length === 0) {
    throw new Error("Event not found or not ongoing");
  }

  const event = eventResult.rows[0];
  const scope = event.who_can_participate?.scope || "";

  if (scope !== "global") {
    const userResult = await client.queryObject(
      `SELECT * FROM users WHERE id = $1`,
      [user],
    );
    if (userResult.rows.length === 0) throw new Error("User not found");

    const studentResult = await client.queryObject<{
      institution_id: string;
      department_id: string;
      specialty_id: string;
    }>(
      `SELECT institution_id, department_id, specialty_id FROM students WHERE user_id = $1`,
      [user],
    );

    const allowedDepartments: string[] = Array.isArray(event.who_can_participate?.department)
      ? event.who_can_participate.department
      : [];
    const allowedSpecialties: string[] = Array.isArray(event.who_can_participate?.specialties)
      ? event.who_can_participate.specialties
      : [];

    if (studentResult.rows.length > 0) {
      const { institution_id, department_id, specialty_id } = studentResult.rows[0];

      if (String(institution_id) !== String(event.institution_id)) {
        throw new Error("Access denied: different institution");
      }
      if (allowedDepartments.length && !allowedDepartments.includes(department_id)) {
        throw new Error("Access denied: not in allowed department");
      }
      if (allowedSpecialties.length && !allowedSpecialties.includes(specialty_id)) {
        throw new Error("Access denied: not in allowed specialty");
      }

    } else {
      const staffResult = await client.queryObject<{
        institution_id: string;
        department_id: string;
      }>(
        `SELECT institution_id, department_id FROM institution_users WHERE user_id = $1`,
        [user],
      );

      if (staffResult.rows.length === 0) throw new Error("Access denied");

      const { institution_id, department_id } = staffResult.rows[0];

      if (String(institution_id) !== String(event.institution_id)) {
        throw new Error("Access denied: different institution");
      }
      if (allowedDepartments.length && !allowedDepartments.includes(department_id)) {
        throw new Error("Access denied: not in allowed department");
      }
    }
  }

  const institutionResult = await client.queryObject<{ name: string }>(
    `SELECT name FROM institutions WHERE id = $1`,
    [event.institution_id],
  );

  if (institutionResult.rows.length === 0) {
    throw new Error("Institution not found");
  }

  const institution = institutionResult.rows[0];

  const eventParticipants = await client.queryObject(
    `SELECT event_participants.*, users.name  FROM event_participants JOIN users ON event_participants.user_id = users.id WHERE event_participants.event_id = $1`,
    [event_id],
  );

  return {
    event,
    institution,
    event_participants_count: eventParticipants.rows.length,
    event_participants: eventParticipants.rows,
  };
};

export const getEventParticipant = async (eventId: number, user: string, participantId: number) => {
  const eventResult = await client.queryObject<{
    institution_id: string;
    name: string;
    status: string;
    start_on: string;
    end_on: string;
    who_can_participate: any;
    bio: string;
  }>(
    `SELECT institution_id, name, status, start_on, end_on, who_can_participate, bio 
     FROM events 
     WHERE id = $1 AND status = 'ongoing'`,
    [eventId],
  );

  if (eventResult.rows.length === 0) {
    throw new Error("Event not found or not ongoing");
  }

  const event = eventResult.rows[0];
  const scope = event.who_can_participate?.scope || "";

  if (scope !== "global") {
    const userResult = await client.queryObject(
      `SELECT * FROM users WHERE id = $1`,
      [user],
    );
    if (userResult.rows.length === 0) throw new Error("User not found");

    // Check if user is student
    const studentResult = await client.queryObject<{
      institution_id: string;
      department_id: string;
      specialty_id: string;
    }>(
      `SELECT institution_id, department_id, specialty_id FROM students WHERE user_id = $1`,
      [user],
    );

    const allowedDepartments: string[] = Array.isArray(event.who_can_participate?.department)
      ? event.who_can_participate.department
      : [];
    const allowedSpecialties: string[] = Array.isArray(event.who_can_participate?.specialties)
      ? event.who_can_participate.specialties
      : [];

    if (studentResult.rows.length > 0) {
      const { institution_id, department_id, specialty_id } = studentResult.rows[0];

      if (String(institution_id) !== String(event.institution_id)) {
        throw new Error("Access denied: different institution");
      }
      if (allowedDepartments.length && !allowedDepartments.includes(department_id)) {
        throw new Error("Access denied: not in allowed department");
      }
      if (allowedSpecialties.length && !allowedSpecialties.includes(specialty_id)) {
        throw new Error("Access denied: not in allowed specialty");
      }

    } else {
      // Check if user is staff
      const staffResult = await client.queryObject<{
        institution_id: string;
        department_id: string;
      }>(
        `SELECT institution_id, department_id FROM institution_users WHERE user_id = $1`,
        [user],
      );

      if (staffResult.rows.length === 0) throw new Error("Access denied");

      const { institution_id, department_id } = staffResult.rows[0];

      if (String(institution_id) !== String(event.institution_id)) {
        throw new Error("Access denied: different institution");
      }
      if (allowedDepartments.length && !allowedDepartments.includes(department_id)) {
        throw new Error("Access denied: not in allowed department");
      }
    }
  }

  // Fetch participant info
  const participantResult = await client.queryObject(
    `SELECT event_participants.*, users.name 
    FROM event_participants 
    JOIN users ON event_participants.user_id = users.id 
    WHERE event_participants.event_id = $1 AND event_participants.id = $2`,
    [eventId, participantId],
  );

  if (participantResult.rows.length === 0) {
    throw new Error("Participant not found");
  }

  return participantResult.rows[0];
};

export const getInstitutionEvents = async (userId: string, institutionId: string) => {
  try {
    console.log("Fetching institution events for user:", userId, "institution:", institutionId);
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId) || !uuidRegex.test(institutionId)) {
      throw new Error("Invalid user ID or institution ID format");
    }

    // Check if user exists
    const userResult = await client.queryObject<{ id: string }>(
      `SELECT id FROM users WHERE id = $1`,
      [userId],
    );

    if (userResult.rows.length === 0) {
      throw new Error(`User not found with ID: ${userId}`);
    }

    // Check if user belongs to the institution (either as student or staff)
    const studentResult = await client.queryObject<{
      institution_id: string;
      department_id: string;
      specialty_id: string;
    }>(
      `SELECT institution_id, department_id, specialty_id FROM students WHERE user_id = $1 AND institution_id = $2`,
      [userId, institutionId],
    );

    const staffResult = await client.queryObject<{
      institution_id: string;
      department_id: string;
    }>(
      `SELECT institution_id, department_id FROM institution_users WHERE user_id = $1 AND institution_id = $2`,
      [userId, institutionId],
    );

    if (studentResult.rows.length === 0 && staffResult.rows.length === 0) {
      throw new Error("Access denied: User does not belong to this institution");
    }

    // Fetch all ongoing events for this institution
    const result = await client.queryObject(
      `SELECT * FROM events 
       WHERE institution_id = $1 
       AND status = 'ongoing'
       ORDER BY created_at DESC`,
      [institutionId],
    );

    console.log("Fetched institution events:", result.rows.length);
    return result.rows;

  } catch (error) {
    console.error(`Error fetching institution events:`, error);
    throw new Error(`Failed to fetch institution events: ${error.message}`);
  }
};