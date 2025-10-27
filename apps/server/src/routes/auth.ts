import { Hono } from 'hono';
import { AuthService } from '../services/auth';
import { registerSchema, loginSchema } from '../validation/auth';
import { authMiddleware } from '../middleware/auth';

const auth = new Hono();

// Register endpoint
auth.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    
    // Validate input
    const validatedData = registerSchema.parse(body);
    
    // Register user
    const result = await AuthService.register(validatedData);
    
    return c.json({
      success: true,
      data: {
        user: result.user,
        token: result.token
      }
    }, 201);
  } catch (error) {
    if (error instanceof Error) {
      return c.json({
        success: false,
        error: {
          code: 'REGISTRATION_FAILED',
          message: error.message
        }
      }, 400);
    }
    
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      }
    }, 500);
  }
});

// Login endpoint
auth.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    
    // Validate input
    const validatedData = loginSchema.parse(body);
    
    // Login user
    const result = await AuthService.login(validatedData);
    
    return c.json({
      success: true,
      data: {
        user: result.user,
        token: result.token
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      return c.json({
        success: false,
        error: {
          code: 'LOGIN_FAILED',
          message: error.message
        }
      }, 401);
    }
    
    return c.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      }
    }, 500);
  }
});

// Get current user endpoint (protected)
auth.get('/me', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    
    return c.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    return c.json({
      success: false,
      error: {
        code: 'USER_FETCH_FAILED',
        message: 'Failed to fetch user information'
      }
    }, 500);
  }
});

export default auth;