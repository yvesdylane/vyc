import { client } from "../config/db.ts";
import { User } from '../models/user';

export const getAll = async (): Promise<User[]> => {
  try {
    const result = await client.queryObject<User>(
      'SELECT * FROM users ORDER BY created_at DESC'
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw new Error('Failed to fetch users');
  }
};

export const getById = async (id: string): Promise<User | null> => {
  try {
    const result = await client.queryObject<User>(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error(`Error fetching user by ID ${id}:`, error);
    throw new Error('Failed to fetch user');
  }
};

export const getName = async (id: string): Promise<string | null> => {
  try {
    const result = await client.queryObject<{ user_name: string }>(
      'SELECT user_name FROM users WHERE id = $1',
      [id]
    );
    return result.rows.length > 0 ? result.rows[0].user_name : null;
  } catch (error) {
    console.error(`Error fetching user name by ID ${id}:`, error);
    throw new Error('Failed to fetch user name');
  }
};