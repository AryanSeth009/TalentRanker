import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"
import { getAnalysisById, deleteAnalysis } from "@/lib/analysisService"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
    }

    const analysis = await getAnalysisById(params.id, user._id!.toString())

    if (!analysis) {
      return NextResponse.json({ success: false, message: "Analysis not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      analysis,
    })
  } catch (error) {
    console.error("Get analysis error:", error)
    return NextResponse.json({ success: false, message: "Failed to get analysis" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
    }

    const success = await deleteAnalysis(params.id, user._id!.toString())

    if (!success) {
      return NextResponse.json(
        { success: false, message: "Analysis not found or could not be deleted" },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Analysis deleted successfully",
    })
  } catch (error) {
    console.error("Delete analysis error:", error)
    return NextResponse.json({ success: false, message: "Failed to delete analysis" }, { status: 500 })
  }
}
