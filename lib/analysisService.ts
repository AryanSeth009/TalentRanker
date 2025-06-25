import { getDatabase } from "./mongodb"
import type { Analysis, Candidate } from "./models"
import { ObjectId } from "mongodb"

export async function saveAnalysis(analysis: Omit<Analysis, "_id">): Promise<string> {
  try {
    const db = await getDatabase()
    const analyses = db.collection<Analysis>("analyses")

    const result = await analyses.insertOne({
      ...analysis,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

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

    return results.map((analysis) => ({
      ...analysis,
      _id: analysis._id!.toString(),
    }))
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

    if (!analysis) return null

    return {
      ...analysis,
      _id: analysis._id!.toString(),
    }
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

export function generateMockCandidate(file: { name: string }, index: number): Candidate {
  const firstNames = ["Sarah", "Michael", "Emily", "David", "Jessica", "Robert", "Ashley", "James", "Amanda", "Daniel"]
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

  const skills = [
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
  ]

  const experiences = ["2-3 years", "3-5 years", "5-7 years", "7-10 years", "10+ years"]
  const educations = [
    "Bachelor's in Computer Science",
    "Master's in Software Engineering",
    "Bachelor's in Design",
    "PhD in Computer Science",
  ]
  const locations = ["New York, NY", "San Francisco, CA", "Austin, TX", "Seattle, WA", "Boston, MA", "Chicago, IL"]
  const statuses: Candidate["status"][] = ["assessment-scheduled", "passed", "failed", "pending"]

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  const name = `${firstName} ${lastName}`

  const baseScore = Math.floor(Math.random() * 40) + 50
  const bonusScore = Math.random() > 0.7 ? Math.floor(Math.random() * 10) : 0
  const matchScore = Math.min(baseScore + bonusScore, 100)

  const candidateSkills = skills.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 6) + 4)

  const goodPointsPool = [
    "Strong technical skills in required technologies",
    "Excellent problem-solving abilities",
    "Leadership experience demonstrated",
    "Strong communication skills",
    "Relevant project experience",
    "Continuous learning mindset",
    "Team collaboration experience",
    "Client-facing experience",
    "Agile methodology experience",
    "Open source contributions",
  ]

  const badPointsPool = [
    "Limited experience with specific framework",
    "No certification in required area",
    "Missing domain-specific knowledge",
    "Limited leadership experience",
    "No remote work experience mentioned",
    "Lacks scalability experience",
    "Missing DevOps experience",
    "Limited API design experience",
  ]

  return {
    id: `candidate-${index}`,
    name,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
    phone: `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    matchScore,
    goodPoints: goodPointsPool.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 3),
    badPoints: badPointsPool.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1),
    fileName: file.name,
    experience: experiences[Math.floor(Math.random() * experiences.length)],
    skills: candidateSkills,
    education: educations[Math.floor(Math.random() * educations.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    summary: `Experienced ${firstName} with strong background in software development and passion for innovation.`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
  }
}
