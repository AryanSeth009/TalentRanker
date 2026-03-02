import { analyzeResumeWithOllama } from "./lib/ollama";

const test = async () => {
    try {
        console.log("Starting test analysis...");
        const result = await analyzeResumeWithOllama("John Doe Resume. Experience: 5 years in React and Node.js.", "Looking for a full stack engineer with React experience.");
        console.log("SUCCESS! Result:", JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("FAILED!", e);
    }
};

test();
