"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ScoreRing } from "./ScoreRing"
import { SkillGapBar } from "./SkillGapBar"
import { RadarChart } from "./RadarChart"
import { AlertCircle, AlertTriangle, Lightbulb, MessageSquare, Briefcase, GraduationCap, X, CheckCircle2, ThumbsUp, ThumbsDown, UserPlus } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { TeamComments } from "./TeamComments"

// Types matching the AI structured output
export interface DeepAnalysis {
  overall_score: number
  summary: string
  skill_gaps: { skill: string; importance: "critical" | "moderate" | "nice-to-have"; present: boolean }[]
  red_flags: { type: string; description: string; severity: "high" | "medium" | "low" }[]
  culture_fit: {
    score: number
    reasoning: string
    matching_values: string[]
    mismatched_values: string[]
    dimensions: { subject: string; A: number; fullMark: number }[] // For the radar chart
  }
  interview_questions: { question: string; target_area: string; why: string }[]
  strengths: string[]
  concerns: string[]
}

interface CandidateDetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidateName: string
  currentRole: string
  analysis: DeepAnalysis | null
}

export function CandidateDetailDrawer({
  open,
  onOpenChange,
  candidateName,
  currentRole,
  analysis
}: CandidateDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const biasAuditEnabled = useAppStore(state => state.biasAuditEnabled)

  useEffect(() => {
    if (open && biasAuditEnabled && analysis) {
      // Log the bias audit event
      fetch("/api/audit/log", {
        method: "POST",
        body: JSON.stringify({
          candidateId: "temp-id", // In real use, this would be the UUID from Supabase
          originalScore: analysis.overall_score,
          anonymizedScore: analysis.overall_score // For now same, in real use AI would recalculate
        }),
        headers: {
          "Content-Type": "application/json"
        }
      }).catch(err => console.error("Failed to log audit event:", err))
    }
  }, [open, biasAuditEnabled, analysis])

  if (!analysis) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[100vw] sm:w-[540px] border-l border-white/10 bg-[#0a0a0f]/95 backdrop-blur-xl p-0 flex flex-col">
        {/* Header Section */}
        <div className="p-6 border-b border-white/5 bg-gradient-to-b from-[#12121a] to-transparent">
          <div className="flex justify-between items-start">
            <div>
              <SheetTitle className="text-2xl font-bold font-syne bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
                {biasAuditEnabled ? `Candidate ${Math.abs(candidateName.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)).toString(16).toUpperCase().substring(0, 6)}` : candidateName}
              </SheetTitle>
              <SheetDescription className="text-muted-foreground mt-1 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                {biasAuditEnabled ? "Role Redacted" : currentRole}
              </SheetDescription>
            </div>
            <ScoreRing score={analysis.overall_score} size={72} strokeWidth={5} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2 items-center">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(108,99,255,0.3)] px-4">
              Schedule Interview
            </Button>
            <div className="flex bg-white/5 rounded-md p-0.5 border border-white/10">
              <Button variant="ghost" size="sm" className="h-8 px-2.5 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10">
                <ThumbsUp className="w-4 h-4 mr-1.5" /> 12
              </Button>
              <div className="w-px h-4 bg-white/10 self-center" />
              <Button variant="ghost" size="sm" className="h-8 px-2.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10">
                <ThumbsDown className="w-4 h-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5 h-8 gap-2">
              <UserPlus className="w-3.5 h-3.5" /> Assign
            </Button>
            <Button size="sm" variant="ghost" className="h-8 text-destructive hover:bg-destructive/10 px-3">
              Reject
            </Button>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden" value={activeTab} onValueChange={setActiveTab}>
          <div className="px-6 border-b border-white/5">
            <TabsList className="bg-transparent h-12 w-full justify-start gap-6 rounded-none p-0">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-0 font-medium"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="skills" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-0 font-medium"
              >
                Skill Gaps
              </TabsTrigger>
              <TabsTrigger 
                value="culture" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-0 font-medium"
              >
                Culture Fit
              </TabsTrigger>
              <TabsTrigger 
                value="interview" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-0 font-medium"
              >
                Interview Prep
              </TabsTrigger>
              <TabsTrigger 
                value="transparency" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-0 font-medium"
              >
                Transparency
              </TabsTrigger>
              <TabsTrigger 
                value="discussion" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-0 font-medium"
              >
                Discussion
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 p-6">
            <TabsContent value="overview" className="mt-0 space-y-8 outline-none border-none">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">AI Summary</h3>
                <p className="text-foreground/90 leading-relaxed text-sm p-4 bg-white/5 rounded-lg border border-white/5">
                  {analysis.summary}
                </p>
              </div>

              {analysis.red_flags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Flags to Explore
                  </h3>
                  <div className="space-y-3">
                    {analysis.red_flags.map((flag, idx) => (
                      <div key={idx} className="flex gap-3 p-3 rounded-md bg-[#1a1a26]/50 border border-white/5">
                        <div className="shrink-0 mt-0.5">
                          {flag.severity === "high" ? (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground capitalize">{flag.type.replace('_', ' ')}</p>
                          <p className="text-xs text-muted-foreground mt-1">{flag.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                  <h4 className="text-sm font-medium text-emerald-500 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Strengths
                  </h4>
                  <ul className="space-y-2">
                    {analysis.strengths.map((s, i) => (
                      <li key={i} className="text-xs text-foreground/80 flex gap-2">
                        <span className="text-emerald-500">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/10">
                  <h4 className="text-sm font-medium text-red-500 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Concerns
                  </h4>
                  <ul className="space-y-2">
                    {analysis.concerns.map((c, i) => (
                      <li key={i} className="text-xs text-foreground/80 flex gap-2">
                        <span className="text-red-500">•</span> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="skills" className="mt-0 outline-none border-none">
              <div className="p-5 bg-white/5 rounded-lg border border-white/5 mb-6">
                <SkillGapBar gaps={analysis.skill_gaps} />
              </div>
            </TabsContent>

            <TabsContent value="culture" className="mt-0 space-y-6 outline-none border-none">
              <div className="p-5 bg-white/5 rounded-lg border border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Culture Index</h3>
                  <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                    {analysis.culture_fit.score}/100 Match
                  </Badge>
                </div>
                {analysis.culture_fit.dimensions && analysis.culture_fit.dimensions.length > 0 ? (
                  <RadarChart data={analysis.culture_fit.dimensions} />
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm border border-dashed border-white/10 rounded-lg">
                    Insufficient data for radar chart
                  </div>
                )}
                <p className="text-sm text-foreground/80 mt-4 leading-relaxed">
                  {analysis.culture_fit.reasoning}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Aligned Values</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.culture_fit.matching_values.map((v, i) => (
                      <Badge key={i} variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{v}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Mismatched Values</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.culture_fit.mismatched_values.map((v, i) => (
                      <Badge key={i} variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">{v}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="interview" className="mt-0 space-y-4 outline-none border-none">
              <div className="mb-6 p-4 bg-primary/10 rounded-lg border border-primary/20 flex gap-3">
                <Lightbulb className="w-5 h-5 text-primary shrink-0" />
                <p className="text-sm text-primary/90">
                  AI-generated questions based specifically on this candidate's skill gaps and red flags.
                </p>
              </div>

              {analysis.interview_questions.map((q, idx) => (
                <div key={idx} className="p-4 bg-white/5 rounded-lg border border-white/5 group relative">
                  <Badge className="absolute -top-2.5 -left-2.5 w-6 h-6 flex items-center justify-center p-0 rounded-full bg-primary text-white">
                    {idx + 1}
                  </Badge>
                  <div className="pl-3">
                    <p className="text-sm font-medium text-foreground leading-relaxed">"{q.question}"</p>
                    <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground bg-black/20 p-2 rounded">
                      <MessageSquare className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-semibold text-foreground/70 mr-1">Why ask this:</span>
                        {q.why}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="transparency" className="mt-0 space-y-6 outline-none border-none">
              <div className="p-5 bg-white/5 rounded-lg border border-white/5">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-primary" />
                  Scoring Transparency
                </h3>
                <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                  Understand how the AI arrived at the {analysis.overall_score} score. Adjust weights to see how specific skills impact the ranking.
                </p>

                <div className="space-y-6">
                  {analysis.skill_gaps.map((gap, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-foreground/90">{gap.skill}</span>
                        <span className="text-primary font-mono">{gap.importance === 'critical' ? '1.5x Weight' : gap.importance === 'moderate' ? '1.0x Weight' : '0.5x Weight'}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative">
                        <div 
                          className={`h-full absolute left-0 top-0 transition-all duration-500 ${
                            gap.importance === 'critical' ? 'bg-primary w-[90%]' : 
                            gap.importance === 'moderate' ? 'bg-blue-400 w-[60%]' : 
                            'bg-muted-foreground/30 w-[30%]'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Card className="bg-amber-500/5 border border-amber-500/10 p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-500">Bias Audit Log</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      This candidate was evaluated using an anonymized profile to ensure fair assessment of skills regardless of demographic indicators.
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="discussion" className="mt-0 outline-none border-none h-full">
              <TeamComments candidateId="temp-id" />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}


