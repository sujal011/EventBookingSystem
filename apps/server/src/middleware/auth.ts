import type { Context, Next } from 'hono';
import { AuthService, type AuthUser } from '../services/auth';

// Extend Hono's context to include user
declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser;
  }
}

/**
 * Authentication middleware - verifies JWT token
 */
export const authMiddleware = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader) {
      return c.json({
        success: false,
        error: {
          code: 'MISSING_TOKEN',
          message: 'Authorization header is required'
        }
      }, 401);
    }

    // Extract token from "Bearer <token>" format
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_TOKEN_FORMAT',
          message: 'Token must be provided in Bearer format'
        }
      }, 401);
    }

    // Verify token
    const user = await AuthService.verifyToken(token);
    
    if (!user) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token'
        }
      }, 401);
    }

    // Add user to context
    c.set('user', user);
    
    await next();
  } catch (error) {
    return c.json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication failed'
      }
    }, 401);
  }
};

/**
 * Role-based authorization middleware
 */
export const requireRole = (requiredRole: string) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    
    if (!user) {
      return c.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      }, 401);
    }

    if (user.role !== requiredRole) {
      return c.json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: `${requiredRole} role required`
        }
      }, 403);
    }

    await next();
  };
};

/**
 * Admin-only middleware
 */
export const requireAdmin = requireRole('admin');

/**
 * Optional authentication middleware - adds user to context if token is valid, but doesn't require it
 */
export const optionalAuth = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (authHeader) {
      const token = authHeader.startsWith('Bearer ') 
        ? authHeader.slice(7) 
        : authHeader;

      if (token) {
        const user = await AuthService.verifyToken(token);
        if (user) {
          c.set('user', user);
        }
      }
    }
    
    await next();
  } catch (error) {
    // Continue without authentication if token is invalid
    await next();
  }
};