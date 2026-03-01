"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Briefcase, TrendingUp, Filter, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react"
import Navigation from "@/app/components/navigation"

// Dynamically import Recharts to avoid SSR hydration issues
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "@/app/components/Charts"

// Mock Data
const volumeData = [
  { month: "Jan", applicants: 120, hires: 4 },
  { month: "Feb", applicants: 150, hires: 6 },
  { month: "Mar", applicants: 280, hires: 12 },
  { month: "Apr", applicants: 210, hires: 8 },
  { month: "May", applicants: 390, hires: 15 },
  { month: "Jun", applicants: 450, hires: 22 },
]

const scoreDistribution = [
  { range: "0-40", count: 45 },
  { range: "41-60", count: 120 },
  { range: "61-80", count: 250 },
  { range: "81-100", count: 85 },
]

const stageData = [
  { name: "Screened", value: 450 },
  { name: "Interview", value: 120 },
  { name: "Final Round", value: 45 },
  { name: "Offered", value: 15 },
]
const COLORS = ["#6c63ff", "#43e97b", "#ff6b6b", "#f9cb28"]

export default function AnalyticsDashboard() {
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
            { title: "Total Candidates", value: "2,845", change: "+12.5%", isUp: true, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
            { title: "Active Jobs", value: "34", change: "+2", isUp: true, icon: Briefcase, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { title: "Avg Match Score", value: "72.4", change: "+4.1", isUp: true, icon: Activity, color: "text-primary", bg: "bg-primary/10" },
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
                {[
                  { name: "Sarah Jenkins", role: "Senior Frontend Lead", score: 95, time: "14 days", date: "Last week" },
                  { name: "David Chen", role: "Backend Developer", score: 88, time: "22 days", date: "2 weeks ago" },
                  { name: "Maya Patel", role: "Product Manager", score: 92, time: "18 days", date: "3 weeks ago" },
                  { name: "James Wilson", role: "UI/UX Designer", score: 85, time: "25 days", date: "1 month ago" },
                ].map((placement, idx) => (
                  <div key={idx} className="flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold font-syne group-hover:bg-primary group-hover:text-white transition-colors">
                        {placement.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{placement.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{placement.role} • <span className="text-emerald-400">{placement.score}% Match</span></p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{placement.time}</p>
                      <p className="text-xs text-muted-foreground">{placement.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
