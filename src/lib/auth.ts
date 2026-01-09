import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { Role, UserStatus } from "@prisma/client";

// ============================================
// TYPES
// ============================================

export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  avatar: string | null;
}

// ============================================
// CONFIGURATION
// ============================================

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-in-production"
);
const JWT_EXPIRES_IN = "7d";
const COOKIE_NAME = "scb_auth_token";

// ============================================
// PASSWORD UTILITIES
// ============================================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// ============================================
// JWT UTILITIES
// ============================================

export async function createToken(payload: Omit<JWTPayload, "iat" | "exp">): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// ============================================
// COOKIE UTILITIES
// ============================================

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// ============================================
// SESSION UTILITIES
// ============================================

export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = await getAuthCookie();

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      avatar: true,
    },
  });

  if (!user || user.status === "BLOCKED") {
    return null;
  }

  return user;
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();

  if (user.role !== "ADMIN") {
    throw new Error("Forbidden: Admin access required");
  }

  return user;
}

export async function requireCustomer(): Promise<SessionUser> {
  const user = await requireAuth();

  if (user.role !== "CUSTOMER" && user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  return user;
}

// ============================================
// AUTH ACTIONS
// ============================================

export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: SessionUser; error?: string }> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    return { success: false, error: "Invalid email or password" };
  }

  if (user.status === "BLOCKED") {
    return { success: false, error: "Your account has been blocked" };
  }

  const isValid = await verifyPassword(password, user.passwordHash);

  if (!isValid) {
    return { success: false, error: "Invalid email or password" };
  }

  // Update last login time
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Create JWT token
  const token = await createToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Set cookie
  await setAuthCookie(token);

  return {
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
    },
  };
}

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  mobile?: string;
}): Promise<{ success: boolean; user?: SessionUser; error?: string }> {
  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });

  if (existingUser) {
    return { success: false, error: "Email already registered" };
  }

  // Hash password
  const passwordHash = await hashPassword(data.password);

  // Create user
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      mobile: data.mobile || "",
      role: "CUSTOMER",
      status: "ACTIVE",
    },
  });

  // Create JWT token
  const token = await createToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Set cookie
  await setAuthCookie(token);

  return {
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      avatar: user.avatar,
    },
  };
}

export async function logoutUser(): Promise<void> {
  await removeAuthCookie();
}
