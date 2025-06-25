"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
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
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import Navigation from "./components/navigation";

interface AnalysisResult {
  candidateName: string;
  score: number;
  goodPoints: string[];
  badPoints: string[];
  fileName: string;
  skills: string[];
}

export default function Dashboard() {
  const [files, setFiles] = useState<File[]>([]);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const resetAnalysis = () => {
    setShowResults(false);
    setResults([]);
    setFiles([]);
    setJobDescription("");
    toast({
      title: "Analysis reset",
      description: "Ready for new analysis.",
    });
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800 border-green-200";
    if (score >= 60) return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-red-100 text-red-800 border-red-200";
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      {/* <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-xl">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">AI Resume Analyzer</h1>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">Mock Analysis Engine</Badge>
          </div>
        </div>
      </header> */}

      <main className="container mx-auto px-4 py-8">
        {!showResults ? (
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column: Upload & Job Description */}
            <div className="md:col-span-2 space-y-6">
              {/* Upload Section */}
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-3">
                    <Upload className="h-6 w-6" />
                    Upload Resume Files
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Upload PDF or DOCX resume files (max 20 files)
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
                      <p className="mt-3 text-sm text-gray-600">
                        Drag and drop resume files here or click to browse
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        For demo: Any PDF/DOCX files will generate realistic mock
                        resume content
                      </p>
                    </div>

                    {files.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-800">
                            Uploaded Files ({files.length}/20)
                          </h4>
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
                        <div className="grid gap-3 max-h-60 overflow-y-auto">
                          {files.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <div>
                                  <span className="text-sm font-medium text-gray-800">
                                    {file.name}
                                  </span>
                                  <div className="text-xs text-gray-500">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                                className="text-red-500 hover:text-red-700"
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
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                  <CardTitle>Job Description</CardTitle>
                  <CardDescription className="text-green-100">
                    Paste the complete job description for candidate matching
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Paste your detailed job description here..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="min-h-[200px] resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {jobDescription.length} characters (minimum 50 required)
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setJobDescription(sampleJobDescription)}
                        className="border-gray-300 hover:bg-gray-50"
                      >
                        Use Sample JD
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Right Column: Quick Stats & Start Button */}
            <div className="space-y-6 flex flex-col">
              {/* Quick Stats */}
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-t-lg">
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Files Ready</span>
                    <span className="text-gray-900 font-bold">
                      {files.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Description Length</span>
                    <span className="text-gray-900 font-bold">
                      {jobDescription.length}
                    </span>
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
                      {files.length > 0 && jobDescription.length >= 50
                        ? "Ready"
                        : "Incomplete"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              {/* Start Analysis Button */}
              <div className="text-center mt-2">
                <Button
                  onClick={startAnalysis}
                  disabled={
                    isAnalyzing ||
                    files.length === 0 ||
                    jobDescription.length < 50
                  }
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-6 text-xl rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                      Analyzing Resumes...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-3 h-6 w-6" />
                      Start AI Analysis
                    </>
                  )}
                </Button>
              </div>
              {/* Analysis Progress (if analyzing) */}
              {isAnalyzing && (
                <Card className="shadow-lg border-0 border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        <span className="text-lg font-medium text-gray-900">
                          Analyzing Resumes...
                        </span>
                      </div>
                      <Progress value={analysisProgress} className="h-3" />
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>• Extracting text from resume files</p>
                        <p>• Analyzing skills and experience</p>
                        <p>• Matching against job requirements</p>
                        <p>• Generating insights and scores</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Results Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Analysis Results
                </h2>
                <p className="text-gray-600">
                  Analyzed {results.length} candidates •{" "}
                  {results.filter((r) => r.score >= 80).length} high matches •{" "}
                  {results.filter((r) => r.score >= 60 && r.score < 80).length}{" "}
                  medium matches
                </p>
              </div>
              <Button
                onClick={resetAnalysis}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                New Analysis
              </Button>
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
                        {results.filter((r) => r.score >= 80).length}
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
                        {
                          results.filter((r) => r.score >= 60 && r.score < 80)
                            .length
                        }
                      </p>
                      <p className="text-sm text-gray-600">
                        Medium Match (60-79)
                      </p>
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
                        {results.filter((r) => r.score < 60).length}
                      </p>
                      <p className="text-sm text-gray-600">
                        Low Match (&lt;60)
                      </p>
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
                        {Math.round(
                          results.reduce((sum, r) => sum + r.score, 0) /
                            results.length
                        )}
                        %
                      </p>
                      <p className="text-sm text-gray-600">Average Score</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results Grid */}
            <div className="grid gap-6">
              {results
                .sort((a, b) => b.score - a.score)
                .map((result, index) => (
                  <Card
                    key={index}
                    className={`shadow-lg border-0 border-l-4 ${
                      result.score >= 80
                        ? "border-l-green-500"
                        : result.score >= 60
                        ? "border-l-orange-500"
                        : "border-l-red-500"
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-4 gap-6">
                        {/* Candidate Info */}
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-bold text-xl text-gray-900">
                              {result.candidateName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {result.fileName}
                            </p>
                          </div>
                          <Badge
                            className={`font-bold text-lg px-3 py-1 border ${getScoreBadgeColor(
                              result.score
                            )}`}
                          >
                            {result.score}% Match
                          </Badge>
                        </div>

                        {/* Skills */}
                        {result.skills && result.skills.length > 0 && (
                          <div className="mt-2">
                            <span className="font-semibold text-gray-700">
                              Skills:{" "}
                            </span>
                            {result.skills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="inline-block bg-blue-100 text-blue-800 text-xs font-medium mr-1 mb-1 px-2 py-0.5 rounded border border-blue-200"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Good Points */}
                        <div>
                          <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Strengths
                          </h4>
                          <ul className="space-y-2">
                            {result.goodPoints.map((point, idx) => (
                              <li
                                key={idx}
                                className="text-sm text-gray-600 flex items-start gap-2"
                              >
                                <span className="text-green-500 mt-0.5">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Bad Points */}
                        <div>
                          <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                            <XCircle className="h-4 w-4" />
                            Areas for Improvement
                          </h4>
                          <ul className="space-y-2">
                            {result.badPoints.map((point, idx) => (
                              <li
                                key={idx}
                                className="text-sm text-gray-600 flex items-start gap-2"
                              >
                                <span className="text-red-500 mt-0.5">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-300 hover:bg-gray-50"
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
          </div>
        )}
      </main>

      <Toaster />
    </div>
  );
}
