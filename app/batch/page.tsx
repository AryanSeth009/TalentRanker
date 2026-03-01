"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { UploadCloud, FileText, Play, Download, Search, Settings2, Trash2, CheckCircle, Clock, AlertCircle, Activity } from "lucide-react"
import Navigation from "@/app/components/navigation"
import { Progress } from "@/components/ui/progress"

export default function BatchPage() {
  const [files, setFiles] = useState<File[]>([])
  const [jobDescription, setJobDescription] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleMultipleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const startBatchProcess = async () => {
    if (files.length === 0 || !jobDescription) return
    setIsProcessing(true)
    setProgress(0)
    setResults([])

    const actualResults: any[] = []

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData()
      formData.append("files", files[i])
      formData.append("jobDescription", jobDescription)
      formData.append("title", `Batch Analysis: ${files[i].name}`)
      
      try {
        const res = await fetch("/api/analysis/create", {
          method: "POST",
          body: formData,
        })
        const data = await res.json()
        
        if (data.success && data.analysis) {
          // Map backend DeepAnalysis structure to the matrix rows
          actualResults.push({
            name: files[i].name.replace(/\.[^/.]+$/, ""),
            score: data.analysis.overall_score || data.analysis.matchScore || 0,
            skillsMatched: data.analysis.strengths?.length || 3,
            experienceFit: (data.analysis.overall_score || 0) >= 80 ? "High" : (data.analysis.overall_score || 0) >= 60 ? "Medium" : "Low",
            status: "Completed",
          })
        } else {
          actualResults.push({
            name: files[i].name.replace(/\.[^/.]+$/, ""),
            score: 0,
            skillsMatched: 0,
            experienceFit: "Error",
            status: "Failed",
          })
        }
      } catch (e) {
        console.error("Batch processing error for file", files[i].name, e)
        actualResults.push({
          name: files[i].name.replace(/\.[^/.]+$/, ""),
          score: 0,
          skillsMatched: 0,
          experienceFit: "Error",
          status: "Failed",
        })
      }
      
      setProgress(Math.round(((i + 1) / files.length) * 100))
      setResults([...actualResults])
    }
    
    setIsProcessing(false)
  }

  const downloadCSV = () => {
    if (results.length === 0) return
    const headers = ["Candidate", "Match Score", "Skills Matched", "Experience Fit"]
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + results.map(r => `${r.name},${r.score}%,${r.skillsMatched},${r.experienceFit}`).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "batch_analysis_results.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary/10 blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-secondary/10 blur-[120px] animate-blob animation-delay-2000" />
      </div>

      <Navigation />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase mb-4">
              <Settings2 className="w-4 h-4" />
              Batch Processor
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold font-syne tracking-tight mb-2">
              <span className="gradient-text">Mass Analysis</span> Matrix
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Process hundreds of resumes against a job description simultaneously. Discover your top candidates in minutes.
            </p>
          </div>
          {results.length > 0 && !isProcessing && (
            <Button onClick={downloadCSV} variant="outline" className="border-primary/50 hover:bg-primary/20 bg-background/50 backdrop-blur-md">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel: Configuration */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Job Requirements
                </CardTitle>
                <CardDescription>Paste the target job description here.</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="e.g. Looking for a Senior React Developer with 5+ years of experience..."
                  className="min-h-[200px] resize-none bg-background/50 border-white/10"
                  value={jobDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setJobDescription(e.target.value)}
                  disabled={isProcessing}
                />
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-secondary" />
                  Upload Resumes
                </CardTitle>
                <CardDescription>Select multiple PDF or DOCX files.</CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                    files.length > 0 ? "border-primary/30 bg-primary/5" : "border-white/10 bg-background/50 hover:border-primary/50"
                  }`}
                >
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.docx,.doc"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleMultipleFiles}
                    disabled={isProcessing}
                  />
                  <UploadCloud className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-foreground font-medium mb-2">
                    Drag & drop or <span className="text-primary cursor-pointer" onClick={() => fileInputRef.current?.click()}>browse files</span>
                  </p>
                  <p className="text-xs text-muted-foreground">Up to 500 files per batch</p>
                </div>

                {files.length > 0 && (
                  <div className="mt-4 space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                    {files.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10 text-sm">
                        <span className="truncate max-w-[200px]">{file.name}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-400" onClick={() => removeFile(idx)} disabled={isProcessing}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Button 
              className="w-full text-lg h-12 font-bold" 
              onClick={startBatchProcess}
              disabled={isProcessing || files.length === 0 || !jobDescription}
            >
              {isProcessing ? (
                <>
                  <Activity className="w-5 h-5 mr-2 animate-spin" />
                  Processing Batch ({progress}%)
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Start Batch Analysis
                </>
              )}
            </Button>
          </div>

          {/* Right Panel: Matrix/Results */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-card h-full min-h-[600px] flex flex-col">
              <CardHeader className="border-b border-white/5 pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl">Comparison Matrix</CardTitle>
                    <CardDescription>Real-time candidate scoring and ranking</CardDescription>
                  </div>
                  {isProcessing && (
                    <div className="text-right">
                      <div className="text-sm font-medium mb-1 shrink-0">{progress}% Completed</div>
                      <Progress value={progress} className="w-[150px] h-2" indicatorClassName="bg-gradient-to-r from-primary to-secondary" />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                {results.length === 0 && !isProcessing ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-12 text-center">
                    <Search className="w-16 h-16 mb-4 opacity-20" />
                    <h3 className="text-xl font-medium text-foreground mb-2">No Data Yet</h3>
                    <p className="max-w-md">Upload candidate resumes and provide a job description to generate the comparison matrix.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto w-full custom-scrollbar">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                          <th className="p-4 font-semibold text-foreground">Candidate</th>
                          <th className="p-4 font-semibold text-foreground">Match Score</th>
                          <th className="p-4 font-semibold text-foreground">Skills Matched</th>
                          <th className="p-4 font-semibold text-foreground">Experience Fit</th>
                          <th className="p-4 font-semibold text-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence>
                          {results.map((result, idx) => (
                            <motion.tr 
                              key={idx}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="border-b border-white/5 hover:bg-white/5 transition-colors"
                            >
                              <td className="p-4 font-medium">{result.name}</td>
                              <td className="p-4">
                                <Badge variant="outline" className={`font-mono ${
                                  result.score >= 80 ? 'text-green-400 border-green-400/30 bg-green-400/10' :
                                  result.score >= 60 ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10' :
                                  'text-red-400 border-red-400/30 bg-red-400/10'
                                }`}>
                                  {result.score}%
                                </Badge>
                              </td>
                              <td className="p-4">{result.skillsMatched} core skills</td>
                              <td className="p-4">{result.experienceFit}</td>
                              <td className="p-4">
                                <span className="inline-flex items-center text-green-400 text-xs font-medium">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Ready
                                </span>
                              </td>
                            </motion.tr>
                          ))}
                          {isProcessing && (
                            <motion.tr 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="bg-white/5"
                            >
                              <td className="p-4 text-muted-foreground flex items-center">
                                <Clock className="w-4 h-4 mr-2 animate-pulse" />
                                Analyzing pending files...
                              </td>
                              <td className="p-4"></td>
                              <td className="p-4"></td>
                              <td className="p-4"></td>
                              <td className="p-4"></td>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
