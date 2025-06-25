import { initializeAgentExecutorWithOptions } from "langchain/agents"
import { ResumeMatcherTool, type ResumeAnalysis } from "./tools"

export class ResumeAnalysisAgent {
  private agent: any
  private resumeMatcherTool: ResumeMatcherTool

  constructor() {
    this.resumeMatcherTool = new ResumeMatcherTool()
  }

  async initialize() {
    // Initialize the LLM (using a mock for now, replace with actual OpenAI)
    const llm = new MockChatModel()

    // Initialize the agent with tools
    this.agent = await initializeAgentExecutorWithOptions([this.resumeMatcherTool], llm, {
      agentType: "zero-shot-react-description",
      verbose: true,
      maxIterations: 3,
    })
  }

  async analyzeResume(resumeText: string, jobDescription: string): Promise<ResumeAnalysis> {
    if (!this.agent) {
      await this.initialize()
    }

    try {
      const input = JSON.stringify({ resume: resumeText, jobDescription })
      const result = await this.resumeMatcherTool._call(input)
      return JSON.parse(result)
    } catch (error) {
      console.error("Agent analysis error:", error)
      return {
        score: 0,
        goodPoints: [],
        badPoints: ["Analysis failed"],
        reasoning: "Technical error during analysis",
      }
    }
  }

  async analyzeBatch(
    resumes: Array<{ text: string; fileName: string }>,
    jobDescription: string,
    onProgress?: (progress: number) => void,
  ): Promise<Array<ResumeAnalysis & { fileName: string }>> {
    const results: Array<ResumeAnalysis & { fileName: string }> = []

    for (let i = 0; i < resumes.length; i++) {
      const resume = resumes[i]

      try {
        const analysis = await this.analyzeResume(resume.text, jobDescription)
        results.push({
          ...analysis,
          fileName: resume.fileName,
        })
      } catch (error) {
        console.error(`Error analyzing ${resume.fileName}:`, error)
        results.push({
          score: 0,
          goodPoints: [],
          badPoints: ["Analysis failed"],
          reasoning: "Technical error during analysis",
          fileName: resume.fileName,
        })
      }

      // Report progress
      if (onProgress) {
        onProgress(((i + 1) / resumes.length) * 100)
      }

      // Add small delay to prevent overwhelming the system
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    return results
  }
}

// Mock ChatModel for development (replace with actual OpenAI in production)
class MockChatModel {
  async call(input: string): Promise<string> {
    // This would be replaced with actual OpenAI API call
    return "Analysis completed using resume matcher tool."
  }

  async predict(input: string): Promise<string> {
    return this.call(input)
  }

  _llmType(): string {
    return "mock-chat"
  }
}

export { ResumeAnalysis }
