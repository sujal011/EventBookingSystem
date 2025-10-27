import type { Context, Next } from "hono";
import { AuthService } from "../services/auth";

type Variables = {
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
};

/**
 * Authentication middleware that validates JWT tokens
 */
export async function authMiddleware(c: Context<{ Variables: Variables }>, next: Next) {
  const authHeader = c.req.header("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: { code: "UNAUTHORIZED", message: "Missing or invalid authorization header" } }, 401);
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix
  
  try {
    const user = await AuthService.verifyToken(token);
    if (!user) {
      return c.json({ error: { code: "UNAUTHORIZED", message: "Invalid or expired token" } }, 401);
    }

    // Add user to context
    c.set("user", user);
    await next();
  } catch (error) {
    return c.json({ error: { code: "UNAUTHORIZED", message: "Invalid or expired token" } }, 401);
  }
}

/**
 * Admin authorization middleware (requires authentication first)
 */
export async function adminMiddleware(c: Context<{ Variables: Variables }>, next: Next) {
  const user = c.get("user");
  
  if (!user) {
    return c.json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } }, 401);
  }

  if (user.role !== "admin") {
    return c.json({ error: { code: "FORBIDDEN", message: "Admin access required" } }, 403);
  }

  await next();
}

/**
 * Optional authentication middleware (doesn't fail if no token provided)
 */
export async function optionalAuthMiddleware(c: Context<{ Variables: Variables }>, next: Next) {
  const authHeader = c.req.header("Authorization");
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    
    try {
      const user = await AuthService.verifyToken(token);
      if (user) {
        c.set("user", user);
      }
    } catch (error) {
      // Ignore token errors for optional auth
    }
  }

  await next();
}