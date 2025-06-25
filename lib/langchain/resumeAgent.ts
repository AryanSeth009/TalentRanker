import { initializeAgentExecutorWithOptions } from "langchain/agents"
import { Tool } from "langchain/tools"
import { z } from "zod"

// Analysis result schema
export const AnalysisResultSchema = z.object({
  score: z.number().min(0).max(100),
  goodPoints: z.array(z.string()),
  badPoints: z.array(z.string()),
})

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>

export interface CandidateAnalysis extends AnalysisResult {
  candidateName: string
  fileName: string
}

// Custom Resume Analysis Tool
class ResumeAnalysisTool extends Tool {
  name = "resume_analyzer"
  description = `
    Analyzes a resume against a job description and returns a detailed assessment.
    Input should be a JSON string with 'resumeText' and 'jobDescription' fields.
    Returns a JSON object with score (0-100), goodPoints array, and badPoints array.
  `

  async _call(input: string): Promise<string> {
    try {
      const { resumeText, jobDescription } = JSON.parse(input)

      if (!resumeText || !jobDescription) {
        throw new Error("Both resumeText and jobDescription are required")
      }

      // Create the analysis prompt
      const prompt = this.createAnalysisPrompt(jobDescription, resumeText)

      // For demo purposes, we'll use a sophisticated mock analysis
      // In production, this would call the actual LLM
      const analysis = await this.performAnalysis(resumeText, jobDescription)

      return JSON.stringify(analysis)
    } catch (error) {
      console.error("Resume analysis error:", error)
      return JSON.stringify({
        score: 0,
        goodPoints: [],
        badPoints: ["Error analyzing resume"],
      })
    }
  }

  private createAnalysisPrompt(jobDescription: string, resumeText: string): string {
    return `You are a resume shortlisting assistant.
Compare the following resume text with the job description.
Return:
1. Match score (1–100)
2. Good Points (aligned with JD)
3. Bad Points (missing skills or gaps)

Job Description:
${jobDescription}

Resume:
${resumeText}

Respond in JSON:
{
  "score": ...,
  "goodPoints": [...],
  "badPoints": [...]
}`
  }

  private async performAnalysis(resumeText: string, jobDescription: string): Promise<AnalysisResult> {
    // Advanced analysis logic that simulates LLM behavior
    const resumeLower = resumeText.toLowerCase()
    const jdLower = jobDescription.toLowerCase()

    // Extract requirements and skills from JD
    const requiredSkills = this.extractSkills(jdLower)
    const requiredExperience = this.extractExperience(jdLower)
    const requiredEducation = this.extractEducation(jdLower)

    // Analyze resume against requirements
    const skillAnalysis = this.analyzeSkills(resumeLower, requiredSkills)
    const experienceAnalysis = this.analyzeExperience(resumeLower, requiredExperience)
    const educationAnalysis = this.analyzeEducation(resumeLower, requiredEducation)

    // Calculate weighted score
    const score = this.calculateScore(skillAnalysis, experienceAnalysis, educationAnalysis)

    // Generate insights
    const goodPoints = this.generateGoodPoints(skillAnalysis, experienceAnalysis, educationAnalysis, resumeLower)
    const badPoints = this.generateBadPoints(skillAnalysis, experienceAnalysis, educationAnalysis, requiredSkills)

    return {
      score: Math.round(score),
      goodPoints,
      badPoints,
    }
  }

  private extractSkills(jobDescription: string): string[] {
    const skillPatterns = [
      // Programming languages
      "javascript",
      "typescript",
      "python",
      "java",
      "c++",
      "c#",
      "php",
      "ruby",
      "go",
      "rust",
      // Frontend
      "react",
      "angular",
      "vue",
      "html",
      "css",
      "sass",
      "less",
      "webpack",
      "babel",
      // Backend
      "node.js",
      "express",
      "django",
      "flask",
      "spring",
      "laravel",
      // Databases
      "mongodb",
      "postgresql",
      "mysql",
      "redis",
      "elasticsearch",
      // Cloud & DevOps
      "aws",
      "azure",
      "gcp",
      "docker",
      "kubernetes",
      "jenkins",
      "ci/cd",
      // Other
      "git",
      "agile",
      "scrum",
      "rest",
      "graphql",
      "microservices",
    ]

    return skillPatterns.filter((skill) => jobDescription.includes(skill))
  }

  private extractExperience(jobDescription: string): number {
    const experienceMatch = jobDescription.match(/(\d+)\+?\s*years?\s*(?:of\s*)?experience/i)
    return experienceMatch ? Number.parseInt(experienceMatch[1]) : 0
  }

  private extractEducation(jobDescription: string): string[] {
    const educationTerms = []
    if (jobDescription.includes("bachelor")) educationTerms.push("bachelor")
    if (jobDescription.includes("master")) educationTerms.push("master")
    if (jobDescription.includes("phd") || jobDescription.includes("doctorate")) educationTerms.push("phd")
    return educationTerms
  }

  private analyzeSkills(
    resume: string,
    requiredSkills: string[],
  ): { matched: string[]; missing: string[]; score: number } {
    const matched = requiredSkills.filter((skill) => resume.includes(skill))
    const missing = requiredSkills.filter((skill) => !resume.includes(skill))
    const score = requiredSkills.length > 0 ? (matched.length / requiredSkills.length) * 100 : 50

    return { matched, missing, score }
  }

