import { SignJWT, jwtVerify } from "jose";

const secretKey =
  process.env.JWT_SECRET_KEY || "default-secret-key-change-in-production";
const key = new TextEncoder().encode(secretKey);

export interface SessionData {
  id: number;
  email: string;
  role: string;
  rt_akses: string;
  rw_akses: string;
  nama_lengkap: string;
  subscription_status: string;
  subscription_end: string;
  loginTime: string;
  [key: string]: unknown;
}

/**
 * Encrypt session data into JWT
 * @param payload Session data to encrypt
 * @returns Encrypted JWT string
 */
export async function encrypt(payload: SessionData): Promise<string> {
  try {
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d") // 7 days expiration
      .sign(key);
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt session data");
  }
}

/**
 * Decrypt JWT into session data
 * @param token JWT string to decrypt
 * @returns Decrypted session data or null if invalid
 */
export async function decrypt(token: string): Promise<SessionData | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });

    return payload as unknown as SessionData;
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
}

/**
 * Verify if token is valid without decrypting
 * @param token JWT string to verify
 * @returns boolean indicating if token is valid
 */
export async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Create a secure random token for CSRF protection
 * @returns Random token string
 */
export function generateCSRFToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
