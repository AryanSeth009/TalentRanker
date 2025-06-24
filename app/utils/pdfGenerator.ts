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

export const generatePDF = async (candidates: Candidate[], jobDescription: string) => {
  // Dynamic import to avoid SSR issues
  const jsPDF = (await import("jspdf")).default

  const doc = new jsPDF()
  const pageHeight = doc.internal.pageSize.height
  let yPosition = 20

  // Helper function to add new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      doc.addPage()
      yPosition = 20
    }
  }

  // Helper function to wrap text
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize = 10) => {
    doc.setFontSize(fontSize)
    const lines = doc.splitTextToSize(text, maxWidth)
    doc.text(lines, x, y)
    return lines.length * (fontSize * 0.4) // Return height used
  }

  // Title
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.text("Resume Analysis Report", 20, yPosition)
  yPosition += 15

  // Date
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition)
  yPosition += 10

  // Job Description Summary
  checkPageBreak(30)
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Job Description:", 20, yPosition)
  yPosition += 8

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  const jobDescHeight = addWrappedText(
    jobDescription.substring(0, 500) + (jobDescription.length > 500 ? "..." : ""),
    20,
    yPosition,
    170,
  )
  yPosition += jobDescHeight + 10

  // Summary Statistics
  checkPageBreak(40)
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Summary Statistics:", 20, yPosition)
  yPosition += 10

  const highMatch = candidates.filter((c) => c.matchScore >= 80).length
  const mediumMatch = candidates.filter((c) => c.matchScore >= 60 && c.matchScore < 80).length
  const lowMatch = candidates.filter((c) => c.matchScore < 60).length
  const avgScore = Math.round(candidates.reduce((sum, c) => sum + c.matchScore, 0) / candidates.length)

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Total Candidates: ${candidates.length}`, 20, yPosition)
  yPosition += 6
  doc.text(`High Match (80+): ${highMatch}`, 20, yPosition)
  yPosition += 6
  doc.text(`Medium Match (60-79): ${mediumMatch}`, 20, yPosition)
  yPosition += 6
  doc.text(`Low Match (<60): ${lowMatch}`, 20, yPosition)
  yPosition += 6
  doc.text(`Average Score: ${avgScore}%`, 20, yPosition)
  yPosition += 15

  // Candidates Details
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("Candidate Details:", 20, yPosition)
  yPosition += 10

  candidates.forEach((candidate, index) => {
    checkPageBreak(60)

    // Candidate header
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text(`${index + 1}. ${candidate.name}`, 20, yPosition)
    yPosition += 8

    // Basic info
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Email: ${candidate.email}`, 25, yPosition)
    yPosition += 5
    doc.text(`Phone: ${candidate.phone}`, 25, yPosition)
    yPosition += 5
    doc.text(`Location: ${candidate.location}`, 25, yPosition)
    yPosition += 5
    doc.text(`Experience: ${candidate.experience}`, 25, yPosition)
    yPosition += 5
    doc.text(`Education: ${candidate.education}`, 25, yPosition)
    yPosition += 5

    // Match score with color
    const scoreColor =
      candidate.matchScore >= 80 ? [34, 197, 94] : candidate.matchScore >= 60 ? [255, 169, 77] : [239, 68, 68]
    doc.setTextColor(...scoreColor)
    doc.setFont("helvetica", "bold")
    doc.text(`Match Score: ${candidate.matchScore}%`, 25, yPosition)
    doc.setTextColor(0, 0, 0) // Reset to black
    yPosition += 8

    // Skills
    doc.setFont("helvetica", "bold")
    doc.text("Skills:", 25, yPosition)
    yPosition += 5
    doc.setFont("helvetica", "normal")
    const skillsText = candidate.skills.join(", ")
    const skillsHeight = addWrappedText(skillsText, 25, yPosition, 160, 9)
    yPosition += skillsHeight + 5

    // Strengths
    doc.setFont("helvetica", "bold")
    doc.text("Strengths:", 25, yPosition)
    yPosition += 5
    doc.setFont("helvetica", "normal")
    candidate.goodPoints.forEach((point) => {
      checkPageBreak(10)
      doc.text(`• ${point}`, 30, yPosition)
      yPosition += 5
    })
    yPosition += 3

    // Areas for improvement
    doc.setFont("helvetica", "bold")
    doc.text("Areas for Improvement:", 25, yPosition)
    yPosition += 5
    doc.setFont("helvetica", "normal")
    candidate.badPoints.forEach((point) => {
      checkPageBreak(10)
      doc.text(`• ${point}`, 30, yPosition)
      yPosition += 5
    })
    yPosition += 10
  })

  // Save the PDF
  doc.save(`Resume_Analysis_Report_${new Date().toISOString().split("T")[0]}.pdf`)
}
