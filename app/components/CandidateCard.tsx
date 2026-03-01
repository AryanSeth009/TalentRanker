"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { GripVertical, Briefcase } from "lucide-react"

export interface KanbanCandidate {
  id: string
  name: string
  matchScore: number
  role: string
  topSkills: string[]
  stage: string
}

interface CandidateCardProps {
  candidate: KanbanCandidate
  onClick?: () => void
}

export function CandidateCard({ candidate, onClick }: CandidateCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: candidate.id, data: { ...candidate } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  }

  const initials = candidate.name
    .split(" ")
    .map(n => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()

  let scoreColor = "text-emerald-500 border-emerald-500/30 bg-emerald-500/10"
  if (candidate.matchScore < 50) scoreColor = "text-red-500 border-red-500/30 bg-red-500/10"
  else if (candidate.matchScore < 75) scoreColor = "text-amber-500 border-amber-500/30 bg-amber-500/10"

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={`relative mb-3 bg-[#12121a] border-white/10 hover:border-primary/50 transition-colors cursor-pointer overflow-hidden ${isDragging ? 'ring-2 ring-primary shadow-2xl' : ''}`}
      onClick={onClick}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute left-0 top-0 bottom-0 w-6 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing hover:bg-white/5 border-r border-white/5 text-muted-foreground/50 hover:text-white transition-colors"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      <CardContent className="p-4 pl-9">
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-white/10 shrink-0 bg-gradient-to-br from-[#1a1a26] to-[#0a0a0f]">
              <AvatarFallback className="text-xs font-syne font-bold text-white/80 bg-transparent">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-syne font-bold text-foreground leading-tight">{candidate.name}</h4>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                <span className="truncate max-w-[120px]">{candidate.role}</span>
              </p>
            </div>
          </div>
          <div className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-full border text-xs font-bold leading-none ${scoreColor}`}>
            {candidate.matchScore}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {candidate.topSkills.map((skill, idx) => (
            <Badge key={idx} variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-white/5 border-white/10 text-muted-foreground">
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
