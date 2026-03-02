import { type NextRequest, NextResponse } from "next/server"
import { ResumeParser } from "@/lib/resumeParser"
import { getUserFromToken } from "@/lib/auth"
import { saveAnalysis } from "@/lib/analysisService"
import { analyzeResumeWithOllama } from "@/lib/ollama"
import type { Analysis, Candidate } from "@/lib/models"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const jobDescription = formData.get("jobDescription") as string
    const files = formData.getAll("resumes") as File[]

    if (!jobDescription) {
      return NextResponse.json({ error: "Job description is required" }, { status: 400 })
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "At least one resume file is required" }, { status: 400 })
    }

    if (files.length > 20) {
      return NextResponse.json({ error: "Maximum 20 files allowed" }, { status: 400 })
    }

    // Step 1: Extract text from all resume files
    const resumeData: Array<{ text: string; name: string; fileName: string }> = []

    for (const file of files) {
      try {
        const text = await ResumeParser.extractText(file)
        const candidateName = ResumeParser.extractCandidateName(text)

        resumeData.push({
          text,
          name: candidateName,
          fileName: file.name,
        })
      } catch (error) {
        console.error(`Error parsing ${file.name}:`, error)
        // Add placeholder for failed parsing
        resumeData.push({
          text: `Failed to parse resume content from ${file.name}`,
          name: `Unknown (${file.name})`,
          fileName: file.name,
        })
      }
    }

    // Step 2: Analyze resumes using Grok AI engine
    const analyses = []
    
    for (const data of resumeData) {
      try {
        const deepAnalysis = await analyzeResumeWithOllama(data.text, jobDescription);
        
        // Add required fields
        analyses.push({
          candidateName: data.name,
          fileName: data.fileName,
          ...deepAnalysis
        })
      } catch (err) {
        console.error(`AI analysis failed for ${data.name}:`, err)
        analyses.push({
          candidateName: data.name,
          fileName: data.fileName,
          overall_score: 0,
          summary: "Analysis Failed",
          skill_gaps: [],
          red_flags: [],
          culture_fit: { score: 0, reasoning: "", matching_values: [], mismatched_values: [], dimensions: [] },
          interview_questions: [],
          strengths: [],
          concerns: ["Failed to contact AI provider. Please check your OpenRouter API key and connection."]
        })
      }
    }

    // Step 3: Return results in the specified format for UI
    const results = analyses.map((analysis) => ({
      candidateName: analysis.candidateName,
      score: analysis.overall_score,
      goodPoints: analysis.strengths,
      badPoints: analysis.concerns,
      fileName: analysis.fileName,
      skills: (analysis.skill_gaps || []).filter((g: any) => g.present).map((g: any) => g.skill),
      deepAnalysis: analysis // pass everything to UI
    }))

    // Step 4: Save to database if user is logged in
    try {
      const token = request.cookies.get("auth-token")?.value
      if (token) {
        const user = await getUserFromToken(token)
        if (user) {
          const candidates: Candidate[] = analyses.map((analysis, index) => {
            const names = analysis.candidateName.split(" ")
            const firstName = names[0] || "Unknown"
            const lastName = names.length > 1 ? names[names.length - 1] : "Candidate"
            
            return {
              id: `candidate-${Date.now()}-${index}`,
              name: analysis.candidateName,
              email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
              phone: `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
              matchScore: analysis.overall_score,
              goodPoints: analysis.strengths,
              badPoints: analysis.concerns,
              fileName: analysis.fileName,
              experience: "Not extracted",
              skills: analysis.skill_gaps ? analysis.skill_gaps.filter((g: any) => g.present).map((g: any) => g.skill) : [],
              education: "Not extracted",
              location: "Not extracted",
              raw_analysis: analysis,
              summary: `Automated analysis for ${analysis.candidateName}`,
              status: "pending",
            }
          })

          const highMatches = candidates.filter((c) => c.matchScore >= 80).length
          const mediumMatches = candidates.filter((c) => c.matchScore >= 60 && c.matchScore < 80).length
          const lowMatches = candidates.filter((c) => c.matchScore < 60).length
          const averageScore = candidates.length > 0 
            ? Math.round(candidates.reduce((sum, c) => sum + c.matchScore, 0) / candidates.length)
            : 0
          const topScore = candidates.length > 0 ? Math.max(...candidates.map((c) => c.matchScore)) : 0

          const dbAnalysis: Omit<Analysis, "_id"> = {
          userId: user._id!.toString(),
          title: `Analysis for ${jobDescription.substring(0, 30)}...`,
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

          await saveAnalysis(dbAnalysis)
        }
      }
    } catch (saveError) {
      console.error("Failed to save analysis to database:", saveError)
      // We don't throw here to avoid failing the analysis request if DB save fails
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze resumes" }, { status: 500 })
  }
}
