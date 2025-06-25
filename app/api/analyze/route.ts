import { type NextRequest, NextResponse } from "next/server"
import { ResumeParser } from "@/lib/resumeParser"
import { MockAnalysisEngine } from "@/lib/mockAnalysisEngine"

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

    // Step 2: Analyze resumes using mock analysis engine
    const analyses = await MockAnalysisEngine.analyzeBatch(resumeData, jobDescription)

    // Step 3: Return results in the specified format
    const results = analyses.map((analysis) => ({
      candidateName: analysis.candidateName,
      score: analysis.score,
      goodPoints: analysis.goodPoints,
      badPoints: analysis.badPoints,
      fileName: analysis.fileName,
      skills: analysis.skills,
    }))

    return NextResponse.json(results)
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze resumes" }, { status: 500 })
  }
}
