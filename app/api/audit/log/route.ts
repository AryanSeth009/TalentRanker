import { createClient } from "@/utils/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
    }

    const { candidateId, originalScore, anonymizedScore } = await request.json()

    if (!candidateId) {
      return NextResponse.json({ success: false, message: "Missing candidateId" }, { status: 400 })
    }

    const supabase = await createClient()
    
    const { error } = await supabase
      .from("bias_audit_logs")
      .insert({
        candidate_id: candidateId,
        original_score: originalScore,
        anonymized_score: anonymizedScore,
        delta: anonymizedScore - originalScore,
      })

    if (error) {
      console.error("Supabase audit log error:", error)
      return NextResponse.json({ success: false, message: "Failed to log audit" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Audit log recorded" })
  } catch (error) {
    console.error("Audit API Error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
