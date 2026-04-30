import "server-only";

import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import type { Role } from "@prisma/client";

const SESSION_COOKIE = "granix_session";
const DEFAULT_SECRET = "lokal-utveckling-byt-denna-hemlighet-minst-32-tecken";

function getSecret() {
  if (process.env.NODE_ENV === "production" && (!process.env.SESSION_SECRET || process.env.SESSION_SECRET === DEFAULT_SECRET)) {
    throw new Error("SESSION_SECRET måste vara satt till ett eget säkert värde i produktion.");
  }
  return new TextEncoder().encode(process.env.SESSION_SECRET || DEFAULT_SECRET);
}

export type SessionUser = {
  id: string;
  username: string;
  email: string | null;
  role: Role;
  employeeId: string | null;
};

export async function createSession(user: SessionUser) {
  const token = await new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    domain: process.env.COOKIE_DOMAIN || undefined,
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as SessionUser;
  } catch {
    return null;
  }
}

export async function requireUser() {
  const session = await getSessionUser();
  if (!session) redirect("/login");
  return session;
}

export async function requireAdmin() {
  const session = await requireUser();
  if (session.role !== "admin") redirect("/dashboard");
  return session;
}

export async function verifyCredentials(identifier: string, password: string) {
  const normalized = identifier.trim().toLowerCase();
  const user = await db.user.findFirst({
    where: {
      active: true,
      OR: [{ username: normalized }, { email: normalized }],
    },
    include: { employee: true },
  });

  if (!user) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    employeeId: user.employeeId,
  };
}
