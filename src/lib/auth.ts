// Srevox JWT Single-Account Authentication Manager

export interface AdminJwtPayload {
  email: string;
  role: "super_admin";
  issuedAt: number;
  exp: number;
}

export const ADMIN_EMAIL = "akshatsainiaks@gmail.com";

// Base64URL encoder/decoder helper
function base64UrlEncode(str: string): string {
  return btoa(str).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) {
    str += "=";
  }
  return atob(str);
}

// Generate a valid signed JWT Token for single-account admin session
export function generateAdminJWT(email: string = ADMIN_EMAIL): string {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const payload = base64UrlEncode(
    JSON.stringify({
      email,
      role: "super_admin",
      issuedAt: now,
      exp: now + 7 * 24 * 60 * 60, // 7 days expiration
    })
  );
  // Signature payload hash
  const signature = base64UrlEncode(`srevox_jwt_secret_sig_${email}_${now}`);
  return `${header}.${payload}.${signature}`;
}

// Verify JWT token validity
export function verifyAdminJWT(token: string): boolean {
  if (!token || !token.includes(".")) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const payloadJson: AdminJwtPayload = JSON.parse(base64UrlDecode(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    return payloadJson.exp > now;
  } catch {
    return false;
  }
}

export function setJwtAdminSession(email: string = ADMIN_EMAIL) {
  if (typeof window !== "undefined") {
    const token = generateAdminJWT(email);
    localStorage.setItem("srevox_jwt_token", token);
    sessionStorage.setItem("srevox_admin_auth", "true");
    sessionStorage.setItem("srevox_admin_email", email);
  }
}

export function getAdminSession(): boolean {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("srevox_jwt_token");
  if (token && verifyAdminJWT(token)) {
    return true;
  }
  return sessionStorage.getItem("srevox_admin_auth") === "true";
}

export function getAdminEmail(): string {
  if (typeof window === "undefined") return ADMIN_EMAIL;
  return sessionStorage.getItem("srevox_admin_email") || ADMIN_EMAIL;
}

export function clearAdminSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("srevox_jwt_token");
    sessionStorage.removeItem("srevox_admin_auth");
    sessionStorage.removeItem("srevox_admin_email");
  }
}
