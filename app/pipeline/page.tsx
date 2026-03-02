"use client"

import { useState, useMemo, useEffect } from "react"
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent
} from "@dnd-kit/core"
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CandidateCard } from "@/app/components/CandidateCard"
import Navigation from "@/app/components/navigation"
import { Badge } from "@/components/ui/badge"
import { usePipelineStore } from "@/lib/store/pipeline"

const COLUMNS = [
  { id: "Screened", title: "Screened" },
  { id: "Interview Scheduled", title: "Interview Scheduled" },
  { id: "Final Round", title: "Final Round" },
  { id: "Offer Extended", title: "Offer Extended" },
  { id: "Rejected", title: "Rejected" },
]

export default function PipelinePage() {
  const { candidates, fetchCandidates, updateCandidateStage } = usePipelineStore()
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    fetchCandidates()
  }, [fetchCandidates])

  const columnsWithCandidates = useMemo(() => {
    return COLUMNS.map(col => ({
      ...col,
      candidates: candidates.filter(c => c.stage === col.id)
    }))
  }, [candidates])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const activeCandidate = candidates.find(c => c.id === activeId)
    const overCandidate = candidates.find(c => c.id === overId)

    if (!activeCandidate) return

    // If over a candidate
    if (overCandidate) {
      if (activeCandidate.stage !== overCandidate.stage) {
        updateCandidateStage(activeId as string, overCandidate.stage)
      }
    } else {
      // If over an empty column
      const overColumnId = COLUMNS.find(c => c.id === overId)?.id
      if (overColumnId && activeCandidate.stage !== overColumnId) {
        updateCandidateStage(activeId as string, overColumnId)
      }
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    
    
    // Sort logic requires tracking sequence if implemented later
    // For now the UI optimistically bumps the stage during OnDragOver

    setActiveId(null)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-foreground font-sans relative overflow-hidden flex flex-col">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#6c63ff] opacity-[0.03] blur-[120px] rounded-full mix-blend-screen blob-drift" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary opacity-[0.03] blur-[120px] rounded-full mix-blend-screen blob-drift blob-drift-delayed" />
        <div className="absolute inset-0 bg-noise opacity-[0.015]" />
      </div>

      <Navigation />

      <main className="flex-1 container max-w-[1600px] mx-auto pt-28 pb-12 px-4 relative z-10 flex flex-col h-screen">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-syne text-foreground tracking-tight">
            Candidate <span className="gradient-text">Pipeline</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Track and manage your talent pool across hiring stages.
          </p>
        </div>

        <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-6 h-full min-w-max">
              {columnsWithCandidates.map(col => (
               <div key={col.id} className="w-[320px] flex flex-col h-full bg-[#12121a]/50 rounded-xl border border-white/5 shadow-2xl overflow-hidden backdrop-blur-sm">
                 <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#1a1a26]/50">
                   <h3 className="font-syne font-semibold text-white/90">{col.title}</h3>
                   <Badge variant="secondary" className="bg-[#0a0a0f] text-muted-foreground border-white/5">
                     {col.candidates.length}
                   </Badge>
                 </div>
                 
                 <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
                   <SortableContext id={col.id} items={col.candidates.map(c => c.id)} strategy={verticalListSortingStrategy}>
                     <div className="min-h-full">
                       {col.candidates.map(candidate => (
                         <CandidateCard key={candidate.id} candidate={candidate} />
                       ))}
                       {col.candidates.length === 0 && (
                         <div className="h-24 border-2 border-dashed border-white/5 rounded-lg flex items-center justify-center text-sm text-muted-foreground/50">
                           Drop candidates here
                         </div>
                       )}
                     </div>
                   </SortableContext>
                 </div>
               </div>
              ))}
            </div>

            <DragOverlay>
              {activeId ? (
                <div className="opacity-80 rotate-3 scale-105 shadow-2xl shadow-primary/20">
                  <CandidateCard candidate={candidates.find(c => c.id === activeId)!} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </main>
    </div>
  )
}
