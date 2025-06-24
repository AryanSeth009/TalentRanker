import { ObjectId } from "mongodb"

export interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  matchScore: number
  goodPoints: string[]
  badPoints: string[]
  fileName: string
  experience: string
  skills: string[]
  education: string
  location: string
  summary: string
  status: "assessment-scheduled" | "passed" | "failed" | "pending"
  resumeContent?: string
}

export interface Analysis {
  _id?: ObjectId
  userId: string
  title: string
  jobDescription: string
  candidates: Candidate[]
  status: "completed" | "processing" | "failed"
  createdAt: Date
  updatedAt: Date
  statistics: {
    totalCandidates: number
    highMatches: number
    mediumMatches: number
    lowMatches: number
    averageScore: number
    topScore: number
  }
}

export interface FileUpload {
  _id?: ObjectId
  userId: string
  fileName: string
  originalName: string
  fileSize: number
  mimeType: string
  uploadedAt: Date
  analysisId?: string
}
