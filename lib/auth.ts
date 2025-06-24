import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"
import { getDatabase } from "./mongodb"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface User {
  _id?: ObjectId
  name: string
  email: string
  password?: string
  createdAt: Date
  updatedAt: Date
}

export interface AuthResult {
  success: boolean
  message: string
  user?: Omit<User, "password">
  token?: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}

export async function createUser(name: string, email: string, password: string): Promise<AuthResult> {
  console.log('Starting user creation for:', email);
  
  try {
    console.log('Getting database connection...');
    const db = await getDatabase();
    console.log('Database connection established');
    
    const users = db.collection<User>("users");
    console.log('Checking for existing user...');

    // Check if user already exists
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return {
        success: false,
        message: "User with this email already exists",
      };
    }

    console.log('Hashing password...');
    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    
    const newUser: User = {
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('Inserting new user into database...');
    const result = await users.insertOne(newUser);
    console.log('User inserted with ID:', result.insertedId);
    
    const token = generateToken(result.insertedId.toString());
    console.log('Generated JWT token');

    const userResponse = {
      _id: result.insertedId,
      name,
      email,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    console.log('User created successfully:', userResponse);
    return {
      success: true,
      message: "User created successfully",
      user: userResponse,
      token,
    };
  } catch (error) {
    console.error("Error in createUser function:", {
      name,
      email,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create user",
    };
  }
}

export async function authenticateUser(email: string, password: string): Promise<AuthResult> {
  try {
    const db = await getDatabase()
    const users = db.collection<User>("users")

    const user = await users.findOne({ email })
    if (!user || !user.password) {
      return {
        success: false,
        message: "Invalid email or password",
      }
    }

    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return {
        success: false,
        message: "Invalid email or password",
      }
    }

    const token = generateToken(user._id!.toString())

    return {
      success: true,
      message: "Authentication successful",
      user: {
        _id: user._id!,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    }
  } catch (error) {
    console.error("Error authenticating user:", error)
    return {
      success: false,
      message: "Authentication failed",
    }
  }
}

export async function getUserFromToken(token: string): Promise<Omit<User, "password"> | null> {
  try {
    const decoded = verifyToken(token)
    if (!decoded) return null

    const db = await getDatabase()
    const users = db.collection<User>("users")

    const user = await users.findOne({ _id: new ObjectId(decoded.userId) })
    if (!user) return null

    return {
      _id: user._id!,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  } catch (error) {
    console.error("Error getting user from token:", error)
    return null
  }
}
