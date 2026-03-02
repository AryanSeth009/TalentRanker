import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";

export const ANALYSIS_SYSTEM_PROMPT = `
You are an expert technical recruiter and resume analyst.
Analyze the given resume against the provided job description.
CRITICAL: You must return the analysis ONLY as a valid JSON object matching this exact schema:

{
  "overall_score": number (0-100),
  "summary": "string (2-3 sentences max)",
  "skill_gaps": [
    { "skill": "string", "importance": "critical" | "moderate" | "nice-to-have", "present": boolean }
  ],
  "red_flags": [
    { "type": "employment_gap" | "job_hopping" | "credential_mismatch" | "other", "description": "string", "severity": "high" | "medium" | "low" }
  ],
  "culture_fit": {
    "score": number (0-100),
    "reasoning": "string",
    "matching_values": ["string"],
    "mismatched_values": ["string"],
    "dimensions": [
      { "subject": "Adaptability", "A": number (0-100), "fullMark": 100 },
      { "subject": "Collaboration", "A": number (0-100), "fullMark": 100 },
      { "subject": "Ownership", "A": number (0-100), "fullMark": 100 },
      { "subject": "Communication", "A": number (0-100), "fullMark": 100 },
      { "subject": "Innovation", "A": number (0-100), "fullMark": 100 }
    ]
  },
  "interview_questions": [
    { "question": "string", "target_area": "string", "why": "string" }
  ],
  "strengths": ["string"],
  "concerns": ["string"]
}

Do not include markdown code block formatting (like \`\`\`json) in your response. Output raw JSON only.
`;

const model = new ChatOpenAI({
  modelName: "meta-llama/llama-3.3-70b-instruct",
  temperature: 0.1,
  openAIApiKey: process.env.OPENROUTER_API_KEY,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
  }
});

// Reuse the schema from the prior implementations via Zod for better LangChain integration
const analysisSchema = z.object({
  overall_score: z.number().min(0).max(100),
  summary: z.string(),
  skill_gaps: z.array(z.object({
    skill: z.string(),
    importance: z.enum(["critical", "moderate", "nice-to-have"]),
    present: z.boolean()
  })),
  red_flags: z.array(z.object({
    type: z.enum(["employment_gap", "job_hopping", "credential_mismatch", "other"]),
    description: z.string(),
    severity: z.enum(["high", "medium", "low"])
  })).optional(),
  culture_fit: z.object({
    score: z.number().min(0).max(100),
    reasoning: z.string(),
    matching_values: z.array(z.string()),
    mismatched_values: z.array(z.string()),
    dimensions: z.array(z.object({
      subject: z.string(),
      A: z.number(),
      fullMark: z.number()
    }))
  }),
  interview_questions: z.array(z.object({
    question: z.string(),
    target_area: z.string(),
    why: z.string()
  })),
  strengths: z.array(z.string()),
  concerns: z.array(z.string())
});

const parser = StructuredOutputParser.fromZodSchema(analysisSchema);

const prompt = new PromptTemplate({
  template: "{system_prompt}\n\n{format_instructions}\n\nJob Description:\n{jobDescription}\n\nResume Content:\n{resumeText}",
  inputVariables: ["system_prompt", "jobDescription", "resumeText"],
  partialVariables: {
    format_instructions: parser.getFormatInstructions(),
  },
});

export async function analyzeResumeWithOllama(resumeText: string, jobDescription: string) {
  try {
    const input = await prompt.format({
      system_prompt: ANALYSIS_SYSTEM_PROMPT,
      jobDescription,
      resumeText,
    });

    const response = await model.invoke(input);
    const parsed = await parser.parse(response.content as string);
    return parsed;
  } catch (error) {
    console.error("Ollama Analysis Error:", error);
    throw error;
  }
}
