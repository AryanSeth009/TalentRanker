import { ResumeAnalysisAgent, type ResumeAnalysis } from "./agent"
import type { Candidate } from "../models"

export interface ProcessedResume {
  fileName: string
  text: string
  analysis: ResumeAnalysis
}

export class ResumeProcessor {
  private agent: ResumeAnalysisAgent

  constructor() {
    this.agent = new ResumeAnalysisAgent()
  }

  async extractTextFromFile(file: File): Promise<string> {
    // In a real implementation, this would use libraries like:
    // - pdf-parse for PDF files
    // - mammoth for DOCX files
    // For now, we'll simulate text extraction

    const fileName = file.name.toLowerCase()

    if (fileName.endsWith(".pdf")) {
      return this.simulatePDFExtraction(file.name)
    } else if (fileName.endsWith(".docx")) {
      return this.simulateDOCXExtraction(file.name)
    } else {
      throw new Error(`Unsupported file type: ${file.name}`)
    }
  }

  private simulatePDFExtraction(fileName: string): string {
    // Simulate realistic resume content based on filename
    const name = fileName.replace(/[_\-.]/g, " ").replace(/\.(pdf|docx)$/i, "")

    return `
      ${name}
      Software Engineer
      
      EXPERIENCE
      Senior Frontend Developer at TechCorp (2020-2024)
      - Developed React applications with TypeScript
      - Led team of 5 developers
      - Implemented CI/CD pipelines using Docker and AWS
      - Built responsive web applications using modern CSS frameworks
      
      Frontend Developer at StartupXYZ (2018-2020)
      - Created user interfaces using React and Redux
      - Collaborated with UX designers on design systems
      - Optimized application performance and accessibility
      
      SKILLS
      Programming Languages: JavaScript, TypeScript, Python, Java
      Frontend: React, Vue.js, HTML5, CSS3, Sass, Webpack
      Backend: Node.js, Express, REST APIs, GraphQL
      Cloud: AWS, Docker, Kubernetes
      Tools: Git, Jest, Cypress, Figma
      
      EDUCATION
      Bachelor of Science in Computer Science
      University of Technology (2014-2018)
      
      PROJECTS
      - E-commerce platform with microservices architecture
      - Real-time chat application using WebSocket
      - Mobile-first responsive design system
    `
  }

  private simulateDOCXExtraction(fileName: string): string {
    // Similar simulation for DOCX files
    return this.simulatePDFExtraction(fileName)
  }

  async processResumes(
    files: File[],
    jobDescription: string,
    onProgress?: (progress: number, stage: string) => void,
  ): Promise<Candidate[]> {
    const candidates: Candidate[] = []

    // Stage 1: Extract text from files
    onProgress?.(0, "Extracting text from resumes...")
    const resumeTexts: Array<{ text: string; fileName: string }> = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        const text = await this.extractTextFromFile(file)
        resumeTexts.push({ text, fileName: file.name })
      } catch (error) {
        console.error(`Error extracting text from ${file.name}:`, error)
        // Create a placeholder for failed extractions
        resumeTexts.push({
          text: `Resume content could not be extracted from ${file.name}`,
          fileName: file.name,
        })
      }

      onProgress?.(((i + 1) / files.length) * 30, "Extracting text from resumes...")
    }

    // Stage 2: Analyze resumes with LangChain agent
    onProgress?.(30, "Analyzing resumes with AI...")

    const analyses = await this.agent.analyzeBatch(resumeTexts, jobDescription, (progress) => {
      onProgress?.(30 + progress * 0.6, "Analyzing resumes with AI...")
    })

    // Stage 3: Convert to candidate objects
    onProgress?.(90, "Generating candidate profiles...")

    for (let i = 0; i < analyses.length; i++) {
      const analysis = analyses[i]
      const candidate = this.createCandidateFromAnalysis(analysis, i)
      candidates.push(candidate)
    }

    onProgress?.(100, "Analysis complete!")

    return candidates
  }

  private createCandidateFromAnalysis(analysis: ResumeAnalysis & { fileName: string }, index: number): Candidate {
    // Extract candidate information from the analysis
    // In a real implementation, this would use NER (Named Entity Recognition)
    // to extract names, emails, phones, etc. from the resume text

    const firstNames = [
      "Sarah",
      "Michael",
      "Emily",
      "David",
      "Jessica",
      "Robert",
      "Ashley",
      "James",
      "Amanda",
      "Daniel",
    ]
    const lastNames = [
      "Johnson",
      "Williams",
      "Brown",
      "Jones",
      "Garcia",
      "Miller",
      "Davis",
      "Rodriguez",
      "Martinez",
      "Anderson",
    ]

    const firstName = firstNames[index % firstNames.length]
    const lastName = lastNames[index % lastNames.length]
    const name = `${firstName} ${lastName}`

    // Extract skills from good points (in real implementation, this would be more sophisticated)
    const skills = this.extractSkillsFromAnalysis(analysis)

    return {
      id: `candidate-${index}`,
      name,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      phone: `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      matchScore: analysis.score,
      goodPoints: analysis.goodPoints,
      badPoints: analysis.badPoints,
      fileName: analysis.fileName,
      experience: this.extractExperience(),
      skills,
      education: this.extractEducation(),
      location: this.extractLocation(),
      summary: analysis.reasoning,
      status: this.determineStatus(analysis.score),
    }
  }

  private extractSkillsFromAnalysis(analysis: ResumeAnalysis): string[] {
    const allSkills = [
      "React",
      "TypeScript",
      "Node.js",
      "Python",
      "Java",
      "AWS",
      "Docker",
      "Kubernetes",
      "MongoDB",
      "PostgreSQL",
      "GraphQL",
      "REST APIs",
      "Git",
      "Figma",
      "UI/UX Design",
      "Agile",
      "Vue.js",
      "Angular",
      "CSS",
      "HTML",
    ]

    // Extract skills mentioned in good points
    const mentionedSkills = allSkills.filter((skill) =>
      analysis.goodPoints.some((point) => point.toLowerCase().includes(skill.toLowerCase())),
    )

    // Add some random skills to simulate extraction
    const additionalSkills = allSkills
      .filter((skill) => !mentionedSkills.includes(skill))
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.max(0, 6 - mentionedSkills.length))

    return [...mentionedSkills, ...additionalSkills].slice(0, 8)
  }

  private extractExperience(): string {
    const experiences = ["2-3 years", "3-5 years", "5-7 years", "7-10 years", "10+ years"]
    return experiences[Math.floor(Math.random() * experiences.length)]
  }

  private extractEducation(): string {
    const educations = [
      "Bachelor's in Computer Science",
      "Master's in Software Engineering",
      "Bachelor's in Design",
      "PhD in Computer Science",
    ]
    return educations[Math.floor(Math.random() * educations.length)]
  }

  private extractLocation(): string {
    const locations = ["New York, NY", "San Francisco, CA", "Austin, TX", "Seattle, WA", "Boston, MA", "Chicago, IL"]
    return locations[Math.floor(Math.random() * locations.length)]
  }

  private determineStatus(score: number): Candidate["status"] {
    if (score >= 80) return "assessment-scheduled"
    if (score >= 60) return "pending"
    if (score >= 40) return "failed"
    return "failed"
  }
}
