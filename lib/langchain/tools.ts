import { Tool } from "langchain/tools"
import { z } from "zod"

// Schema for resume analysis output
export const ResumeAnalysisSchema = z.object({
  score: z.number().min(0).max(100).describe("Match score between 0-100"),
  goodPoints: z.array(z.string()).describe("List of positive aspects and strengths"),
  badPoints: z.array(z.string()).describe("List of areas for improvement or missing requirements"),
  reasoning: z.string().describe("Brief explanation of the scoring rationale"),
})

export type ResumeAnalysis = z.infer<typeof ResumeAnalysisSchema>

export class ResumeMatcherTool extends Tool {
  name = "resume_matcher"
  description = `
    Analyzes a resume against a job description and returns a detailed assessment.
    Input should be a JSON string with 'resume' and 'jobDescription' fields.
    Returns a JSON object with score (0-100), goodPoints array, badPoints array, and reasoning.
  `

  private async analyzeResume(resumeText: string, jobDescription: string): Promise<ResumeAnalysis> {
    // This is where the actual AI analysis would happen
    // For now, we'll implement a sophisticated mock that simulates real analysis

    const resumeLower = resumeText.toLowerCase()
    const jdLower = jobDescription.toLowerCase()

    // Extract key requirements from job description
    const requirements = this.extractRequirements(jdLower)
    const skills = this.extractSkills(jdLower)
    const experience = this.extractExperience(jdLower)

    // Analyze resume against requirements
    const skillMatches = this.analyzeSkillMatches(resumeLower, skills)
    const experienceMatch = this.analyzeExperienceMatch(resumeLower, experience)
    const requirementMatches = this.analyzeRequirementMatches(resumeLower, requirements)

    // Calculate score
    const score = this.calculateScore(skillMatches, experienceMatch, requirementMatches)

    // Generate good and bad points
    const goodPoints = this.generateGoodPoints(skillMatches, experienceMatch, requirementMatches, resumeLower)
    const badPoints = this.generateBadPoints(skillMatches, experienceMatch, requirementMatches, skills, requirements)

    const reasoning = this.generateReasoning(score, skillMatches, experienceMatch, requirementMatches)

    return {
      score: Math.round(score),
      goodPoints,
      badPoints,
      reasoning,
    }
  }

  private extractRequirements(jobDescription: string): string[] {
    const requirements: string[] = []

    // Look for common requirement patterns
    const patterns = [
      /bachelor'?s?\s+degree/g,
      /master'?s?\s+degree/g,
      /\d+\+?\s+years?\s+(?:of\s+)?experience/g,
      /experience\s+(?:with|in)\s+[\w\s,]+/g,
      /knowledge\s+of\s+[\w\s,]+/g,
      /proficient\s+in\s+[\w\s,]+/g,
      /familiar\s+with\s+[\w\s,]+/g,
    ]

    patterns.forEach((pattern) => {
      const matches = jobDescription.match(pattern)
      if (matches) {
        requirements.push(...matches)
      }
    })

    return requirements
  }

  private extractSkills(jobDescription: string): string[] {
    const commonSkills = [
      "react",
      "angular",
      "vue",
      "javascript",
      "typescript",
      "node.js",
      "python",
      "java",
      "aws",
      "azure",
      "docker",
      "kubernetes",
      "mongodb",
      "postgresql",
      "mysql",
      "git",
      "agile",
      "scrum",
      "rest",
      "graphql",
      "microservices",
      "ci/cd",
      "html",
      "css",
      "sass",
      "webpack",
      "babel",
      "jest",
      "cypress",
      "figma",
      "sketch",
      "photoshop",
      "ui/ux",
      "design systems",
    ]

    return commonSkills.filter((skill) => jobDescription.includes(skill))
  }

  private extractExperience(jobDescription: string): number {
    const experienceMatch = jobDescription.match(/(\d+)\+?\s+years?\s+(?:of\s+)?experience/)
    return experienceMatch ? Number.parseInt(experienceMatch[1]) : 0
  }

  private analyzeSkillMatches(
    resume: string,
    requiredSkills: string[],
  ): { matched: string[]; missing: string[]; score: number } {
    const matched = requiredSkills.filter((skill) => resume.includes(skill))
    const missing = requiredSkills.filter((skill) => !resume.includes(skill))
    const score = requiredSkills.length > 0 ? (matched.length / requiredSkills.length) * 100 : 50

    return { matched, missing, score }
  }

  private analyzeExperienceMatch(resume: string, requiredYears: number): { hasExperience: boolean; score: number } {
    if (requiredYears === 0) return { hasExperience: true, score: 50 }

    const experienceMatches = resume.match(/(\d+)\+?\s+years?\s+(?:of\s+)?experience/g)
    if (!experienceMatches) return { hasExperience: false, score: 20 }

    const maxExperience = Math.max(
      ...experienceMatches.map((match) => {
        const num = match.match(/(\d+)/)
        return num ? Number.parseInt(num[1]) : 0
      }),
    )

    const hasExperience = maxExperience >= requiredYears
    const score = Math.min((maxExperience / requiredYears) * 100, 100)

    return { hasExperience, score }
  }