  private analyzeExperience(resume: string, requiredYears: number): { score: number; hasEnough: boolean } {
    if (requiredYears === 0) return { score: 50, hasEnough: true }

    const experienceMatches = resume.match(/(\d+)\+?\s*years?\s*(?:of\s*)?experience/gi) || []
    const maxExperience = Math.max(
      ...experienceMatches.map((match) => {
        const num = match.match(/(\d+)/)
        return num ? Number.parseInt(num[1]) : 0
      }),
      0,
    )

    const hasEnough = maxExperience >= requiredYears
    const score = Math.min((maxExperience / requiredYears) * 100, 100)

    return { score, hasEnough }
  }

  private analyzeEducation(resume: string, requiredEducation: string[]): { score: number; matched: string[] } {
    const matched = requiredEducation.filter((edu) => resume.includes(edu))
    const score = requiredEducation.length > 0 ? (matched.length / requiredEducation.length) * 100 : 50

    return { score, matched }
  }

  private calculateScore(skillAnalysis: any, experienceAnalysis: any, educationAnalysis: any): number {
    // Weighted scoring
    const skillWeight = 0.5
    const experienceWeight = 0.3
    const educationWeight = 0.2

    return (
      skillAnalysis.score * skillWeight +
      experienceAnalysis.score * experienceWeight +
      educationAnalysis.score * educationWeight
    )
  }

  private generateGoodPoints(
    skillAnalysis: any,
    experienceAnalysis: any,
    educationAnalysis: any,
    resume: string,
  ): string[] {
    const goodPoints: string[] = []

    if (skillAnalysis.matched.length > 0) {
      goodPoints.push(`Strong technical skills: ${skillAnalysis.matched.slice(0, 3).join(", ")}`)
    }

    if (experienceAnalysis.hasEnough) {
      goodPoints.push("Meets experience requirements")
    }

    if (educationAnalysis.matched.length > 0) {
      goodPoints.push(`Relevant education: ${educationAnalysis.matched.join(", ")}`)
    }

    // Additional positive indicators
    if (resume.includes("lead") || resume.includes("senior") || resume.includes("manager")) {
      goodPoints.push("Leadership experience demonstrated")
    }

    if (resume.includes("project") && resume.includes("management")) {
      goodPoints.push("Project management experience")
    }

    if (resume.includes("team") || resume.includes("collaboration")) {
      goodPoints.push("Strong team collaboration skills")
    }

    return goodPoints.slice(0, 5)
  }

  private generateBadPoints(
    skillAnalysis: any,
    experienceAnalysis: any,
    educationAnalysis: any,
    requiredSkills: string[],
  ): string[] {
    const badPoints: string[] = []

    if (skillAnalysis.missing.length > 0) {
      badPoints.push(`Missing key skills: ${skillAnalysis.missing.slice(0, 3).join(", ")}`)
    }

    if (!experienceAnalysis.hasEnough) {
      badPoints.push("May not meet minimum experience requirements")
    }

    if (educationAnalysis.score < 50) {
      badPoints.push("Education background may not align with requirements")
    }

    // Additional gap analysis
    if (skillAnalysis.score < 30) {
      badPoints.push("Limited technical skill alignment with job requirements")
    }

    return badPoints.slice(0, 4)
  }
}

// Main Resume Analysis Agent
export class ResumeAnalysisAgent {
  private agent: any
  private tool: ResumeAnalysisTool

  constructor() {
    this.tool = new ResumeAnalysisTool()
  }

  async initialize() {
    // For demo purposes, we'll use a mock LLM
    // In production, replace with: new ChatOpenAI({ openAIApiKey: process.env.OPENAI_API_KEY })
    const llm = new MockChatModel()
    this.agent = await initializeAgentExecutorWithOptions([this.tool], llm, {
      agentType: "zero-shot-react-description",
      verbose: true,
      maxIterations: 3,
    } as any)
  }

  async analyzeResume(
    resumeText: string,
    jobDescription: string,
    candidateName: string,
    fileName: string,
  ): Promise<CandidateAnalysis> {
    if (!this.agent) {
      await this.initialize()
    }

    try {
      const input = JSON.stringify({ resumeText, jobDescription })
      const result = await this.tool._call(input)
      const analysis = JSON.parse(result)

      return {
        candidateName,
        fileName,
        ...analysis,
      }
    } catch (error) {
      console.error("Agent analysis error:", error)
      return {
        candidateName,
        fileName,
        score: 0,
        goodPoints: [],
        badPoints: ["Analysis failed"],
      }
    }
  }

  async analyzeBatch(
    resumes: Array<{ text: string; name: string; fileName: string }>,
    jobDescription: string,
    onProgress?: (progress: number) => void,
  ): Promise<CandidateAnalysis[]> {
    const results: CandidateAnalysis[] = []

    for (let i = 0; i < resumes.length; i++) {
      const resume = resumes[i]

      try {
        const analysis = await this.analyzeResume(resume.text, jobDescription, resume.name, resume.fileName)
        results.push(analysis)
      } catch (error) {
        console.error(`Error analyzing ${resume.fileName}:`, error)
        results.push({
          candidateName: resume.name,
          fileName: resume.fileName,
          score: 0,
          goodPoints: [],
          badPoints: ["Analysis failed"],
        })
      }

      if (onProgress) {
        onProgress(((i + 1) / resumes.length) * 100)
      }

      // Small delay to prevent overwhelming
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    return results
  }
}

// Mock ChatModel for demo (replace with real OpenAI in production)
class MockChatModel {
  async call(input: string): Promise<string> {
    return "Analysis completed using resume analysis tool."
  }

  async predict(input: string): Promise<string> {
    return this.call(input)
  }

  _llmType(): string {
    return "mock-chat"
  }
}
