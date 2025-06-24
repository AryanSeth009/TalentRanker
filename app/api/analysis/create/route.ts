export const runtime = "nodejs";

import { type NextRequest, NextResponse } from "next/server"
import { getUserFromToken } from "@/lib/auth"
import { saveAnalysis, generateAccurateCandidate } from "@/lib/analysisService"
import type { Analysis, Candidate } from "@/lib/models"

export async function POST(request: NextRequest) {
  // Dynamically import pdfjs-dist and mammoth inside the handler
  const pdfjsLib = (await import('pdfjs-dist/build/pdf.js'));
  const mammoth = (await import("mammoth")).default;

  async function extractTextFromPDF(buffer: Buffer) {
    const loadingTask = pdfjsLib.getDocument({ data: buffer });
    const pdf = await loadingTask.promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += (content.items as { str: string }[]).map((item) => item.str).join(' ') + '\n';
    }
    return text;
  }

  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
    }

    // Parse multipart form data
    const formData = await request.formData()
    const title = formData.get("title") as string
    const jobDescription = formData.get("jobDescription") as string
    const files = formData.getAll("files") as File[]

    if (!title || !jobDescription || !files || files.length === 0) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Extract text from each file
    const fileContents: string[] = []
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      let text = ""
      if (file.name.toLowerCase().endsWith(".pdf")) {
        try {
          text = await extractTextFromPDF(buffer)
        } catch (e) {
          text = ""
        }
      } else if (file.name.toLowerCase().endsWith(".docx")) {
        try {
          const result = await mammoth.extractRawText({ buffer })
          text = result.value
        } catch (e) {
          text = ""
        }
      } else {
        text = ""
      }
      fileContents.push(text)
    }

    // Generate accurate candidates using real resume content
    const candidates = files.map((file, index) =>
      generateAccurateCandidate({ name: file.name }, index, jobDescription, fileContents[index])
    )

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

    console.log('About to save analysis:', JSON.stringify(analysis, null, 2))
    const analysisId = await saveAnalysis(analysis)
    console.log('Saved analysis with ID:', analysisId)

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
