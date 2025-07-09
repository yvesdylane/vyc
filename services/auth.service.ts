import { db } from "../config/db.ts";
import { hashPassword, verifyPassword } from "../utils/hash.ts";
import { generateToken } from "../utils/jwt.ts";
import { sendVerificationEmail } from "../utils/email.ts";
import { User } from '../models/user.model.ts';

export async function registerUser(info: User) {
    // Check if email already exists
    const existingUser = await db.queryObject<{ email: string }>`
        SELECT email FROM users WHERE email = ${info.email}
    `;
    if (existingUser.rows.length > 0) {
        throw new Error("Email already exists");
    }

    // Check if username already exists
    const existingUsername = await db.queryObject<{ user_name: string }>`
        SELECT user_name FROM users WHERE user_name = ${info.user_name}
    `;
    if (existingUsername.rows.length > 0) {
        throw new Error("Username already exists");
    }

    const hashedPassword = await hashPassword(info.password);

    // Generate token and expiration
    const token: string = Math.floor(100000 + Math.random() * 900000).toString();
    const token_expire_at: Date = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Build insert data
    const insertData: Record<string, unknown> = {
        name: info.name,
        sur_name: info.sur_name,
        email: info.email,
        tell: info.tell,
        user_name: info.user_name,
        password: hashedPassword,
        dob: info.dob,
        region: info.region,
        token: token,
        token_expire_at: token_expire_at
    };

    // Filter out undefined/null fields
    const filteredEntries = Object.entries(insertData).filter(([_, value]) => value !== undefined && value !== null);
    const fields = filteredEntries.map(([key]) => `"${key}"`).join(", ");
    const values = filteredEntries.map(([_, value]) => value);
    const placeholders = filteredEntries.map((_, idx) => `$${idx + 1}`).join(", ");

    const query = `INSERT INTO users (${fields}) VALUES (${placeholders})`;

    console.log(query);
    console.log(values);

    await db.queryObject({
    text: query,
    args: values
    });

    // Send verification email
    try {
        await sendVerificationEmail(info.email, info.name, token);
    } catch (error) {
        console.error("Error sending verification email:", error);
        throw new Error("Failed to send verification email");
    }
    return { message: "User registered successfully." };
}

export async function loginUser(email: string, password: string) {
    // Update the type to match your actual database schema - id should be a string for UUIDs
    const result = await db.queryObject<{ id: string; email: string; password: string; is_verified: boolean }>`
        SELECT id, email, password, is_verified FROM users WHERE email = ${email}
    `;
    
    // Check if any user was found
    if (result.rows.length === 0) {
        throw new Error("Invalid credentials");
    }
    
    const user = result.rows[0];
    console.log(user);
    
    if (!(await verifyPassword(password, user.password))) {
        throw new Error("Invalid credentials");
    }
    
    if (!user.is_verified) {
        const token: string = Math.floor(100000 + Math.random() * 900000).toString();
        const token_expire_at: Date = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const query = `UPDATE users SET token = $1, token_expire_at = $2 WHERE email = $3`;
        console.log(query);
        await db.queryObject({
            text: query,
            args: [token, token_expire_at, user.email]
        });
        throw new Error("Please verify your email. A verification email has been sent.");
    }
    
    console.log("Here I am!!");
    
    try {
        const token = await generateToken(user.id );
        console.log("JWT generated successfully:", token);
        return { token };
    } catch (error) {
        console.error("Error generating JWT:", error);
        throw new Error("Authentication failed: Could not generate token");
    }
}

export async function verifyEmail(token: string) {
    try {
        const existingToken = await db.queryObject<{ token: string, token_expire_at: Date, id: string }>`
            SELECT token, token_expire_at, id FROM users WHERE token = ${token}
        `;
        
        const verified_at = new Date();
        console.log("Token:", existingToken.rows[0]);

        if (existingToken.rows.length > 0 && new Date(existingToken.rows[0].token_expire_at) > verified_at) {
            const query = `UPDATE users SET is_verified = $1, token = $2, verified_at = $3 WHERE token = $4`;
            await db.queryObject({
                text: query,
                args: [true, null, verified_at, token]
            });
            console.log("Email verified successfully.");
            const query2 = `INSERT INTO user_roles ("user_id","role_id") VALUES ($1, $2)`;
            await db.queryObject({
                text: query2,
                args: [existingToken.rows[0].id, 1] // Assigning role_id 1 is for regular users
            });
            return true;
        }
        return false; 
    } catch (error) {
        console.error("Error verifying email:", error);
        throw new Error("Failed to verify email");
    }
}