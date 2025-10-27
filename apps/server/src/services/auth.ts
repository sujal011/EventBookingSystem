import bcrypt from "bcrypt";
import { sign, verify } from "hono/jwt";
import { eq } from "drizzle-orm";
import { db, users, type NewUser } from "../db";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const SALT_ROUNDS = 12;

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  name: string;
  password: string;
  role?: string;
}

export class AuthService {
  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Verify a password against its hash
   */
  static async verifyPassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate a JWT token for a user
   */
  static async generateToken(user: AuthUser): Promise<string> {
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours from now
    };

    return await sign(payload, JWT_SECRET);
  }

  /**
   * Verify and decode a JWT token
   */
  static async verifyToken(token: string): Promise<AuthUser | null> {
    try {
      const payload = await verify(token, JWT_SECRET);
      return {
        id: payload.id as number,
        email: payload.email as string,
        name: payload.name as string,
        role: payload.role as string,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Register a new user
   */
  static async register(
    userData: RegisterData
  ): Promise<{ user: AuthUser; token: string }> {
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, userData.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error("User with this email already exists");
    }

    // Hash the password
    const passwordHash = await this.hashPassword(userData.password);

    // Create new user
    const newUser: NewUser = {
      email: userData.email,
      name: userData.name,
      passwordHash,
      role: userData.role || "user",
    };

    const createdUsers = await db.insert(users).values(newUser).returning();

    if (!createdUsers.length) {
      throw new Error("Failed to create user");
    }

    const createdUser = createdUsers[0]!;

    const authUser: AuthUser = {
      id: createdUser.id,
      email: createdUser.email,
      name: createdUser.name,
      role: createdUser.role || "user",
    };

    const token = await this.generateToken(authUser);

    return { user: authUser, token };
  }

  /**
   * Login a user with email and password
   */
  static async login(
    credentials: LoginCredentials
  ): Promise<{ user: AuthUser; token: string }> {
    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, credentials.email))
      .limit(1);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isValidPassword = await this.verifyPassword(
      credentials.password,
      user.passwordHash
    );
    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || "user",
    };

    const token = await this.generateToken(authUser);

    return { user: authUser, token };
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: number): Promise<AuthUser | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || "user",
    };
  }
}
