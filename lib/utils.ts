import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface ParsedResume {
  name: string
  email: string
  phone: string
  skills: string[]
  experience: string
  education: string
  summary: string
  projects: string[]
  certifications: string[]
}

export function parseResumeContent(content: string, fileName: string): ParsedResume {
  const lowerContent = content.toLowerCase()
  
  // Extract name from file name or content
  const nameMatch = content.match(/^([A-Z][a-z]+ [A-Z][a-z]+)/m) || 
                   fileName.match(/^([A-Z][a-z]+_[A-Z][a-z]+)/) ||
                   fileName.match(/^([A-Z][a-z]+-[A-Z][a-z]+)/)
  
  const name = nameMatch ? nameMatch[1].replace(/[_-]/g, ' ') : "Unknown Candidate"
  
  // Extract email
  const emailMatch = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
  const email = emailMatch ? emailMatch[0] : `${name.toLowerCase().replace(' ', '.')}@email.com`
  
  // Extract phone
  const phoneMatch = content.match(/[\+]?[1-9][\d]{0,15}/g)
  const phone = phoneMatch ? `+1 (${phoneMatch[0].slice(0, 3)}) ${phoneMatch[0].slice(3, 6)}-${phoneMatch[0].slice(6, 10)}` : "+1 (555) 123-4567"
  
  // Extract skills
  const skillKeywords = [
    "javascript", "typescript", "react", "angular", "vue", "node.js", "python", "java", "c#", "php",
    "aws", "azure", "gcp", "docker", "kubernetes", "mongodb", "postgresql", "mysql", "redis",
    "git", "jenkins", "ci/cd", "agile", "scrum", "rest api", "graphql", "microservices",
    "machine learning", "ai", "data science", "sql", "nosql", "html", "css", "sass", "less",
    "webpack", "babel", "jest", "cypress", "selenium", "jira", "confluence", "figma", "sketch"
  ]
  
  const foundSkills = skillKeywords.filter(skill => lowerContent.includes(skill))
  
  // Extract experience level
  const experiencePatterns = [
    /(\d+)[\s-](\d+)\s*years?/i,
    /(\d+)\+?\s*years?/i,
    /senior/i,
    /junior/i,
    /entry\s*level/i
  ]
  
  let experience = "3-5 years"
  for (const pattern of experiencePatterns) {
    const match = content.match(pattern)
    if (match) {
      if (match[0].toLowerCase().includes('senior')) {
        experience = "7-10 years"
      } else if (match[0].toLowerCase().includes('junior') || match[0].toLowerCase().includes('entry')) {
        experience = "1-2 years"
      } else if (match[1] && match[2]) {
        experience = `${match[1]}-${match[2]} years`
      } else if (match[1]) {
        experience = `${match[1]}+ years`
      }
      break
    }
  }
  
  // Extract education
  const educationPatterns = [
    /bachelor['s]?\s*(?:degree|in|of)/i,
    /master['s]?\s*(?:degree|in|of)/i,
    /ph\.?d/i,
    /associate['s]?\s*(?:degree|in|of)/i
  ]
  
  let education = "Bachelor's in Computer Science"
  for (const pattern of educationPatterns) {
    if (pattern.test(content)) {
      if (pattern.source.includes('ph')) {
        education = "PhD in Computer Science"
      } else if (pattern.source.includes('master')) {
        education = "Master's in Software Engineering"
      } else if (pattern.source.includes('associate')) {
        education = "Associate's in Programming"
      }
      break
    }
  }
  
  // Extract summary
  const summaryMatch = content.match(/(?:summary|profile|about)[:\s]*([^.\n]+)/i)
  const summary = summaryMatch ? summaryMatch[1].trim() : `Experienced ${name.split(' ')[0]} with strong background in software development.`
  
  // Extract projects
  const projectKeywords = ["project", "developed", "built", "created", "implemented"]
  const projects: string[] = []
  
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase()
    if (projectKeywords.some(keyword => line.includes(keyword))) {
      const projectLine = lines[i].trim()
      if (projectLine.length > 10 && projectLine.length < 200) {
        projects.push(projectLine)
      }
    }
  }
  
  // Limit projects to 3
  const limitedProjects = projects.slice(0, 3)
  
  // Extract certifications
  const certKeywords = ["certified", "certification", "aws", "azure", "scrum", "agile"]
  const certifications: string[] = []
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase()
    if (certKeywords.some(keyword => lowerLine.includes(keyword))) {
      const certLine = line.trim()
      if (certLine.length > 5 && certLine.length < 100) {
        certifications.push(certLine)
      }
    }
  }
  
  return {
    name,
    email,
    phone,
    skills: foundSkills.length > 0 ? foundSkills : ["javascript", "react", "node.js"],
    experience,
    education,
    summary,
    projects: limitedProjects.length > 0 ? limitedProjects : ["Web application development", "API integration", "Database design"],
    certifications: certifications.length > 0 ? certifications : ["AWS Certified Developer"]
  }
}

export function calculateSkillMatch(jobSkills: string[], resumeSkills: string[]): number {
  if (jobSkills.length === 0) return 100
  
  const matchedSkills = jobSkills.filter(jobSkill => 
    resumeSkills.some(resumeSkill => 
      resumeSkill.toLowerCase().includes(jobSkill.toLowerCase()) ||
      jobSkill.toLowerCase().includes(resumeSkill.toLowerCase())
    )
  )
  
  return (matchedSkills.length / jobSkills.length) * 100
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return `+1 (${match[1]}) ${match[2]}-${match[3]}`
  }
  return phone
}
