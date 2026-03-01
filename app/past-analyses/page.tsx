"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  Calendar,
  FileText,
  Users,
  Download,
  Eye,
  Search,
  Filter,
  Trash2,
  Star,
  Clock,
  MoreHorizontal,
  Brain,
  BarChart3,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import Navigation from "../components/navigation"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface Analysis {
  id: string | number
  _id?: string
  title: string
  createdAt?: string | Date
  date?: string
  candidatesCount?: number
  candidates?: Array<{
    name: string
    matchScore: number
    status?: string
    skills?: string[]
  }>
  statistics?: {
    topScore: number
    averageScore: number
  }
  topScore?: number
  averageScore?: number
  status: "completed" | "processing" | "failed"
  highMatches?: number
  mediumMatches?: number
  lowMatches?: number
  jobDescription?: string
  assessmentScheduled?: number
  passed?: number
  failed?: number
}

export default function PastAnalyses() {
  const [analyses, setAnalyses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date-desc")

  useEffect(() => {
    const fetchAnalyses = async () => {
      setIsLoading(true)
      try {
        const res = await fetch("/api/analysis/list", { credentials: "include" })
        const data = await res.json()
        if (data.success) {
          setAnalyses(data.analyses)
        }
      } catch (e) {
        // Optionally handle error
      } finally {
        setIsLoading(false)
      }
    }
    fetchAnalyses()
  }, [])

  const filteredAnalyses = analyses
    .filter((analysis) => {
      const matchesSearch = analysis.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || analysis.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "date-asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "candidates-desc":
          return b.candidates.length - a.candidates.length
        case "candidates-asc":
          return a.candidates.length - b.candidates.length
        case "score-desc":
          return b.statistics.topScore - a.statistics.topScore
        case "score-asc":
          return a.statistics.topScore - b.statistics.topScore
        default:
          return 0
      }
    })

  const viewAnalysis = (analysis: Analysis) => {
    toast({
      title: `Opening ${analysis.title}`,
      description: "Loading detailed analysis results...",
    })
  }

  const exportAnalysis = (analysis: Analysis) => {
    toast({
      title: "Export started",
      description: `Generating PDF report for ${analysis.title}...`,
    })

    try {
      const doc = new jsPDF()

      // Header
      doc.setFontSize(22)
      doc.setTextColor(30, 30, 30)
      doc.text("TalentRanker.ai Analysis Report", 14, 20)

      doc.setFontSize(12)
      doc.setTextColor(100, 100, 100)
      doc.text(`Title: ${analysis.title}`, 14, 30)
      doc.text(
        `Date: ${new Date(analysis.createdAt || Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
        14,
        36,
      )

      // Summary Statistics
      const candidateCount = analysis.candidates ? analysis.candidates.length : 0
      const stats = analysis.statistics || { topScore: 0, averageScore: 0 }
      
      const summaryData = [
        ["Total Candidates", candidateCount.toString()],
        ["Top Score", `${stats.topScore}%`],
        ["Average Score", `${stats.averageScore}%`],
      ]

      autoTable(doc, {
        startY: 45,
        head: [["Metric", "Value"]],
        body: summaryData,
        theme: "grid",
        headStyles: { fillColor: [108, 99, 255] }, // primary color
        styles: { fontSize: 11 },
        margin: { left: 14, right: 14 }
      })

      // Candidates Table
      if (analysis.candidates && analysis.candidates.length > 0) {
        doc.setFontSize(16)
        doc.setTextColor(30, 30, 30)
        doc.text("Candidate Rankings", 14, (doc as any).lastAutoTable.finalY + 15)

        const candidatesData = analysis.candidates
          .sort((a, b) => b.matchScore - a.matchScore)
          .map((c) => [
            c.name,
            `${c.matchScore}%`,
            c.status || "Pending",
            c.skills ? c.skills.join(", ") : "-",
          ])

        autoTable(doc, {
          startY: (doc as any).lastAutoTable.finalY + 20,
          head: [["Candidate Name", "Match Score", "Status", "Top Skills"]],
          body: candidatesData,
          theme: "striped",
          headStyles: { fillColor: [40, 40, 60] },
          styles: { fontSize: 10, cellPadding: 3 },
          columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 25 },
            2: { cellWidth: 30 },
            3: { cellWidth: "auto" },
          },
          margin: { left: 14, right: 14 }
        })
      }

      // Format filename
      const filename = `TalentRanker_${analysis.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.pdf`
      doc.save(filename)

      toast({
        title: "Export complete",
        description: "PDF report downloaded successfully.",
      })
    } catch (error) {
      console.error("PDF generation failed:", error)
      toast({
        title: "Export failed",
        description: "An error occurred while generating the PDF.",
        variant: "destructive",
      })
    }
  }

  const deleteAnalysis = (analysis: Analysis) => {
    toast({
      title: "Analysis deleted",
      description: `${analysis.title} has been removed from your history.`,
      variant: "destructive",
    })
  }

  const duplicateAnalysis = (analysis: Analysis) => {
    toast({
      title: "Analysis duplicated",
      description: `Created a copy of ${analysis.title} for reuse.`,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/20 text-emerald-500 border-emerald-500/30"
      case "processing":
        return "bg-orange-500/20 text-orange-500 border-orange-500/30"
      case "failed":
        return "bg-destructive/20 text-destructive border-destructive/30"
      default:
        return "bg-muted/50 text-foreground text-foreground/90 border-border"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Star className="h-3 w-3" />
      case "processing":
        return <Clock className="h-3 w-3" />
      case "failed":
        return <Trash2 className="h-3 w-3" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen pt-20 relative overflow-hidden bg-[#0a0a0f]">
      {/* SVG Noise Texture */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

      {/* Ambient Glow Blobs */}
      <div className="ambient-glow bg-primary top-[-10%] left-[-10%] animate-drift" />
      <div className="ambient-glow bg-secondary bottom-[-10%] right-[-10%] animate-drift-reverse" />

      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="bg-primary/50 p-4 rounded-2xl shadow-lg">
                <BarChart3 className="h-10 w-10 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-5xl font-bold font-syne mb-2 gradient-text">Hiring Monitor</h1>
                <p className="text-primary text-lg font-medium">Track Your Recruitment Progress</p>
              </div>
            </div>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="glass-card shadow-lg border-0 bg-transparent relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30 mb-2">Active (06)</Badge>
                    <p className="text-foreground font-semibold">Active Positions</p>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card shadow-lg border-0 bg-transparent relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className="bg-muted/50 text-foreground text-foreground/90 border-border mb-2">Inactive (29)</Badge>
                    <p className="text-foreground font-semibold">Inactive Positions</p>
                  </div>
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card shadow-lg border-0 bg-transparent relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className="bg-primary/20 text-primary border-primary/30 mb-2">Draft (03)</Badge>
                    <p className="text-foreground font-semibold">Draft Positions</p>
                  </div>
                  <div className="w-3 h-3 bg-primary/50 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="glass-card shadow-lg border-0 bg-transparent relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/60 h-4 w-4" />
                    <Input
                      placeholder="Search analyses by title..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-border focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full lg:w-[180px] border-border">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full lg:w-[200px] border-border">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Newest First</SelectItem>
                    <SelectItem value="date-asc">Oldest First</SelectItem>
                    <SelectItem value="candidates-desc">Most Candidates</SelectItem>
                    <SelectItem value="candidates-asc">Least Candidates</SelectItem>
                    <SelectItem value="score-desc">Highest Score</SelectItem>
                    <SelectItem value="score-asc">Lowest Score</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Analyses List */}
          <div className="grid gap-6">
            {filteredAnalyses.map((analysis) => {
              // Use real backend fields
              const candidateCount = analysis.candidates ? analysis.candidates.length : 0;
              const stats = analysis.statistics || {};
              // Compute assessmentScheduled, passed, failed from candidates if not present
              let assessmentScheduled = 0, passed = 0, failed = 0;
              if (analysis.candidates) {
                for (const c of analysis.candidates) {
                  if (c.status === "assessment-scheduled") assessmentScheduled++;
                  else if (c.status === "passed") passed++;
                  else if (c.status === "failed") failed++;
                }
              }
              return (
                <Card key={analysis._id || analysis.id} className="glass-card shadow-lg border-0 bg-transparent relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                  <CardHeader>
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl text-foreground">{analysis.title}</CardTitle>
                          <Badge className={`${getStatusColor(analysis.status)} flex items-center gap-1 border`}>
                            {getStatusIcon(analysis.status)}
                            {analysis.status}
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-4 text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Created: {analysis.createdAt ? new Date(analysis.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Total Applied: {candidateCount}
                          </div>
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="hover:bg-muted/50 text-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => viewAnalysis(analysis)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Results
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => exportAnalysis(analysis)}>
                            <Download className="mr-2 h-4 w-4" />
                            Export PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => duplicateAnalysis(analysis)}>
                            <FileText className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteAnalysis(analysis)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Progress Bars */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Assessment Scheduled: {assessmentScheduled} ({candidateCount ? Math.round((assessmentScheduled / candidateCount) * 100) : 0}%)
                          </span>
                        </div>
                        <Progress value={candidateCount ? (assessmentScheduled / candidateCount) * 100 : 0} className="h-2" />

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Failed: {failed} ({candidateCount ? Math.round((failed / candidateCount) * 100) : 0}%)
                          </span>
                        </div>
                        <Progress value={candidateCount ? (failed / candidateCount) * 100 : 0} className="h-2" />

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Passed: {passed} ({candidateCount ? Math.round((passed / candidateCount) * 100) : 0}%)
                          </span>
                        </div>
                        <Progress value={candidateCount ? (passed / candidateCount) * 100 : 0} className="h-2" />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3 pt-2">
                        <Button
                          onClick={() => viewAnalysis(analysis)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Results
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => exportAnalysis(analysis)}
                          className="border-border hover:bg-muted/50 text-foreground"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export PDF
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => duplicateAnalysis(analysis)}
                          className="border-border hover:bg-muted/50 text-foreground"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Use Template
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredAnalyses.length === 0 && (
            <Card className="glass-card shadow-lg border-0 bg-transparent relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <CardContent className="pt-6 text-center py-16">
                <FileText className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground/80 mb-2">
                  {searchTerm || statusFilter !== "all" ? "No matching analyses found" : "No analyses yet"}
                </h3>
                <p className="text-muted-foreground/80 mb-6">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Start your first resume analysis to see results here."}
                </p>
                {searchTerm || statusFilter !== "all" ? (
                  <Button
                    variant="outline"
                    className="border-border hover:bg-muted/50 text-foreground"
                    onClick={() => {
                      setSearchTerm("")
                      setStatusFilter("all")
                    }}
                  >
                    Clear Filters
                  </Button>
                ) : (
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Start New Analysis</Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Hire with AI Button */}
          <div className="text-center pt-8">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-primary-foreground px-12 py-6 text-xl rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <Brain className="mr-3 h-6 w-6" />
              Hire with AI
            </Button>
          </div>
        </div>
      </main>

      <Toaster />
    </div>
  )
}
