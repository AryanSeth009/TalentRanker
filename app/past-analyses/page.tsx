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

interface Analysis {
  id: number
  title: string
  date: string
  candidatesCount: number
  topScore: number
  averageScore: number
  status: "completed" | "processing" | "failed"
  highMatches: number
  mediumMatches: number
  lowMatches: number
  jobDescription: string
  assessmentScheduled: number
  passed: number
  failed: number
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
        return "bg-green-100 text-green-800 border-green-200"
      case "processing":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "failed":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
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
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="bg-blue-500 p-4 rounded-2xl shadow-lg">
                <BarChart3 className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-gray-900 mb-2">Hiring Monitor</h1>
                <p className="text-blue-600 text-lg font-medium">Track Your Recruitment Progress</p>
              </div>
            </div>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="shadow-lg border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className="bg-green-100 text-green-800 border-green-200 mb-2">Active (06)</Badge>
                    <p className="text-gray-900 font-semibold">Active Positions</p>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-lg border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className="bg-gray-100 text-gray-800 border-gray-200 mb-2">Inactive (29)</Badge>
                    <p className="text-gray-900 font-semibold">Inactive Positions</p>
                  </div>
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-lg border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 mb-2">Draft (03)</Badge>
                    <p className="text-gray-900 font-semibold">Draft Positions</p>
                  </div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="shadow-lg border-0">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search analyses by title..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full lg:w-[180px] border-gray-300">
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
                  <SelectTrigger className="w-full lg:w-[200px] border-gray-300">
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
                <Card key={analysis._id || analysis.id} className="shadow-lg border-0 hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl text-gray-900">{analysis.title}</CardTitle>
                          <Badge className={`${getStatusColor(analysis.status)} flex items-center gap-1 border`}>
                            {getStatusIcon(analysis.status)}
                            {analysis.status}
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-4 text-gray-600">
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
                          <Button variant="ghost" size="sm" className="hover:bg-gray-100">
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
                          <span className="text-sm text-gray-600">
                            Assessment Scheduled: {assessmentScheduled} ({candidateCount ? Math.round((assessmentScheduled / candidateCount) * 100) : 0}%)
                          </span>
                        </div>
                        <Progress value={candidateCount ? (assessmentScheduled / candidateCount) * 100 : 0} className="h-2" />

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Failed: {failed} ({candidateCount ? Math.round((failed / candidateCount) * 100) : 0}%)
                          </span>
                        </div>
                        <Progress value={candidateCount ? (failed / candidateCount) * 100 : 0} className="h-2" />

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Passed: {passed} ({candidateCount ? Math.round((passed / candidateCount) * 100) : 0}%)
                          </span>
                        </div>
                        <Progress value={candidateCount ? (passed / candidateCount) * 100 : 0} className="h-2" />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3 pt-2">
                        <Button
                          onClick={() => viewAnalysis(analysis)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Results
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => exportAnalysis(analysis)}
                          className="border-gray-300 hover:bg-gray-50"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export PDF
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => duplicateAnalysis(analysis)}
                          className="border-gray-300 hover:bg-gray-50"
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
            <Card className="shadow-lg border-0">
              <CardContent className="pt-6 text-center py-16">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {searchTerm || statusFilter !== "all" ? "No matching analyses found" : "No analyses yet"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Start your first resume analysis to see results here."}
                </p>
                {searchTerm || statusFilter !== "all" ? (
                  <Button
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-50"
                    onClick={() => {
                      setSearchTerm("")
                      setStatusFilter("all")
                    }}
                  >
                    Clear Filters
                  </Button>
                ) : (
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">Start New Analysis</Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Hire with AI Button */}
          <div className="text-center pt-8">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-12 py-6 text-xl rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
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
