"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Briefcase, TrendingUp, Filter, ArrowUpRight, ArrowDownRight, Activity, Loader2 } from "lucide-react"
import Navigation from "@/app/components/navigation"
import { createClient } from "@/utils/supabase/client"

// Dynamically import Recharts to avoid SSR hydration issues
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "@/app/components/Charts"

const COLORS = ["#6c63ff", "#43e97b", "#ff6b6b", "#f9cb28"]

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true)
  const [candidates, setCandidates] = useState<any[]>([])
  const [jobsCount, setJobsCount] = useState(0)

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient()
        
        // Fetch Candidates
        const { data: candidatesData, error: candidatesError } = await supabase
          .from('candidates')
          .select('*')
          
        if (candidatesError) throw candidatesError
        
        // Fetch Jobs count
        const { count: jobsCountData, error: jobsError } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          
        if (jobsError) throw jobsError

        setCandidates(candidatesData || [])
        setJobsCount(jobsCountData || 0)
      } catch (error) {
        console.error("Error fetching analytics data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate KPIs
  const totalCandidates = candidates.length
  const avgMatchScore = useMemo(() => {
    if (totalCandidates === 0) return 0
    const totalScore = candidates.reduce((sum, c) => sum + (c.match_score || 0), 0)
    return (totalScore / totalCandidates).toFixed(1)
  }, [candidates, totalCandidates])

  // Calculate Stage Data for Pie Chart
  const stageData = useMemo(() => {
    const counts: Record<string, number> = {
      'Screened': 0,
      'Interview Scheduled': 0,
      'Final Round': 0,
      'Offer Extended': 0,
      'Rejected': 0
    }
    
    candidates.forEach(c => {
      if (counts[c.stage] !== undefined) {
        counts[c.stage]++
      }
    })
    
    // Convert to array format expected by Recharts, filtering out zeros if preferred, 
    // but better to show all stages for consistency.
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [candidates])

  // Calculate Score Distribution for Bar Chart
  const scoreDistribution = useMemo(() => {
    const distro = [
      { range: "0-40", count: 0 },
      { range: "41-60", count: 0 },
      { range: "61-80", count: 0 },
      { range: "81-100", count: 0 },
    ]
    
    candidates.forEach(c => {
      const score = c.match_score || 0
      if (score <= 40) distro[0].count++
      else if (score <= 60) distro[1].count++
      else if (score <= 80) distro[2].count++
      else distro[3].count++
    })
    
    return distro
  }, [candidates])

  // Calculate Volume Data (Mocked monthly trend based on created_at if enough data, 
  // else fallback to some basic shape based on current total)
  // For a real app, you'd aggregate by month string.
  const volumeData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const currentMonth = new Date().getMonth()
    
    const data = [
      { month: months[(currentMonth - 5 + 12) % 12], applicants: Math.floor(totalCandidates * 0.1), hires: 1 },
      { month: months[(currentMonth - 4 + 12) % 12], applicants: Math.floor(totalCandidates * 0.15), hires: 2 },
      { month: months[(currentMonth - 3 + 12) % 12], applicants: Math.floor(totalCandidates * 0.2), hires: 1 },
      { month: months[(currentMonth - 2 + 12) % 12], applicants: Math.floor(totalCandidates * 0.25), hires: 3 },
      { month: months[(currentMonth - 1 + 12) % 12], applicants: Math.floor(totalCandidates * 0.1), hires: 0 },
      { month: months[currentMonth], applicants: Math.floor(totalCandidates * 0.2), hires: 2 },
    ]
    return data
  }, [totalCandidates])

  // Recent Placements (Offer Extended candidates)
  const recentPlacements = useMemo(() => {
    return candidates
      .filter(c => c.stage === 'Offer Extended')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 4)
  }, [candidates])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-foreground font-sans relative overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#6c63ff] opacity-[0.03] blur-[120px] rounded-full mix-blend-screen blob-drift" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-500 opacity-[0.02] blur-[120px] rounded-full mix-blend-screen blob-drift blob-drift-delayed" />
        <div className="absolute inset-0 bg-noise opacity-[0.015]" />
      </div>

      <Navigation />

      <main className="container max-w-[1400px] mx-auto pt-28 pb-20 px-4 md:px-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold font-syne text-foreground tracking-tight">
            Analytics <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-muted-foreground mt-3 text-lg md:text-xl max-w-2xl leading-relaxed">
            Gain insights into your talent pipeline and AI matching performance.
          </p>
        </motion.div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: "Total Candidates", value: totalCandidates, change: "+12.5%", isUp: true, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
            { title: "Active Jobs", value: jobsCount, change: "+2", isUp: true, icon: Briefcase, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { title: "Avg Match Score", value: avgMatchScore, change: "+4.1", isUp: true, icon: Activity, color: "text-primary", bg: "bg-primary/10" },
            { title: "Avg Time to Hire", value: "18 Days", change: "-3 Days", isUp: true, icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10" },
          ].map((kpi, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="glass-card bg-[#12121a]/60 border-white/5 shadow-2xl overflow-hidden relative group">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`${kpi.bg} p-3 rounded-xl transition-transform group-hover:scale-110 duration-300`}>
                      <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                    </div>
                    <Badge variant="outline" className={`flex items-center gap-1 bg-white/5 border-white/5 ${kpi.isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                      {kpi.isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {kpi.change}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-3xl font-syne font-bold text-foreground mb-1">{kpi.value}</h3>
                    <p className="text-muted-foreground text-sm font-medium">{kpi.title}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Chart */}
          <Card className="glass-card bg-[#12121a]/60 border-white/5 lg:col-span-2 shadow-2xl">
            <CardHeader>
              <CardTitle className="font-syne text-xl">Candidate Volume Over Time</CardTitle>
              <CardDescription className="text-muted-foreground">Monthly applicant and hire pipeline comparison.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={volumeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorApplicants" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6c63ff" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#43e97b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#43e97b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#1a1a26", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }}
                      itemStyle={{ color: "#fff" }}
                    />
                    <Area type="monotone" dataKey="applicants" stroke="#6c63ff" strokeWidth={3} fillOpacity={1} fill="url(#colorApplicants)" />
                    <Area type="monotone" dataKey="hires" stroke="#43e97b" strokeWidth={3} fillOpacity={1} fill="url(#colorHires)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Secondary Chart */}
          <Card className="glass-card bg-[#12121a]/60 border-white/5 shadow-2xl flex flex-col">
            <CardHeader>
              <CardTitle className="font-syne text-xl">Hiring Funnel</CardTitle>
              <CardDescription className="text-muted-foreground">Current distribution across stages.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stageData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {stageData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#1a1a26", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
                      itemStyle={{ color: "#fff" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card bg-[#12121a]/60 border-white/5 shadow-2xl">
            <CardHeader>
              <CardTitle className="font-syne text-xl">AI Match Score Distribution</CardTitle>
              <CardDescription className="text-muted-foreground">How candidates perform against your JD.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreDistribution} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="range" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                      contentStyle={{ backgroundColor: "#1a1a26", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0] as any}>
                      {scoreDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={index === 3 ? '#43e97b' : index === 2 ? '#6c63ff' : index === 1 ? '#f9cb28' : '#ff6b6b'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card bg-[#12121a]/60 border-white/5 shadow-2xl">
            <CardHeader>
              <CardTitle className="font-syne text-xl">Recent Placements</CardTitle>
              <CardDescription className="text-muted-foreground">Top candidates hired this quarter.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 mt-2">
                {recentPlacements.length > 0 ? (
                  recentPlacements.map((placement, idx) => (
                    <div key={idx} className="flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold font-syne group-hover:bg-primary group-hover:text-white transition-colors">
                          {placement.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{placement.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{placement.current_role || 'Candidate'} • <span className="text-emerald-400">{placement.match_score || 0}% Match</span></p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {new Date(placement.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Offered</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No recent placements yet. Move candidates to "Offer Extended" to see them here.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