  private analyzeRequirementMatches(
    resume: string,
    requirements: string[],
  ): { matched: number; total: number; score: number } {
    let matched = 0

    requirements.forEach((req) => {
      // Simple keyword matching - in real implementation, this would be more sophisticated
      const keywords = req.split(/\s+/).filter((word) => word.length > 3)
      const hasMatch = keywords.some((keyword) => resume.includes(keyword.toLowerCase()))
      if (hasMatch) matched++
    })

    const score = requirements.length > 0 ? (matched / requirements.length) * 100 : 50
    return { matched, total: requirements.length, score }
  }

  private calculateScore(
    skillMatches: { score: number },
    experienceMatch: { score: number },
    requirementMatches: { score: number },
  ): number {
    // Weighted scoring
    const skillWeight = 0.4
    const experienceWeight = 0.3
    const requirementWeight = 0.3

    return (
      skillMatches.score * skillWeight +
      experienceMatch.score * experienceWeight +
      requirementMatches.score * requirementWeight
    )
  }

  private generateGoodPoints(
    skillMatches: { matched: string[] },
    experienceMatch: { hasExperience: boolean },
    requirementMatches: { matched: number },
    resume: string,
  ): string[] {
    const goodPoints: string[] = []

    if (skillMatches.matched.length > 0) {
      goodPoints.push(`Strong technical skills: ${skillMatches.matched.slice(0, 3).join(", ")}`)
    }

    if (experienceMatch.hasExperience) {
      goodPoints.push("Meets experience requirements")
    }

    if (requirementMatches.matched > 0) {
      goodPoints.push("Fulfills key job requirements")
    }

    // Additional analysis based on resume content
    if (resume.includes("leadership") || resume.includes("lead") || resume.includes("manager")) {
      goodPoints.push("Demonstrates leadership experience")
    }

    if (resume.includes("project") && resume.includes("management")) {
      goodPoints.push("Project management experience")
    }

    if (resume.includes("team") || resume.includes("collaboration")) {
      goodPoints.push("Strong team collaboration skills")
    }

    if (resume.includes("agile") || resume.includes("scrum")) {
      goodPoints.push("Agile methodology experience")
    }

    return goodPoints.slice(0, 5) // Limit to top 5 points
  }

  private generateBadPoints(
    skillMatches: { missing: string[] },
    experienceMatch: { hasExperience: boolean },
    requirementMatches: { matched: number; total: number },
    requiredSkills: string[],
    requirements: string[],
  ): string[] {
    const badPoints: string[] = []

    if (skillMatches.missing.length > 0) {
      badPoints.push(`Missing key skills: ${skillMatches.missing.slice(0, 3).join(", ")}`)
    }

    if (!experienceMatch.hasExperience) {
      badPoints.push("May not meet minimum experience requirements")
    }

    if (requirementMatches.matched < requirementMatches.total * 0.5) {
      badPoints.push("Limited alignment with job requirements")
    }

    // Additional gap analysis
    if (requiredSkills.includes("react") && !skillMatches.missing.includes("react")) {
      // This candidate has React, check for related skills
      if (!requiredSkills.some((skill) => ["typescript", "javascript"].includes(skill))) {
        badPoints.push("Could benefit from stronger JavaScript/TypeScript foundation")
      }
    }

    return badPoints.slice(0, 4) // Limit to top 4 points
  }

  private generateReasoning(
    score: number,
    skillMatches: { matched: string[]; missing: string[] },
    experienceMatch: { hasExperience: boolean },
    requirementMatches: { matched: number; total: number },
  ): string {
    let reasoning = `Score: ${Math.round(score)}/100. `

    if (score >= 80) {
      reasoning += "Excellent match with strong alignment across all criteria."
    } else if (score >= 60) {
      reasoning += "Good match with some areas for development."
    } else {
      reasoning += "Moderate match with significant gaps to address."
    }

    reasoning += ` Skills: ${skillMatches.matched.length}/${skillMatches.matched.length + skillMatches.missing.length} matched.`
    reasoning += ` Requirements: ${requirementMatches.matched}/${requirementMatches.total} fulfilled.`

    return reasoning
  }

  async _call(input: string): Promise<string> {
    try {
      const { resume, jobDescription } = JSON.parse(input)

      if (!resume || !jobDescription) {
        throw new Error("Both resume and jobDescription are required")
      }

      const analysis = await this.analyzeResume(resume, jobDescription)
      return JSON.stringify(analysis)
    } catch (error) {
      console.error("Resume analysis error:", error)
      return JSON.stringify({
        score: 0,
        goodPoints: [],
        badPoints: ["Error analyzing resume"],
        reasoning: "Analysis failed due to technical error",
      })
    }
  }
}
