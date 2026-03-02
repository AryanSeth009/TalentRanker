"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Upload, 
  FileText, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  RefreshCw, 
  Brain, 
  Zap, 
  Download, 
  Eye, 
  Star, 
  Award, 
  TrendingUp, 
  Sparkles, 
  ChevronRight, 
  Target, 
  Shield, 
  BarChart3, 
  Users, 
  Layout,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./components/theme-toggle"
import { CandidateDetailDrawer, type DeepAnalysis } from "./components/CandidateDetailDrawer"
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import Navigation from "./components/navigation";
import { Candidate } from "@/lib/models";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { useAuth } from "@/app/hooks/useAuth";
import { generatePDF } from "@/app/utils/pdfGenerator";

interface AnalysisResult {
  candidateName: string;
  score: number;
  goodPoints: string[];
  badPoints: string[];
  fileName: string;
  skills: string[];
  deepAnalysis?: DeepAnalysis;
}

const ITEMS_PER_PAGE = 5;

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const biasAuditEnabled = useAppStore(state => state.biasAuditEnabled);
  const setAuthDialogOpen = useAppStore(state => state.setAuthDialogOpen);
  const { user } = useAuth();
  const [showResults, setShowResults] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "score">("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<{
    name: string;
    role: string;
    analysis: DeepAnalysis | null;
  } | null>(null)

  const { toast } = useToast();
  const [filterScore, setFilterScore] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      setAuthDialogOpen(true);
      toast({
        title: "Authentication Required",
        description: "Please sign in to upload files.",
        variant: "destructive",
      });
      return;
    }
    const selectedFiles = Array.from(event.target.files || []);
    const validFiles = selectedFiles.filter(
      (file) =>
        file.type === "application/pdf" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.name.toLowerCase().endsWith(".pdf") ||
        file.name.toLowerCase().endsWith(".docx")
    );

    if (validFiles.length !== selectedFiles.length) {
      toast({
        title: "Invalid file type",
        description: "Please upload only PDF or DOCX files.",
        variant: "destructive",
      });
    }

    if (validFiles.length > 20) {
      toast({
        title: "Too many files",
        description: "Please upload maximum 20 files at once.",
        variant: "destructive",
      });
      return;
    }

    setFiles((prev) => [...prev, ...validFiles].slice(0, 20));

    if (validFiles.length > 0) {
      toast({
        title: "Files uploaded successfully",
        description: `${validFiles.length} file(s) added for analysis.`,
      });
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    toast({
      title: "File removed",
      description: "File has been removed from the analysis queue.",
    });
  };

  const clearAllFiles = () => {
    setFiles([]);
    toast({
      title: "All files cleared",
      description: "All files have been removed from the analysis queue.",
    });
  };

  const startAnalysis = async () => {
    if (!user) {
      setAuthDialogOpen(true);
      toast({
        title: "Authentication Required",
        description: "Please sign in to run analysis.",
        variant: "destructive",
      });
      return;
    }

    if (files.length === 0) {
      toast({
        title: "No files uploaded",
        description: "Please upload at least one resume to analyze.",
        variant: "destructive",
      });
      return;
    }

    if (!jobDescription.trim()) {
      toast({
        title: "Job description required",
        description: "Please provide a job description for analysis.",
        variant: "destructive",
      });
      return;
    }

    if (jobDescription.trim().length < 50) {
      toast({
        title: "Job description too short",
        description:
          "Please provide a more detailed job description (minimum 50 characters).",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // Simulate realistic progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 15;
      });
    }, 800);

    try {
      // Create FormData for the API call
      const formData = new FormData();
      formData.append("jobDescription", jobDescription);

      files.forEach((file) => {
        formData.append("resumes", file);
      });

      // Call the analyze API
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      const analysisResults = await response.json();

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      // Small delay to show completion
      setTimeout(() => {
        setResults(analysisResults);
        setShowResults(true);
        setIsAnalyzing(false);
        setAnalysisProgress(0);

        toast({
          title: "Analysis Complete!",
          description: `Successfully analyzed ${files.length} resumes. Found ${
            analysisResults.filter((r: AnalysisResult) => r.score >= 70).length
          } strong matches.`,
        });
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      setIsAnalyzing(false);
      setAnalysisProgress(0);

      toast({
        title: "Analysis failed",
        description:
          error instanceof Error
            ? error.message
            : "There was an error analyzing the resumes.",
        variant: "destructive",
      });
    }
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500/20 text-emerald-500 border-emerald-500/30";
    if (score >= 60) return "bg-orange-500/20 text-orange-500 border-orange-500/30";
    return "bg-destructive/20 text-destructive border-destructive/30";
  };

  const sampleJobDescription = `We are looking for a Senior Frontend Developer with 5+ years of experience in React, TypeScript, and modern web technologies.

Key Requirements:
• 5+ years of professional frontend development experience
• Expert knowledge of React, JavaScript, and TypeScript
• Experience with Node.js and REST APIs
• Proficiency in HTML5, CSS3, and responsive design
• Experience with modern build tools (Webpack, Babel)
• Knowledge of version control systems (Git)
• Experience with Agile development methodologies
• Bachelor's degree in Computer Science or related field

Preferred Qualifications:
• Experience with AWS or other cloud platforms
• Knowledge of Docker and CI/CD pipelines
• Experience with testing frameworks (Jest, Cypress)
• Familiarity with design systems and component libraries
• Leadership or mentoring experience

We offer competitive salary, excellent benefits, and the opportunity to work on cutting-edge projects with a talented team.`;

  const resetAnalysis = () => {
    setShowResults(false);
    setResults([]);
    setFiles([]);
    setJobDescription("");
    setCurrentPage(1);
    setSearchTerm("");
    setFilterScore("all");
    setCurrentAnalysisId(null);
    toast({
      title: "Analysis reset",
      description: "Ready for new analysis.",
    });
  };

  const viewCandidateDetails = (candidate: Candidate) => {
    toast({
      title: `Viewing ${candidate.name}`,
      description: "Opening detailed candidate profile...",
    });
  };

  const downloadResume = (candidate: Candidate) => {
    // Simulate resume download
    const link = document.createElement("a");
    link.href = "#";
    link.download = candidate.fileName;
    link.click();

    toast({
      title: "Download started",
      description: `Downloading ${candidate.fileName}...`,
    });
  };

  const filteredAndSortedResults = results
    .filter((result) => {
      const matchesSearch =
        result.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesFilter =
        filterScore === "all" ||
        (filterScore === "high" && result.score >= 80) ||
        (filterScore === "medium" && result.score >= 60 && result.score < 80) ||
        (filterScore === "low" && result.score < 60);

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return sortOrder === "asc" ? a.candidateName.localeCompare(b.candidateName) : b.candidateName.localeCompare(a.candidateName);
      } else {
        return sortOrder === "asc" ? a.score - b.score : b.score - a.score;
      }
    });

  const totalPages = Math.ceil(filteredAndSortedResults.length / ITEMS_PER_PAGE);
  const paginatedResults = filteredAndSortedResults.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const toggleCandidateSelection = (candidateId: string) => {
    const newSelection = new Set(selectedCandidates);
    if (newSelection.has(candidateId)) {
      newSelection.delete(candidateId);
    } else {
      newSelection.add(candidateId);
    }
    setSelectedCandidates(newSelection);
  };

  const exportResults = async () => {
    const selectedCount = selectedCandidates.size;
    const exportData =
      selectedCount > 0 ? results.filter((c) => selectedCandidates.has(c.candidateName)) : filteredAndSortedResults;

    toast({
      title: "Generating PDF...",
      description: `Creating report for ${exportData.length} candidate(s)...`,
    });

    try {
      const mappedData = exportData.map(r => ({
        id: r.candidateName,
        name: r.candidateName,
        email: "N/A",
        phone: "N/A",
        matchScore: r.score,
        goodPoints: r.goodPoints,
        badPoints: r.badPoints,
        fileName: r.fileName,
        experience: "See Resume",
        skills: r.skills,
        education: "See Resume",
        location: "N/A",
        summary: "",
        status: "pending" as const
      }));
      await generatePDF(mappedData, jobDescription);
      toast({
        title: "Export complete!",
        description: `PDF report with ${exportData.length} candidates has been downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pt-10 relative overflow-hidden bg-[#0a0a0f]">
      {/* SVG Noise Texture */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

      {/* Ambient Glow Blobs */}
      <div className="ambient-glow bg-primary top-[-10%] left-[-10%] animate-drift" />
      <div className="ambient-glow bg-secondary bottom-[-10%] right-[-10%] animate-drift-reverse" />
      
      <Navigation />

      <main className="mx-auto max-w-[1200px] px-10 py-10 relative z-10">
        <AnimatePresence mode="wait">
        {!showResults ? (
          <motion.div 
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut", staggerChildren: 0.1 }}
            className="flex flex-col gap-10"
          >
            {/* Page Header */}
            <motion.div className="text-center space-y-6 pt-8 pb-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
             
              <h1 className="text-5xl md:text-7xl font-bold font-syne tracking-tight">
                Hire Smarter with <br/>
                <span className="gradient-text">AI Precision</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Instantly rank top candidates by matching their resumes against your exact job requirements using state-of-the-art AI.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 pt-6 justify-center"
            >
              <Button 
                size="lg" 
                className="bg-primary hover:bg-[#8e86ff] text-white px-10 h-14 rounded-2xl text-lg font-syne font-bold shadow-[0_0_30px_rgba(108,99,255,0.3)] transition-all hover:scale-105"
                asChild
              >
                <Link href="/pipeline" onClick={(e) => {
                  if (!user) {
                    e.preventDefault();
                    setAuthDialogOpen(true);
                  }
                }}>
                  Open Pipeline <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white/5 border-white/10 hover:bg-white/10 px-10 h-14 rounded-2xl text-lg font-syne font-bold transition-all hover:scale-105"
                asChild
              >
                <Link href="/batch" onClick={(e) => {
                  if (!user) {
                    e.preventDefault();
                    setAuthDialogOpen(true);
                  }
                }}>
                  Batch Process
                </Link>
              </Button>
            </motion.div>

            {/* CSS Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
              
              {/* Left Column */}
              <div className="space-y-8">
                {/* Upload Section */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <Card className="glass-card shadow-lg border-0 bg-transparent relative overflow-visible group">
                    <CardHeader className="border-b border-border/10 pb-4">
                      <CardTitle className="flex items-center gap-3 font-syne text-2xl">
                        <Upload className="h-6 w-6 text-primary" />
                        Upload Resumes
                      </CardTitle>
                      <CardDescription className="text-muted-foreground text-base">
                        Upload PDF or DOCX resume files (max 20 files).
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <div className="relative border-2 border-dashed border-border/30 rounded-xl p-10 text-center hover:border-primary/50 transition-all duration-300 bg-[#12121a]/50 group-hover:bg-[#1a1a26]/30 group-hover:shadow-[0_0_30px_rgba(108,99,255,0.1)]">
                          <Input
                            type="file"
                            multiple
                            accept=".pdf,.docx"
                            onChange={handleFileUpload}
                            onClick={(e) => {
                              if (!user) {
                                e.preventDefault();
                                setAuthDialogOpen(true);
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div className="flex flex-col items-center gap-4 transition-transform duration-300 group-hover:-translate-y-2">
                            <div className="p-4 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                              <Upload className="h-8 w-8" />
                            </div>
                            <div>
                              <p className="text-lg font-medium text-foreground">
                                Drag and drop resume files here
                              </p>
                              <p className="mt-2 text-sm text-muted-foreground">
                                or click to browse files
                              </p>
                              <div className="flex items-center justify-center gap-2 mt-4">
                                <Badge variant="outline" className="bg-[#1a1a26] border-border text-xs">PDF</Badge>
                                <Badge variant="outline" className="bg-[#1a1a26] border-border text-xs">DOCX</Badge>
                              </div>
                            </div>
                            <p className="text-xs text-primary/80 mt-2">
                              Demo mode: Generates realistic mock analysis for any uploaded file.
                            </p>
                          </div>
                        </div>

                        {files.length > 0 && (
                          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-foreground/90 font-syne">
                                {files.length} File{files.length !== 1 && 's'} Ready
                              </h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearAllFiles}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Clear All
                              </Button>
                            </div>
                            <div className="grid gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                              {files.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 bg-[#1a1a26]/50 rounded-lg border border-border/50 hover:bg-[#1a1a26] transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-primary" />
                                    <div>
                                      <span className="text-sm font-medium text-foreground/90 block w-[200px] truncate">
                                        {file.name}
                                      </span>
                                      <div className="text-xs text-muted-foreground/80">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                      </div>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile(index)}
                                    className="text-muted-foreground hover:text-destructive"
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
                </motion.div>

                {/* Job Description Section */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Card className="glass-card shadow-lg border-0 bg-transparent group">
                    <CardHeader className="border-b border-border/10 pb-4 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="font-syne text-2xl">Job Requirements</CardTitle>
                        <CardDescription className="text-muted-foreground text-base mt-1">
                          Paste your detailed job description
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setJobDescription(sampleJobDescription)}
                        className="border-border/50 hover:bg-primary/20 hover:text-primary transition-all font-syne text-xs h-8"
                      >
                        Use Sample JD
                      </Button>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="relative group/textarea">
                          <Textarea
                            placeholder="e.g. Seeking a Senior Software Engineer with 5+ years of remote React experience..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            className="min-h-[220px] resize-none bg-[#0a0a0f]/50 border-border/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-base transition-all p-4"
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className={jobDescription.length < 50 ? "text-destructive" : "text-emerald-500"}>
                            {jobDescription.length} characters (min 50)
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6 lg:sticky lg:top-24">
                
                {/* Status Card */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  <Card className="glass-card shadow-lg border-0 bg-transparent overflow-hidden object-contain">
                    <div className="h-1 bg-gradient-to-r from-primary to-secondary w-full" />
                    <CardContent className="p-6 space-y-5">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium text-sm">Target Status</span>
                        <Badge
                          variant="outline"
                          className={`uppercase tracking-wider text-[10px] font-bold px-2 py-0.5 border ${
                            files.length > 0 && jobDescription.length >= 50
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                              : "bg-destructive/10 text-destructive border-destructive/30"
                          }`}
                        >
                          {files.length > 0 && jobDescription.length >= 50
                            ? "Ready"
                            : "Incomplete"}
                        </Badge>
                      </div>
                      <div className="space-y-3">
                         <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-2"><FileText className="h-4 w-4"/> Files</span>
                            <span className="text-foreground font-bold">{files.length} / 20</span>
                         </div>
                         <div className="h-px w-full bg-border/30" />
                         <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-2"><Brain className="h-4 w-4"/> Context</span>
                            <span className="text-foreground font-bold">{jobDescription.length > 0 ? 'Added' : 'Missing'}</span>
                         </div>
                      </div>

                      {/* Main CTA */}
                      <Button
                        onClick={startAnalysis}
                        disabled={
                          isAnalyzing ||
                          files.length === 0 ||
                          jobDescription.length < 50
                        }
                        className="w-full relative group overflow-hidden bg-gradient-to-r from-primary to-[#8e86ff] text-white hover:shadow-[0_0_20px_rgba(108,99,255,0.4)] transition-all duration-300 h-14 rounded-xl font-syne text-lg tracking-wide disabled:opacity-50 disabled:hover:shadow-none"
                      >
                         <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                        {isAnalyzing ? (
                          <div className="flex items-center justify-center relative z-10">
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Analyzing...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2 relative z-10 transition-transform duration-300 group-hover:-translate-y-0.5">
                            <Zap className="h-5 w-5" fill="currentColor" />
                            Run Analysis
                          </div>
                        )}
                      </Button>

                      {/* Analysis Progress */}
                      {isAnalyzing && (
                        <div className="space-y-3 animate-in fade-in pt-2">
                          <Progress value={analysisProgress} className="h-2 bg-[#1a1a26]" />
                          <p className="text-xs text-muted-foreground text-center animate-pulse">
                            Processing with Claude AI...
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* How it Works Module */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                  <Card className="bg-[#12121a]/40 border border-white/5 shadow-lg backdrop-blur-md">
                    <CardHeader className="py-4 border-b border-border/10">
                      <CardTitle className="text-base font-syne text-foreground/90">How it works</CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4">
                      {[
                        { step: 1, text: "Upload candidate resumes" },
                        { step: 2, text: "Provide the job description" },
                        { step: 3, text: "AI analyzes and ranks matches" }
                      ].map((s) => (
                        <div key={s.step} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold font-syne border border-primary/30 mt-0.5">
                            {s.step}
                          </div>
                          <p className="text-sm text-muted-foreground leading-snug">{s.text}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
                
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="results"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", staggerChildren: 0.1 }}
            className="space-y-10"
          >
            {/* Results Header */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-4xl font-bold font-syne text-foreground tracking-tight">
                  Analysis <span className="gradient-text">Results</span>
                </h2>
                <p className="text-muted-foreground mt-2 text-lg">
                  Analyzed {results.length} candidates •{" "}
                  <span className="text-emerald-500 font-medium">{results.filter((r) => r.score >= 80).length} high matches</span>
                </p>
              </div>
              <Button
                onClick={resetAnalysis}
                variant="outline"
                className="bg-[#1a1a26]/50 border-border/50 hover:bg-primary/20 hover:text-primary hover:border-primary/50 text-foreground transition-all duration-300 h-11 font-syne"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                New Analysis
              </Button>
            </motion.div>

            {/* Stats Cards */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[
                { label: "High Match (80+)", count: results.filter((r) => r.score >= 80).length, icon: Star, colorClass: "text-emerald-500", bgClass: "bg-emerald-500/10", borderClass: "hover:border-emerald-500/50" },
                { label: "Medium Match (60-79)", count: results.filter((r) => r.score >= 60 && r.score < 80).length, icon: TrendingUp, colorClass: "text-orange-500", bgClass: "bg-orange-500/10", borderClass: "hover:border-orange-500/50" },
                { label: "Low Match (<60)", count: results.filter((r) => r.score < 60).length, icon: XCircle, colorClass: "text-destructive", bgClass: "bg-destructive/10", borderClass: "hover:border-destructive/50" },
                { label: "Average Score", count: `${Math.round(results.reduce((sum, r) => sum + r.score, 0) / (results.length || 1))}%`, icon: Award, colorClass: "text-primary", bgClass: "bg-primary/10", borderClass: "hover:border-primary/50" }
              ].map((stat, i) => (
                <Card key={i} className={`glass-card shadow-lg border-0 bg-transparent relative overflow-hidden group transition-all duration-300 ${stat.borderClass}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`${stat.bgClass} p-3 rounded-xl transition-transform group-hover:scale-110 duration-300`}>
                        <stat.icon className={`h-6 w-6 ${stat.colorClass}`} />
                      </div>
                      <div>
                        <p className={`text-3xl font-bold font-syne ${stat.colorClass}`}>{stat.count}</p>
                        <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>

            {/* Filters */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="glass-card shadow-lg border-0 bg-transparent overflow-hidden">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative group/search">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 group-focus-within/search:text-primary transition-colors" />
                        <Input
                          placeholder="Search candidates by name or skills..."
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="pl-12 h-12 bg-[#0a0a0f]/50 border-border/50 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-base"
                        />
                      </div>
                    </div>
                    <Select value={filterScore} onValueChange={(v) => { setFilterScore(v); setCurrentPage(1); }}>
                      <SelectTrigger className="w-full lg:w-[220px] h-12 bg-[#0a0a0f]/50 border-border/50 rounded-xl">
                        <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="Filter by score" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Scores</SelectItem>
                        <SelectItem value="high">High Match (80+)</SelectItem>
                        <SelectItem value="medium">Medium Match (60-79)</SelectItem>
                        <SelectItem value="low">Low Match (&lt;60)</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={`${sortBy}-${sortOrder}`} onValueChange={(v) => { const [f, o] = v.split("-"); setSortBy(f as any); setSortOrder(o as any); }}>
                      <SelectTrigger className="w-full lg:w-[220px] h-12 bg-[#0a0a0f]/50 border-border/50 rounded-xl">
                        {sortOrder === "asc" ? <SortAsc className="h-4 w-4 mr-2 text-muted-foreground" /> : <SortDesc className="h-4 w-4 mr-2 text-muted-foreground" />}
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
            </motion.div>

            {/* Results Grid */}
            <div className="grid gap-6">
              {paginatedResults.map((result, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index }}>
                  <Card className={`glass-card shadow-lg border-0 bg-transparent relative overflow-hidden group hover:-translate-y-1 transition-all duration-300`}>
                    {/* Status accent border */}
                    <div className={`absolute left-0 top-0 bottom-0 w-2 ${
                      result.score >= 80 ? 'bg-emerald-500' : result.score >= 60 ? 'bg-orange-500' : 'bg-destructive'
                    }`} />
                    
                    <CardContent className="p-6 md:p-8 pl-8 md:pl-10">
                      <div className="grid md:grid-cols-4 gap-8">
                        {/* Candidate Info */}
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-bold text-2xl font-syne text-foreground tracking-tight">
                              {biasAuditEnabled ? `Candidate ${Math.abs(result.candidateName.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)).toString(16).toUpperCase().substring(0, 6)}` : result.candidateName}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                              <FileText className="h-3.5 w-3.5" />
                              {biasAuditEnabled ? "Filename Hidden" : result.fileName}
                            </p>
                          </div>
                          
                          <div className={`inline-flex items-center justify-center px-4 py-2 rounded-lg font-bold text-xl border ${
                            result.score >= 80 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' :
                            result.score >= 60 ? 'bg-orange-500/10 text-orange-500 border-orange-500/30' :
                            'bg-destructive/10 text-destructive border-destructive/30'
                          }`}>
                            {result.score}% Match
                          </div>

                          {result.skills && result.skills.length > 0 && (
                            <div className="pt-2">
                              <div className="flex flex-wrap gap-2">
                                {result.skills.map((skill, idx) => (
                                  <Badge key={idx} variant="outline" className="bg-[#1a1a26]/80 text-foreground border-border/50 text-xs font-medium py-1">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Good Points */}
                        <div className="bg-[#12121a]/40 rounded-xl p-5 border border-border/5">
                          <h4 className="font-syne font-bold text-emerald-500 mb-4 flex items-center gap-2">
                            <CheckCircle className="h-5 w-5" /> Strengths
                          </h4>
                          <ul className="space-y-3">
                            {result.goodPoints.map((point, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2.5">
                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                                <span className="leading-snug">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Bad Points */}
                        <div className="bg-[#12121a]/40 rounded-xl p-5 border border-border/5">
                          <h4 className="font-syne font-bold text-destructive mb-4 flex items-center gap-2">
                            <XCircle className="h-5 w-5" /> Gaps
                          </h4>
                          <ul className="space-y-3">
                            {result.badPoints.map((point, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2.5">
                                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-destructive flex-shrink-0" />
                                <span className="leading-snug">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 justify-center border-l md:border-l-border/10 md:pl-8">
                          <Button 
                            className="w-full bg-gradient-to-r from-primary to-[#8e86ff] text-white hover:shadow-[0_0_15px_rgba(108,99,255,0.4)] transition-all h-12 font-syne"
                            onClick={() => {
                              setSelectedCandidate({
                                name: result.candidateName,
                                role: "Candidate",
                                analysis: result.deepAnalysis || null
                              })
                              setDrawerOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" /> View Details
                          </Button>
                          <Button variant="outline" className="w-full bg-[#1a1a26]/50 border-border/50 hover:bg-white/5 transition-all h-12 font-syne text-foreground">
                            <Download className="h-4 w-4 mr-2" /> Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              
              {paginatedResults.length === 0 && (
                 <div className="text-center py-20 bg-[#12121a]/40 rounded-2xl border border-white/5 backdrop-blur-md">
                    <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-syne text-foreground/80">No candidates found</h3>
                    <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
                 </div>
              )}
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </main>

      {/* Candidate Details Sidebar */}
      <CandidateDetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        candidateName={selectedCandidate?.name || ""}
        currentRole={selectedCandidate?.role || ""}
        analysis={selectedCandidate?.analysis || null}
      />

      <Toaster />
    </div>
  );
}

