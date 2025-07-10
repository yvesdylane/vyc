import { User } from "../models/user";
import { getAll, getById, getName } from "../services/userService.ts";


export const fetchAllUsers = async (ctx: any) => {
  try {
    const users: User[] = await getAll();
    ctx.response.body = { users };
  } catch (err) {
    ctx.response.status = 500;
    ctx.response.body = { message: "Failed to fetch users", error: err.message };
  }
};

export const fetchUserById = async (ctx: any) => {
  try {
    const userId: string = ctx.params.id;
    const user: User | null = await getById(userId);
    if (!user) {
      ctx.response.status = 404;
      ctx.response.body = { message: "User not found" };
      return;
    }
    ctx.response.body = { user };
  } catch (err) {
    ctx.response.status = 500;
    ctx.response.body = { message: "Failed to fetch user", error: err.message };
  }
};

export const fetchUserName = async (ctx: any) => {
  try {
    const userId: string = ctx.params.id;
    const userName: string | null = await getName(userId);
    if (!userName) {
      ctx.response.status = 404;
      ctx.response.body = { message: "User not found" };
      return;
    }
    ctx.response.body = { userName };
  } catch (err) {
    ctx.response.status = 500;
    ctx.response.body = { message: "Failed to fetch user name", error: err.message };
  }
};