"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  FileText,
  Search,
  Download,
  Filter,
  SortAsc,
  SortDesc,
  Loader2,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Star,
  Award,
  TrendingUp,
  Brain,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import Navigation from "./components/navigation"
import { generatePDF } from "./utils/pdfGenerator"
import { useAuth } from "./hooks/useAuth"

interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  matchScore: number
  goodPoints: string[]
  badPoints: string[]
  fileName: string
  experience: string
  skills: string[]
  education: string
  location: string
  summary: string
  status: "assessment-scheduled" | "passed" | "failed" | "pending"
}

const ITEMS_PER_PAGE = 4

export default function Dashboard() {
  const { user } = useAuth()
  const [files, setFiles] = useState<File[]>([])
  const [jobDescription, setJobDescription] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [showResults, setShowResults] = useState(false)
  const [sortBy, setSortBy] = useState<"name" | "score">("score")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [filterScore, setFilterScore] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set())
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    const validFiles = selectedFiles.filter(
      (file) =>
        file.type === "application/pdf" ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.toLowerCase().endsWith(".pdf") ||
        file.name.toLowerCase().endsWith(".docx"),
    )

    if (validFiles.length !== selectedFiles.length) {
      toast({
        title: "Invalid file type",
        description: "Please upload only PDF or DOCX files.",
        variant: "destructive",
      })
    }

    if (validFiles.length > 20) {
      toast({
        title: "Too many files",
        description: "Please upload maximum 20 files at once.",
        variant: "destructive",
      })
      return
    }

    setFiles((prev) => [...prev, ...validFiles].slice(0, 20))

    if (validFiles.length > 0) {
      toast({
        title: "Files uploaded successfully",
        description: `${validFiles.length} file(s) added for analysis.`,
      })
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    toast({
      title: "File removed",
      description: "File has been removed from the analysis queue.",
    })
  }

  const clearAllFiles = () => {
    setFiles([])
    toast({
      title: "All files cleared",
      description: "All files have been removed from the analysis queue.",
    })
  }

  const startAnalysis = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to start analysis.",
        variant: "destructive",
      })
      return
    }

    if (files.length === 0) {
      toast({
        title: "No files uploaded",
        description: "Please upload at least one resume to analyze.",
        variant: "destructive",
      })
      return
    }

    if (!jobDescription.trim()) {
      toast({
        title: "Job description required",
        description: "Please provide a job description for analysis.",
        variant: "destructive",
      })
      return
    }

    if (jobDescription.trim().length < 50) {
      toast({
        title: "Job description too short",
        description: "Please provide a more detailed job description (minimum 50 characters).",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    setAnalysisProgress(0)

    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return 95
        }
        return prev + Math.random() * 15
      })
    }, 200)

    try {
      // Create analysis via API
      const response = await fetch("/api/analysis/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: `Analysis - ${new Date().toLocaleDateString()}`,
          jobDescription,
          files: files.map((file) => ({ name: file.name, size: file.size })),
        }),
      })

      const data = await response.json()

      if (data.success) {
        clearInterval(progressInterval)
        setAnalysisProgress(100)

        setCandidates(data.analysis.candidates)
        setCurrentAnalysisId(data.analysisId)
        setShowResults(true)
        setIsAnalyzing(false)
        setAnalysisProgress(0)
        setCurrentPage(1)

        toast({
          title: "Analysis complete!",
          description: `Successfully analyzed ${files.length} resumes. Found ${data.analysis.candidates.filter((c: Candidate) => c.matchScore >= 70).length} strong matches.`,
        })
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      clearInterval(progressInterval)
      setIsAnalyzing(false)
      setAnalysisProgress(0)

      toast({
        title: "Analysis failed",
        description: "There was an error analyzing the resumes. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-orange-600"
    return "text-red-600"
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800 border-green-200"
    if (score >= 60) return "bg-orange-100 text-orange-800 border-orange-200"
    return "bg-red-100 text-red-800 border-red-200"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "passed":
        return "bg-green-100 text-green-800 border-green-200"
      case "failed":
        return "bg-red-100 text-red-800 border-red-200"
      case "assessment-scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "passed":
        return "Passed"
      case "failed":
        return "Failed"
      case "assessment-scheduled":
        return "Assessment Scheduled"
      default:
        return "Pending"
    }
  }

  const filteredAndSortedCandidates = candidates
    .filter((candidate) => {
      const matchesSearch =
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
        candidate.location.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesFilter =
        filterScore === "all" ||
        (filterScore === "high" && candidate.matchScore >= 80) ||
        (filterScore === "medium" && candidate.matchScore >= 60 && candidate.matchScore < 80) ||
        (filterScore === "low" && candidate.matchScore < 60)

      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      } else {
        return sortOrder === "asc" ? a.matchScore - b.matchScore : b.matchScore - a.matchScore
      }
    })

  const totalPages = Math.ceil(filteredAndSortedCandidates.length / ITEMS_PER_PAGE)
  const paginatedCandidates = filteredAndSortedCandidates.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  const toggleCandidateSelection = (candidateId: string) => {
    const newSelection = new Set(selectedCandidates)
    if (newSelection.has(candidateId)) {
      newSelection.delete(candidateId)
    } else {
      newSelection.add(candidateId)
    }
    setSelectedCandidates(newSelection)
  }

  const exportResults = async () => {
    const selectedCount = selectedCandidates.size
    const exportData =
      selectedCount > 0 ? candidates.filter((c) => selectedCandidates.has(c.id)) : filteredAndSortedCandidates

    toast({
      title: "Generating PDF...",
      description: `Creating report for ${exportData.length} candidate(s)...`,
    })

    try {
      await generatePDF(exportData, jobDescription)
      toast({
        title: "Export complete!",
        description: `PDF report with ${exportData.length} candidates has been downloaded.`,
      })
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  const resetAnalysis = () => {
    setShowResults(false)
    setCandidates([])
    setFiles([])
    setJobDescription("")
    setSelectedCandidates(new Set())
    setCurrentPage(1)
    setSearchTerm("")
    setFilterScore("all")
    setCurrentAnalysisId(null)
    toast({
      title: "Analysis reset",
      description: "Ready for new analysis.",
    })
  }

  const viewCandidateDetails = (candidate: Candidate) => {
    toast({
      title: `Viewing ${candidate.name}`,
      description: "Opening detailed candidate profile...",
    })
  }

  const downloadResume = (candidate: Candidate) => {
    // Simulate resume download
    const link = document.createElement("a")
    link.href = "#"
    link.download = candidate.fileName
    link.click()

    toast({
      title: "Download started",
      description: `Downloading ${candidate.fileName}...`,
    })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {!showResults ? (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="bg-blue-500 p-4 rounded-2xl shadow-lg">
                  <Brain className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold text-gray-900 mb-2">AI Resume Shortlisting</h1>
                  <p className="text-blue-600 text-lg font-medium">Smart Hiring Made Simple</p>
                </div>
              </div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Upload resumes and job description to find the best candidates using advanced AI analysis
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Upload & Job Description */}
              <div className="lg:col-span-2 space-y-6">
                {/* Upload Section */}
                <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <Upload className="h-6 w-6" />
                      Upload Resumes
                    </CardTitle>
                    <CardDescription className="text-blue-100">
                      Upload multiple PDF or DOCX files. Maximum 20 files at once.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors bg-blue-50">
                        <Input
                          type="file"
                          multiple
                          accept=".pdf,.docx"
                          onChange={handleFileUpload}
                          className="cursor-pointer border-0 bg-transparent"
                        />
                        <p className="mt-3 text-sm text-gray-600">Drag and drop files here or click to browse</p>
                      </div>

                      {files.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-800 text-lg">Uploaded Files ({files.length}/20)</h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={clearAllFiles}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Clear All
                            </Button>
                          </div>
                          <div className="grid gap-3 max-h-60 overflow-y-auto pr-2">
                            {files.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <span className="text-sm font-medium text-gray-800 truncate block">
                                      {file.name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Job Description */}
                <Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                    <CardTitle className="text-xl">Job Description</CardTitle>
                    <CardDescription className="text-green-100">
                      Paste the complete job description to match candidates against requirements.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Textarea
                      placeholder="Paste your detailed job description here...

Example:
We are looking for a Senior Frontend Developer with 5+ years of experience in React, TypeScript, and modern web technologies..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="min-h-[250px] resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <div className="mt-2 text-sm text-gray-500">
                      {jobDescription.length} characters (minimum 50 required)
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Stats & Action */}
              <div className="space-y-6">
                {/* Quick Stats */}
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-t-lg">
                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Files Ready</span>
                      <span className="text-gray-900 font-bold">{files.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Description Length</span>
                      <span className="text-gray-900 font-bold">{jobDescription.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Status</span>
                      <Badge
                        className={
                          files.length > 0 && jobDescription.length >= 50
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-orange-100 text-orange-800 border-orange-200"
                        }
                      >
                        {files.length > 0 && jobDescription.length >= 50 ? "Ready" : "Incomplete"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Analysis Progress */}
                {isAnalyzing && (
                  <Card className="shadow-lg border-0 border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                          <span className="text-lg font-medium text-gray-900">Analyzing {files.length} resumes...</span>
                        </div>
                        <Progress value={analysisProgress} className="h-3" />
                        <p className="text-sm text-gray-600">
                          Processing resumes with AI algorithms. This may take a few moments.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Start Analysis Button */}
                <div className="text-center">
                  <Button
                    onClick={startAnalysis}
                    disabled={isAnalyzing || !user}
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-6 text-xl rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                        Analyzing Resumes...
                      </>
                    ) : !user ? (
                      <>
                        <Brain className="mr-3 h-6 w-6" />
                        Sign In to Start Analysis
                      </>
                    ) : (
                      <>
                        <Brain className="mr-3 h-6 w-6" />
                        Start AI Analysis
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Results Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-gray-900">Analysis Results</h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <span>Found {candidates.length} candidates</span>
                  <span>•</span>
                  <span>{candidates.filter((c) => c.matchScore >= 80).length} strong matches</span>
                  <span>•</span>
                  <span>{selectedCandidates.size} selected</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={exportResults} className="bg-green-600 hover:bg-green-700 text-white">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF ({selectedCandidates.size || filteredAndSortedCandidates.length})
                </Button>
                <Button onClick={resetAnalysis} variant="outline" className="border-gray-300 hover:bg-gray-50">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  New Analysis
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="shadow-lg border-0">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Star className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {candidates.filter((c) => c.matchScore >= 80).length}
                      </p>
                      <p className="text-sm text-gray-600">High Match (80+)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-lg border-0">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-600">
                        {candidates.filter((c) => c.matchScore >= 60 && c.matchScore < 80).length}
                      </p>
                      <p className="text-sm text-gray-600">Medium Match (60-79)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-lg border-0">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <XCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">
                        {candidates.filter((c) => c.matchScore < 60).length}
                      </p>
                      <p className="text-sm text-gray-600">Low Match (&lt;60)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-lg border-0">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Award className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {Math.round(candidates.reduce((sum, c) => sum + c.matchScore, 0) / candidates.length)}%
                      </p>
                      <p className="text-sm text-gray-600">Average Score</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <Card className="shadow-lg border-0">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search by name, skills, or location..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value)
                          setCurrentPage(1)
                        }}
                        className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <Select
                    value={filterScore}
                    onValueChange={(value) => {
                      setFilterScore(value)
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="w-full lg:w-[200px] border-gray-300">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by score" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Scores</SelectItem>
                      <SelectItem value="high">High Match (80+)</SelectItem>
                      <SelectItem value="medium">Medium Match (60-79)</SelectItem>
                      <SelectItem value="low">Low Match (&lt;60)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={`${sortBy}-${sortOrder}`}
                    onValueChange={(value) => {
                      const [field, order] = value.split("-")
                      setSortBy(field as "name" | "score")
                      setSortOrder(order as "asc" | "desc")
                    }}
                  >
                    <SelectTrigger className="w-full lg:w-[200px] border-gray-300">
                      {sortOrder === "asc" ? (
                        <SortAsc className="h-4 w-4 mr-2" />
                      ) : (
                        <SortDesc className="h-4 w-4 mr-2" />
                      )}
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="score-desc">Score (High to Low)</SelectItem>
                      <SelectItem value="score-asc">Score (Low to High)</SelectItem>
                      <SelectItem value="name-asc">Name (A to Z)</SelectItem>
                      <SelectItem value="name-desc">Name (Z to A)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Results Grid */}
            <div className="space-y-4">
              {paginatedCandidates.map((candidate) => (
                <Card
                  key={candidate.id}
                  className={`shadow-lg border-0 hover:shadow-xl transition-all duration-300 hover:scale-[1.01] border-l-4 ${
                    candidate.matchScore >= 80
                      ? "border-l-green-500"
                      : candidate.matchScore >= 60
                        ? "border-l-orange-500"
                        : "border-l-red-500"
                  } ${selectedCandidates.has(candidate.id) ? "ring-2 ring-blue-500 bg-blue-50" : "bg-white"}`}
                >
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 xl:grid-cols-6 gap-6">
                      {/* Candidate Info */}
                      <div className="xl:col-span-2 space-y-4">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedCandidates.has(candidate.id)}
                            onChange={() => toggleCandidateSelection(candidate.id)}
                            className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <h3 className="font-bold text-xl text-gray-900">{candidate.name}</h3>
                            <p className="text-sm text-gray-600">{candidate.email}</p>
                            <p className="text-sm text-gray-600">{candidate.location}</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Badge
                              className={`font-bold text-lg px-3 py-1 border ${getScoreBadgeColor(candidate.matchScore)}`}
                            >
                              {candidate.matchScore}% Match
                            </Badge>
                            <Badge className={`border ${getStatusColor(candidate.status)}`}>
                              {getStatusText(candidate.status)}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>
                              <strong className="text-gray-900">Experience:</strong> {candidate.experience}
                            </p>
                            <p>
                              <strong className="text-gray-900">Education:</strong> {candidate.education}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="xl:col-span-1">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Award className="h-4 w-4 text-blue-600" />
                          Skills
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills.slice(0, 6).map((skill, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs bg-gray-100 text-gray-700 border-gray-200"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {candidate.skills.length > 6 && (
                            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 border-gray-200">
                              +{candidate.skills.length - 6}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Good Points */}
                      <div className="xl:col-span-1">
                        <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Strengths
                        </h4>
                        <ul className="space-y-2">
                          {candidate.goodPoints.slice(0, 3).map((point, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-green-500 mt-0.5 flex-shrink-0">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Bad Points */}
                      <div className="xl:col-span-1">
                        <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                          <XCircle className="h-4 w-4" />
                          Areas to Improve
                        </h4>
                        <ul className="space-y-2">
                          {candidate.badPoints.slice(0, 2).map((point, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-red-500 mt-0.5 flex-shrink-0">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Actions */}
                      <div className="xl:col-span-1 flex flex-col gap-3">
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => viewCandidateDetails(candidate)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-300 hover:bg-gray-50"
                          onClick={() => downloadResume(candidate)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* No Results */}
            {filteredAndSortedCandidates.length === 0 && (
              <Card className="shadow-lg border-0">
                <CardContent className="pt-6 text-center py-16">
                  <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No candidates found</h3>
                  <p className="text-gray-500 mb-4">No candidates match your current search and filter criteria.</p>
                  <Button
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-50"
                    onClick={() => {
                      setSearchTerm("")
                      setFilterScore("all")
                      setCurrentPage(1)
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Card className="shadow-lg border-0">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                      {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedCandidates.length)} of{" "}
                      {filteredAndSortedCandidates.length} candidates
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="border-gray-300 hover:bg-gray-50"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum
                          if (totalPages <= 5) {
                            pageNum = i + 1
                          } else if (currentPage <= 3) {
                            pageNum = i + 1
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i
                          } else {
                            pageNum = currentPage - 2 + i
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className={
                                currentPage === pageNum
                                  ? "bg-blue-600 hover:bg-blue-700 text-white w-10"
                                  : "border-gray-300 hover:bg-gray-50 w-10"
                              }
                            >
                              {pageNum}
                            </Button>
                          )
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="border-gray-300 hover:bg-gray-50"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>

      <Toaster />
    </div>
  )
}
