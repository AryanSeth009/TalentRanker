import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2 } from "lucide-react"

interface SkillGap {
  skill: string
  importance: "critical" | "moderate" | "nice-to-have"
  present: boolean
}

export function SkillGapBar({ gaps }: { gaps: SkillGap[] }) {
  const total = gaps.length
  const present = gaps.filter(g => g.present).length
  const criticalMissing = gaps.filter(g => !g.present && g.importance === "critical").length

  const percentage = total > 0 ? (present / total) * 100 : 0

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Skill Match ({present}/{total})</span>
        <span className="font-medium">{percentage.toFixed(0)}%</span>
      </div>
      
      <Progress value={percentage} className="h-2 bg-white/5" indicatorClassName={percentage < 50 ? "bg-red-500" : percentage < 80 ? "bg-amber-500" : "bg-emerald-500"} />

      {criticalMissing > 0 && (
        <div className="flex items-start gap-2 text-red-400 bg-red-400/10 p-3 rounded-md text-sm mt-4">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p>Missing {criticalMissing} critical {criticalMissing === 1 ? 'skill' : 'skills'}</p>
        </div>
      )}

      <div className="space-y-2 mt-4">
        {gaps.map((gap, i) => (
          <div key={i} className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5">
            <div className="flex items-center gap-2">
              {gap.present ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-muted-foreground/30 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                </div>
              )}
              <span className={gap.present ? "text-foreground" : "text-muted-foreground"}>{gap.skill}</span>
            </div>
            {gap.importance === "critical" && (
              <Badge variant="outline" className="text-xs border-red-500/30 text-red-400">Critical</Badge>
            )}
            {gap.importance === "moderate" && (
              <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400">Moderate</Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
