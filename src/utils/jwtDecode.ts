import { jwtDecode } from "jwt-decode";

type Payload = {
  id: number;
  email: string;
  name: string;
  role: "USER" | "BARISTA";
  exp?: number; 
  iat?: number;
};

export function getUserFromToken(token: string | null | undefined) {
  if (!token) return null;
  try {
    const p = jwtDecode<Payload>(token);
    return p; 
  } catch {
    return null; 
  }
}

export function isJwtExpired(token?: string | null, skewSeconds = 0) {
  if (!token) return true;
  try {
    const { exp } = jwtDecode<{ exp?: number }>(token);
    if (!exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return now >= (exp - skewSeconds);
  } catch {
    return true;
  }
}