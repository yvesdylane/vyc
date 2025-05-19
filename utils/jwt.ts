// Native JWT implementation without external dependencies\
// Standard JWT encoding/decoding functions
import { JWTPayload } from "../types/jwt.ts";

function base64UrlEncode(str: Uint8Array): string {
  return btoa(String.fromCharCode(...str))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4 !== 0) {
    str += "=";
  }
  return Uint8Array.from(atob(str), c => c.charCodeAt(0));
}

// JWT part types
type Header = {
  alg: string;
  typ: string;
};

type Payload = {
  iss?: string;
  sub?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
};

// Load environment variables from .env file
import { config } from "https://deno.land/x/dotenv/mod.ts";

// Load .env file
try {
  const configData = await config();
  console.log("Environment variables loaded successfully");
} catch (err) {
  console.warn("Warning: Error loading .env file:", err.message);
}

// Load secret from environment variable
const rawKey = Deno.env.get("JWT_SECRET") || "EdwOXiTiXbw1rHWSAVe+jwZkk0wP4L01btSfKt2ptLU="; // Fallback for development
if (!Deno.env.get("JWT_SECRET")) {
  console.warn("Warning: Using default JWT_SECRET. Set JWT_SECRET environment variable for production!");
}
const key = Uint8Array.from(atob(rawKey), c => c.charCodeAt(0));
console.log("Key length:", key.length);

// Get numeric date (seconds since epoch)
const getNumericDate = (expiresIn: number): number => {
  return Math.floor(Date.now() / 1000) + expiresIn;
};

export async function generateToken(userId: string): Promise<string> {
  try {
    const header: Header = {
      alg: "HS256",
      typ: "JWT"
    };
    
    const payload: Payload = {
      iss: "vyc_auth",
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      exp: getNumericDate(60 * 60 * 24), // 24 hours
    };
    
    // Encode header and payload
    const encoder = new TextEncoder();
    const headerStr = JSON.stringify(header);
    const payloadStr = JSON.stringify(payload);
    const headerBase64 = base64UrlEncode(encoder.encode(headerStr));
    const payloadBase64 = base64UrlEncode(encoder.encode(payloadStr));
    
    // Create signature
    const data = encoder.encode(`${headerBase64}.${payloadBase64}`);
    const signatureBuffer = await crypto.subtle.sign(
      { name: "HMAC", hash: "SHA-256" },
      await crypto.subtle.importKey(
        "raw",
        key,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      ),
      data
    );
    
    const signature = base64UrlEncode(new Uint8Array(signatureBuffer));
    
    // Combine to create JWT
    return `${headerBase64}.${payloadBase64}.${signature}`;
  } catch (err) {
    console.error("Error generating JWT:", err);
    throw new Error(`Failed to generate token: ${err.message}`);
  }
}

export async function verifyToken(token: string): Promise<Payload | null> {
  try {
    const [headerBase64, payloadBase64, signature] = token.split(".");
    
    if (!headerBase64 || !payloadBase64 || !signature) {
      throw new Error("Invalid token format");
    }
    
    // Verify signature
    const encoder = new TextEncoder();
    const data = encoder.encode(`${headerBase64}.${payloadBase64}`);
    
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    
    const isValid = await crypto.subtle.verify(
      { name: "HMAC", hash: "SHA-256" },
      cryptoKey,
      base64UrlDecode(signature),
      data
    );
    
    if (!isValid) {
      throw new Error("Invalid signature");
    }
    
    // Decode payload
    const decoder = new TextDecoder();
    const payload = JSON.parse(decoder.decode(base64UrlDecode(payloadBase64)));
    
    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error("Token expired");
    }
    
    return payload;
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return null;
  }
}