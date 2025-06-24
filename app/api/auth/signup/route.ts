import { type NextRequest, NextResponse } from "next/server"
import { createUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  console.log('Signup request received')
  
  try {
    const body = await request.json()
    console.log('Request body:', JSON.stringify(body, null, 2))
    
    const { name, email, password } = body

    // Input validation
    if (!name || !email || !password) {
      const missingFields = []
      if (!name) missingFields.push('name')
      if (!email) missingFields.push('email')
      if (!password) missingFields.push('password')
      
      console.error('Missing required fields:', missingFields.join(', '))
      return NextResponse.json({ 
        success: false, 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 })
    }

    if (password.length < 6) {
      console.error('Password too short')
      return NextResponse.json({ 
        success: false, 
        message: "Password must be at least 6 characters" 
      }, { status: 400 })
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      console.error('Invalid email format')
      return NextResponse.json({
        success: false,
        message: "Please enter a valid email address"
      }, { status: 400 })
    }

    console.log('Attempting to create user...')
    const result = await createUser(name, email, password)
    console.log('Create user result:', JSON.stringify(result, null, 2))

    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    // Convert ObjectId to string for frontend
    const responseData = {
      ...result,
      user: result.user ? {
        ...result.user,
        _id: result.user._id!.toString()
      } : undefined
    }

    const response = NextResponse.json(responseData)

    // Set HTTP-only cookie
    response.cookies.set("auth-token", result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/"
    })

    console.log('User created successfully')
    return response
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : "Internal server error" 
    }, { status: 500 })
  }
}
