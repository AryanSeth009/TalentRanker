import { create } from 'zustand'
import type { KanbanCandidate } from '@/app/components/CandidateCard'
import { createClient } from '@/utils/supabase/client'

interface PipelineState {
  candidates: KanbanCandidate[]
  isLoading: boolean
  error: string | null
  setCandidates: (candidates: KanbanCandidate[]) => void
  updateCandidateStage: (candidateId: string, newStage: string) => Promise<void>
  fetchCandidates: (jobId?: string) => Promise<void>
}

export const usePipelineStore = create<PipelineState>((set, get) => ({
  candidates: [],
  isLoading: false,
  error: null,
  
  setCandidates: (candidates) => set({ candidates }),

  updateCandidateStage: async (candidateId, newStage) => {
    // 1. Optimistic Update
    const previousCandidates = get().candidates
    
    set({
      candidates: previousCandidates.map(c => 
        c.id === candidateId ? { ...c, stage: newStage } : c
      )
    })

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('candidates')
        .update({ stage: newStage })
        .eq('id', candidateId)

      if (error) throw error
      
    } catch (error) {
      // 3. Rollback on failure
      console.error("Failed to update candidate stage", error)
      set({ candidates: previousCandidates, error: "Failed to save stage change." })
    }
  },

  fetchCandidates: async (jobId) => {
    set({ isLoading: true, error: null })
    try {
      const supabase = createClient()
      
      let query = supabase
        .from('candidates')
        .select('id, name, current_role, match_score, skills, stage')
        .order('match_score', { ascending: false })

      if (jobId) {
        query = query.eq('job_id', jobId)
      }

      const { data, error } = await query

      if (error) throw error

      const mappedData: KanbanCandidate[] = (data || []).map(row => ({
        id: row.id,
        name: row.name,
        role: row.current_role || 'Candidate',
        matchScore: row.match_score || 0,
        topSkills: (row.skills || []).slice(0, 3),
        stage: row.stage || 'Screened'
      }))
      
      set({ candidates: mappedData, isLoading: false })
    } catch (error) {
      set({ error: "Failed to fetch candidates", isLoading: false })
    }
  }
}))
