// Sophisticated mock analysis engine (no OpenAI needed)
export interface AnalysisResult {
  candidateName: string
  score: number
  goodPoints: string[]
  badPoints: string[]
  fileName: string
  skills: string[]
}

export class MockAnalysisEngine {
  static async analyzeResume(
    resumeText: string,
    jobDescription: string,
    candidateName: string,
    fileName: string,
  ): Promise<AnalysisResult> {
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000))

    const resumeLower = resumeText.toLowerCase()
    const jdLower = jobDescription.toLowerCase()

    // Extract requirements from job description
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
      candidateName,
      fileName,
      score: Math.round(score),
      goodPoints,
      badPoints,
      skills: skillAnalysis.matched,
    }
  }

  static async analyzeBatch(
    resumes: Array<{ text: string; name: string; fileName: string }>,
    jobDescription: string,
    onProgress?: (progress: number) => void,
  ): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = []

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
          skills: [],
        })
      }

      if (onProgress) {
        onProgress(((i + 1) / resumes.length) * 100)
      }
    }

    return results
  }

  private static extractSkills(jobDescription: string): string[] {
    const skillPatterns = [
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
      "react",
      "angular",
      "vue",
      "html",
      "css",
      "sass",
      "less",
      "webpack",
      "babel",
      "node.js",
      "express",
      "django",
      "flask",
      "spring",
      "laravel",
      "mongodb",
      "postgresql",
      "mysql",
      "redis",
      "elasticsearch",
      "aws",
      "azure",
      "gcp",
      "docker",
      "kubernetes",
      "jenkins",
      "ci/cd",
      "git",
      "agile",
      "scrum",
      "rest",
      "graphql",
      "microservices",
    ]

    return skillPatterns.filter((skill) => jobDescription.includes(skill))
  }

  private static extractExperience(jobDescription: string): number {
    const experienceMatch = jobDescription.match(/(\d+)\+?\s*years?\s*(?:of\s*)?experience/i)
    return experienceMatch ? Number.parseInt(experienceMatch[1]) : 0
  }

  private static extractEducation(jobDescription: string): string[] {
    const educationTerms = []
    if (jobDescription.includes("bachelor")) educationTerms.push("bachelor")
    if (jobDescription.includes("master")) educationTerms.push("master")
    if (jobDescription.includes("phd") || jobDescription.includes("doctorate")) educationTerms.push("phd")
    return educationTerms
  }

  private static analyzeSkills(
    resume: string,
    requiredSkills: string[],
  ): {
    matched: string[]
    missing: string[]
    score: number
  } {
    const matched = requiredSkills.filter((skill) => resume.includes(skill))
    const missing = requiredSkills.filter((skill) => !resume.includes(skill))
    const score = requiredSkills.length > 0 ? (matched.length / requiredSkills.length) * 100 : 50

    return { matched, missing, score }
  }

  private static analyzeExperience(
    resume: string,
    requiredYears: number,
  ): {
    score: number
    hasEnough: boolean
  } {
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

  private static analyzeEducation(
    resume: string,
    requiredEducation: string[],
  ): {
    score: number
    matched: string[]
  } {
    const matched = requiredEducation.filter((edu) => resume.includes(edu))
    const score = requiredEducation.length > 0 ? (matched.length / requiredEducation.length) * 100 : 50

    return { score, matched }
  }

  private static calculateScore(skillAnalysis: any, experienceAnalysis: any, educationAnalysis: any): number {
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

  private static generateGoodPoints(
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

    if (resume.includes("agile") || resume.includes("scrum")) {
      goodPoints.push("Agile methodology experience")
    }

    if (resume.includes("aws") || resume.includes("cloud")) {
      goodPoints.push("Cloud platform experience")
    }

    return goodPoints.slice(0, 5)
  }

  private static generateBadPoints(
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

    if (skillAnalysis.score < 30) {
      badPoints.push("Limited technical skill alignment with job requirements")
    }

    if (skillAnalysis.score < 50) {
      badPoints.push("Could benefit from additional training in required technologies")
    }

    return badPoints.slice(0, 4)
  }
}
