import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"
import { saveAnalysis } from "@/lib/analysisService"
import { analyzeResumeWithOllama } from "@/lib/ollama"
import { ResumeParser } from "@/lib/resumeParser"
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

    // Process resumes with Grok AI
    const candidates: Candidate[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        const text = await ResumeParser.extractText(file)
        const candidateName = ResumeParser.extractCandidateName(text)
        
        const deepAnalysis = await analyzeResumeWithOllama(text, jobDescription);
        
        const names = candidateName.split(" ")
        const firstName = names[0] || "Unknown"
        const lastName = names.length > 1 ? names[names.length - 1] : "Candidate"
        
        candidates.push({
          id: `candidate-${Date.now()}-${i}`,
          name: candidateName,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
          phone: `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
          matchScore: deepAnalysis.overall_score,
          goodPoints: deepAnalysis.strengths,
          badPoints: deepAnalysis.concerns,
          fileName: file.name,
          experience: "Not extracted",
          skills: deepAnalysis.skill_gaps ? deepAnalysis.skill_gaps.filter((g: any) => g.present).map((g: any) => g.skill) : [],
          education: "Not extracted",
          location: "Not extracted",
          raw_analysis: deepAnalysis,
          summary: deepAnalysis.summary || `Automated analysis for ${candidateName}`,
          status: "pending",
        })
      } catch (err) {
        console.error(`Failed to analyze file ${file.name}:`, err)
      }
    }

    // Calculate statistics
    const highMatches = candidates.filter((c) => c.matchScore >= 80).length
    const mediumMatches = candidates.filter((c) => c.matchScore >= 60 && c.matchScore < 80).length
    const lowMatches = candidates.filter((c) => c.matchScore < 60).length
    const averageScore = candidates.length > 0 ? Math.round(candidates.reduce((sum, c) => sum + c.matchScore, 0) / candidates.length) : 0
    const topScore = candidates.length > 0 ? Math.max(...candidates.map((c) => c.matchScore)) : 0

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
