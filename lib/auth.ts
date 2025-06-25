import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { getDatabase } from "./mongodb"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface User {
  _id?: string
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
  try {
    const db = await getDatabase()
    const users = db.collection<User>("users")

    // Check if user already exists
    const existingUser = await users.findOne({ email })
    if (existingUser) {
      return {
        success: false,
        message: "User with this email already exists",
      }
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password)
    const newUser: User = {
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await users.insertOne(newUser)
    const token = generateToken(result.insertedId.toString())

    return {
      success: true,
      message: "User created successfully",
      user: {
        _id: result.insertedId.toString(),
        name,
        email,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      },
      token,
    }
  } catch (error) {
    console.error("Error creating user:", error)
    return {
      success: false,
      message: "Failed to create user",
    }
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
        _id: user._id!.toString(),
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

    const user = await users.findOne({ _id: decoded.userId })
    if (!user) return null

    return {
      _id: user._id!.toString(),
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
