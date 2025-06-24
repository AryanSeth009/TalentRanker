import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"
import { saveAnalysis, generateAccurateCandidate } from "@/lib/analysisService"
import type { Analysis, Candidate } from "@/lib/models"

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

    const { title, jobDescription, files } = await request.json()

    if (!title || !jobDescription || !files || files.length === 0) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Generate accurate candidates based on job description and resume analysis
    const candidates = files.map((file: { name: string }, index: number) => generateAccurateCandidate(file, index, jobDescription))

    // Calculate statistics
    const highMatches = candidates.filter((c: Candidate) => c.matchScore >= 80).length
    const mediumMatches = candidates.filter((c: Candidate) => c.matchScore >= 60 && c.matchScore < 80).length
    const lowMatches = candidates.filter((c: Candidate) => c.matchScore < 60).length
    const averageScore = Math.round(candidates.reduce((sum: number, c: Candidate) => sum + c.matchScore, 0) / candidates.length)
    const topScore = Math.max(...candidates.map((c: Candidate) => c.matchScore))

    const analysis: Omit<Analysis, "_id"> = {
      userId: user._id!.toString(),
      title,
      jobDescription,
      candidates,
      status: "completed",
      createdAt: new Date(),
      updatedAt: new Date(),
      statistics: {
        totalCandidates: candidates.length,
        highMatches,
        mediumMatches,
        lowMatches,
        averageScore,
        topScore,
      },
    }

    const analysisId = await saveAnalysis(analysis)

    return NextResponse.json({
      success: true,
      message: "Analysis created successfully",
      analysisId,
      analysis: { ...analysis, _id: analysisId },
    })
  } catch (error) {
    console.error("Create analysis error:", error)
    return NextResponse.json({ success: false, message: "Failed to create analysis" }, { status: 500 })
  }
}
