import { createClient } from "@supabase/supabase-js"
import type { Analysis } from "./models"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

export async function saveAnalysis(analysis: Omit<Analysis, "_id">): Promise<string> {
  try {
    const { data, error } = await supabase
      .from("batch_analyses")
      .insert({
        user_id: analysis.userId,
        data: analysis,
      })
      .select("id")
      .single()

    if (error) throw error
    return data.id
  } catch (error) {
    console.error("Error saving analysis:", error)
    throw new Error("Failed to save analysis")
  }
}

export async function getAnalysesByUser(userId: string): Promise<Analysis[]> {
  try {
    const { data, error } = await supabase
      .from("batch_analyses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return data.map((row: any) => ({
      ...row.data,
      _id: row.id,
      createdAt: row.created_at,
    }))
  } catch (error) {
    console.error("Error getting analyses:", error)
    throw new Error("Failed to get analyses")
  }
}

export async function getAnalysisById(analysisId: string, userId: string): Promise<Analysis | null> {
  try {
    const { data, error } = await supabase
      .from("batch_analyses")
      .select("*")
      .eq("id", analysisId)
      .eq("user_id", userId)
      .single()

    if (error || !data) return null

    return {
      ...data.data,
      _id: data.id,
      createdAt: data.created_at,
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
    const analysis = await getAnalysisById(analysisId, userId)
    if (!analysis) return false

    analysis.status = status
    analysis.updatedAt = new Date()

    const { error } = await supabase
      .from("batch_analyses")
      .update({ data: analysis })
      .eq("id", analysisId)
      .eq("user_id", userId)

    return !error
  } catch (error) {
    console.error("Error updating analysis status:", error)
    return false
  }
}

export async function deleteAnalysis(analysisId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("batch_analyses")
      .delete()
      .eq("id", analysisId)
      .eq("user_id", userId)

    return !error
  } catch (error) {
    console.error("Error deleting analysis:", error)
    return false
  }
}

