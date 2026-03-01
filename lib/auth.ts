import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// We use a singleton supabase client for auth actions in the server routes
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  }
})

export interface User {
  _id?: string
  name: string
  email: string
  createdAt: Date | string
  updatedAt: Date | string
}

export interface AuthResult {
  success: boolean
  message: string
  user?: Omit<User, "password">
  token?: string
}

export async function createUser(name: string, email: string, password: string): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        }
      }
    })

    if (error) {
      return {
        success: false,
        message: error.message,
      }
    }

    if (!data.user || !data.session) {
      return {
         success: false,
         message: "Account creation requires email verification.",
      }
    }

    return {
      success: true,
      message: "User created successfully",
      user: {
        _id: data.user.id,
        name: data.user.user_metadata?.name || name,
        email: data.user.email!,
        createdAt: data.user.created_at,
        updatedAt: data.user.updated_at || data.user.created_at,
      },
      token: data.session.access_token,
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return {
        success: false,
        message: "Invalid email or password",
      }
    }

    return {
      success: true,
      message: "Authentication successful",
      user: {
        _id: data.user.id,
        name: data.user.user_metadata?.name || "",
        email: data.user.email!,
        createdAt: data.user.created_at,
        updatedAt: data.user.updated_at || data.user.created_at,
      },
      token: data.session.access_token,
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
    // We send the JWT back to Supabase to verify it and fetch the user
    const { data, error } = await supabase.auth.getUser(token)
    
    if (error || !data.user) return null

    return {
      _id: data.user.id,
      name: data.user.user_metadata?.name || "",
      email: data.user.email!,
      createdAt: data.user.created_at,
      updatedAt: data.user.updated_at || data.user.created_at,
    }
  } catch (error) {
    console.error("Error getting user from token:", error)
    return null
  }
}
