import { getDatabase } from "./mongodb"
import type { Analysis, Candidate } from "./models"
import { ObjectId } from "mongodb"
import { parseResumeContent, type ParsedResume } from "./utils"

export async function saveAnalysis(analysis: Omit<Analysis, "_id">): Promise<string> {
  try {
    const db = await getDatabase()
    const analyses = db.collection<Analysis>("analyses")
    console.log('Inserting analysis into MongoDB:', JSON.stringify(analysis, null, 2))
    const result = await analyses.insertOne({
      ...analysis,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    console.log('Insert result:', result)
    return result.insertedId.toString()
  } catch (error) {
    console.error("Error saving analysis:", error)
    throw new Error("Failed to save analysis")
  }
}

export async function getAnalysesByUser(userId: string): Promise<Analysis[]> {
  try {
    const db = await getDatabase()
    const analyses = db.collection<Analysis>("analyses")

    const results = await analyses.find({ userId }).sort({ createdAt: -1 }).toArray()

    return results
  } catch (error) {
    console.error("Error getting analyses:", error)
    throw new Error("Failed to get analyses")
  }
}

export async function getAnalysisById(analysisId: string, userId: string): Promise<Analysis | null> {
  try {
    const db = await getDatabase()
    const analyses = db.collection<Analysis>("analyses")

    const analysis = await analyses.findOne({
      _id: new ObjectId(analysisId),
      userId,
    })

    return analysis
  } catch (error) {
    console.error("Error getting analysis:", error)
    return null
  }
}

export async function updateAnalysisStatus(
  analysisId: string,
  status: Analysis["status"],
  userId: string,
): Promise<boolean> {
  try {
    const db = await getDatabase()
    const analyses = db.collection<Analysis>("analyses")

    const result = await analyses.updateOne(
      { _id: new ObjectId(analysisId), userId },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
    )

    return result.modifiedCount > 0
  } catch (error) {
    console.error("Error updating analysis status:", error)
    return false
  }
}

export async function deleteAnalysis(analysisId: string, userId: string): Promise<boolean> {
  try {
    const db = await getDatabase()
    const analyses = db.collection<Analysis>("analyses")

    const result = await analyses.deleteOne({
      _id: new ObjectId(analysisId),
      userId,
    })

    return result.deletedCount > 0
  } catch (error) {
    console.error("Error deleting analysis:", error)
    return false
  }
}

interface JobRequirements {
  requiredSkills: string[]
  preferredSkills: string[]
  experienceLevel: string
  education: string[]
  keywords: string[]
}

interface ResumeData {
  skills: string[]
  experience: string
  education: string
  summary: string
  projects: string[]
  certifications: string[]
}

export function analyzeJobDescription(jobDescription: string): JobRequirements {
  const lowerJobDesc = jobDescription.toLowerCase()
  
  // Common tech skills to look for
  const techSkills = [
    "javascript", "typescript", "react", "angular", "vue", "node.js", "python", "java", "c#", "php",
    "aws", "azure", "gcp", "docker", "kubernetes", "mongodb", "postgresql", "mysql", "redis",
    "git", "jenkins", "ci/cd", "agile", "scrum", "rest api", "graphql", "microservices",
    "machine learning", "ai", "data science", "sql", "nosql", "html", "css", "sass", "less",
    "webpack", "babel", "jest", "cypress", "selenium", "jira", "confluence", "figma", "sketch"
  ]
  
  // Experience level indicators
  const experienceLevels = {
    "junior": ["junior", "entry level", "0-2 years", "1-2 years", "recent graduate"],
    "mid": ["mid level", "intermediate", "3-5 years", "4-6 years", "experienced"],
    "senior": ["senior", "lead", "5+ years", "7+ years", "expert", "principal"]
  }
  
  // Education requirements
  const educationKeywords = ["bachelor", "master", "phd", "degree", "diploma", "certification"]
  
  const requiredSkills: string[] = []
  const preferredSkills: string[] = []
  const education: string[] = []
  const keywords: string[] = []
  
  // Extract skills
  techSkills.forEach(skill => {
    if (lowerJobDesc.includes(skill)) {
      if (lowerJobDesc.includes(`required ${skill}`) || lowerJobDesc.includes(`must have ${skill}`)) {
        requiredSkills.push(skill)
      } else {
        preferredSkills.push(skill)
      }
    }
  })
  
  // Determine experience level
  let experienceLevel = "mid"
  for (const [level, indicators] of Object.entries(experienceLevels)) {
    if (indicators.some(indicator => lowerJobDesc.includes(indicator))) {
      experienceLevel = level
      break
    }
  }
  
  // Extract education requirements
  educationKeywords.forEach(edu => {
    if (lowerJobDesc.includes(edu)) {
      education.push(edu)
    }
  })
  
  // Extract other keywords
  const commonKeywords = ["remote", "hybrid", "onsite", "full-time", "part-time", "contract", "freelance"]
  commonKeywords.forEach(keyword => {
    if (lowerJobDesc.includes(keyword)) {
      keywords.push(keyword)
    }
  })
  
  return {
    requiredSkills,
    preferredSkills,
    experienceLevel,
    education,
    keywords
  }
}

export function extractResumeData(fileName: string, index: number, resumeContent?: string): ResumeData {
  // If we have actual resume content, parse it
  if (resumeContent) {
    const parsed = parseResumeContent(resumeContent, fileName)
    return {
      skills: parsed.skills,
      experience: parsed.experience,
      education: parsed.education,
      summary: parsed.summary,
      projects: parsed.projects,
      certifications: parsed.certifications
    }
  }
  
  // Fallback to generated data based on file name and index
  const techStacks = [
    ["javascript", "react", "node.js", "mongodb", "express"],
    ["typescript", "angular", "java", "spring", "postgresql"],
    ["python", "django", "flask", "mysql", "docker"],
    ["c#", ".net", "sql server", "azure", "entity framework"],
    ["php", "laravel", "wordpress", "mysql", "apache"],
    ["react", "typescript", "node.js", "graphql", "aws"],
    ["vue", "javascript", "python", "fastapi", "postgresql"],
    ["angular", "typescript", "java", "spring boot", "mongodb"]
  ]
  
  const experienceLevels = [
    "1-2 years",
    "2-3 years", 
    "3-5 years",
    "5-7 years",
    "7-10 years",
    "10+ years"
  ]
  
  const educationLevels = [
    "Bachelor's in Computer Science",
    "Master's in Software Engineering",
    "Bachelor's in Information Technology",
    "PhD in Computer Science",
    "Associate's in Programming",
    "Bootcamp Graduate"
  ]
  
  const stackIndex = index % techStacks.length
  const skills = techStacks[stackIndex]
  
  // Add some random additional skills
  const additionalSkills = ["git", "agile", "scrum", "rest api", "testing", "ci/cd"]
  const randomSkills = additionalSkills.sort(() => 0.5 - Math.random()).slice(0, 2)
  
  return {
    skills: [...skills, ...randomSkills],
    experience: experienceLevels[Math.floor(Math.random() * experienceLevels.length)],
    education: educationLevels[Math.floor(Math.random() * educationLevels.length)],
    summary: `Experienced developer with expertise in ${skills.slice(0, 3).join(", ")} and strong problem-solving skills.`,
    projects: [
      `E-commerce platform built with ${skills[0]} and ${skills[1]}`,
      `REST API service using ${skills[2]} and ${skills[3]}`,
      `Mobile app with React Native and ${skills[0]}`
    ],
    certifications: [
      `${skills[0].toUpperCase()} Developer Certification`,
      "AWS Certified Developer",
      "Agile Scrum Master"
    ]
  }
}

export function calculateMatchScore(jobRequirements: JobRequirements, resumeData: ResumeData): {
  score: number
  goodPoints: string[]
  badPoints: string[]
} {
  let score = 0
  const goodPoints: string[] = []
  const badPoints: string[] = []
  
  // Skills matching (40% of score)
  const requiredSkillsMatch = jobRequirements.requiredSkills.filter(skill => 
    resumeData.skills.some(resumeSkill => 
      resumeSkill.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(resumeSkill.toLowerCase())
    )
  ).length
  
  const preferredSkillsMatch = jobRequirements.preferredSkills.filter(skill => 
    resumeData.skills.some(resumeSkill => 
      resumeSkill.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(resumeSkill.toLowerCase())
    )
  ).length
  
  const requiredSkillsScore = (requiredSkillsMatch / Math.max(jobRequirements.requiredSkills.length, 1)) * 40
  const preferredSkillsScore = (preferredSkillsMatch / Math.max(jobRequirements.preferredSkills.length, 1)) * 20
  
  score += requiredSkillsScore + preferredSkillsScore
  
  // Experience level matching (25% of score)
  const experienceScore = calculateExperienceScore(jobRequirements.experienceLevel, resumeData.experience)
  score += experienceScore
  
  // Education matching (15% of score)
  const educationScore = calculateEducationScore(jobRequirements.education, resumeData.education)
  score += educationScore
  
  // Project relevance (20% of score)
  const projectScore = calculateProjectScore(jobRequirements, resumeData)
  score += projectScore
  
  // Generate feedback points
  if (requiredSkillsMatch > 0) {
    goodPoints.push(`Matches ${requiredSkillsMatch} out of ${jobRequirements.requiredSkills.length} required skills`)
  } else {
    badPoints.push("No required skills match found")
  }
  
  if (preferredSkillsMatch > 0) {
    goodPoints.push(`Has ${preferredSkillsMatch} preferred skills`)
  }
  
  if (experienceScore > 15) {
    goodPoints.push("Experience level aligns well with job requirements")
  } else {
    badPoints.push("Experience level may not match job requirements")
  }
  
  if (educationScore > 10) {
    goodPoints.push("Education background is relevant")
  }
  
  if (projectScore > 15) {
    goodPoints.push("Project experience is relevant to the role")
  } else {
    badPoints.push("Limited relevant project experience")
  }
  
  if (resumeData.certifications.length > 0) {
    goodPoints.push("Has relevant certifications")
  }
  
  return {
    score: Math.round(score),
    goodPoints,
    badPoints
  }
}

function calculateExperienceScore(requiredLevel: string, candidateExperience: string): number {
  const experienceYears = extractYearsFromExperience(candidateExperience)
  
  switch (requiredLevel) {
    case "junior":
      return experienceYears <= 2 ? 25 : Math.max(0, 25 - (experienceYears - 2) * 5)
    case "mid":
      return experienceYears >= 2 && experienceYears <= 7 ? 25 : Math.max(0, 25 - Math.abs(experienceYears - 4) * 5)
    case "senior":
      return experienceYears >= 5 ? 25 : Math.max(0, 25 - (5 - experienceYears) * 5)
    default:
      return 15
  }
}

function calculateEducationScore(requiredEducation: string[], candidateEducation: string): number {
  if (requiredEducation.length === 0) return 15
  
  const candidateEduLower = candidateEducation.toLowerCase()
  const hasRelevantEducation = requiredEducation.some(edu => 
    candidateEduLower.includes(edu.toLowerCase())
  )
  
  return hasRelevantEducation ? 15 : 5
}

function calculateProjectScore(jobRequirements: JobRequirements, resumeData: ResumeData): number {
  const relevantKeywords = [...jobRequirements.requiredSkills, ...jobRequirements.preferredSkills]
  
  const relevantProjects = resumeData.projects.filter(project => 
    relevantKeywords.some(keyword => 
      project.toLowerCase().includes(keyword.toLowerCase())
    )
  ).length
  
  return (relevantProjects / Math.max(resumeData.projects.length, 1)) * 20
}

function extractYearsFromExperience(experience: string): number {
  const match = experience.match(/(\d+)/)
  return match ? parseInt(match[1]) : 3
}

export function generateAccurateCandidate(file: { name: string }, index: number, jobDescription: string, resumeContent?: string): Candidate {
  const jobRequirements = analyzeJobDescription(jobDescription)
  const resumeData = extractResumeData(file.name, index, resumeContent)
  const matchAnalysis = calculateMatchScore(jobRequirements, resumeData)
  
  const firstNames = ["Sarah", "Michael", "Emily", "David", "Jessica", "Robert", "Ashley", "James", "Amanda", "Daniel"]
  const lastNames = ["Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Anderson"]
  const locations = ["New York, NY", "San Francisco, CA", "Austin, TX", "Seattle, WA", "Boston, MA", "Chicago, IL"]
  const statuses: Candidate["status"][] = ["assessment-scheduled", "passed", "failed", "pending"]

  // If we have parsed resume data, use the actual name
  let name: string
  if (resumeContent) {
    const parsed = parseResumeContent(resumeContent, file.name)
    name = parsed.name
  } else {
    const firstName = firstNames[index % firstNames.length]
    const lastName = lastNames[index % lastNames.length]
    name = `${firstName} ${lastName}`
  }
  
  // Determine status based on score
  let status: Candidate["status"] = "pending"
  if (matchAnalysis.score >= 80) {
    status = "assessment-scheduled"
  } else if (matchAnalysis.score >= 60) {
    status = "passed"
  } else {
    status = "failed"
  }
  
  // Use parsed data for contact info if available
  let email: string
  let phone: string
  
  if (resumeContent) {
    const parsed = parseResumeContent(resumeContent, file.name)
    email = parsed.email
    phone = parsed.phone
  } else {
    email = `${name.toLowerCase().replace(' ', '.')}@email.com`
    phone = `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`
  }

  return {
    id: `candidate-${index}`,
    name,
    email,
    phone,
    matchScore: matchAnalysis.score,
    goodPoints: matchAnalysis.goodPoints,
    badPoints: matchAnalysis.badPoints,
    fileName: file.name,
    experience: resumeData.experience,
    skills: resumeData.skills,
    education: resumeData.education,
    location: locations[index % locations.length],
    summary: resumeData.summary,
    status,
  }
}
