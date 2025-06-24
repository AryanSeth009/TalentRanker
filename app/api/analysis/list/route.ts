import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"
import { getAnalysesByUser } from "@/lib/analysisService"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
    }

    const analyses = await getAnalysesByUser(user._id!)

    return NextResponse.json({
      success: true,
      analyses,
    })
  } catch (error) {
    console.error("Get analyses error:", error)
    return NextResponse.json({ success: false, message: "Failed to get analyses" }, { status: 500 })
  }
}
