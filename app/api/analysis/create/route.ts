import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"
import { saveAnalysis } from "@/lib/analysisService"
import { ResumeProcessor } from "@/lib/langchain"
import type { Analysis } from "@/lib/models"

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

    const formData = await request.formData()
    const title = formData.get("title") as string
    const jobDescription = formData.get("jobDescription") as string
    const files = formData.getAll("files") as File[]

    if (!title || !jobDescription || !files || files.length === 0) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    if (files.length > 20) {
      return NextResponse.json({ success: false, message: "Maximum 20 files allowed" }, { status: 400 })
    }

    // Process resumes with LangChain agent
    const processor = new ResumeProcessor()
    const candidates = await processor.processResumes(files, jobDescription)

    // Calculate statistics
    const highMatches = candidates.filter((c) => c.matchScore >= 80).length
    const mediumMatches = candidates.filter((c) => c.matchScore >= 60 && c.matchScore < 80).length
    const lowMatches = candidates.filter((c) => c.matchScore < 60).length
    const averageScore = Math.round(candidates.reduce((sum, c) => sum + c.matchScore, 0) / candidates.length)
    const topScore = Math.max(...candidates.map((c) => c.matchScore))

    const analysis: Omit<Analysis, "_id"> = {
      userId: user._id!,
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
