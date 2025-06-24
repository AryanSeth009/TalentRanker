# AI Resume Shortlisting App

A sophisticated resume analysis and candidate shortlisting application that provides accurate matching based on job requirements and resume content.

## Features

### 🔍 **Accurate Resume Analysis**
- **Job Description Parsing**: Automatically extracts required skills, experience levels, and education requirements from job descriptions
- **Resume Content Analysis**: Parses actual resume content to extract relevant information (skills, experience, education, projects)
- **Intelligent Matching**: Calculates match scores based on multiple criteria:
  - Skills matching (40% weight)
  - Experience level alignment (25% weight)
  - Education relevance (15% weight)
  - Project experience (20% weight)

### 📊 **Detailed Candidate Insights**
- **Match Score**: Percentage-based score indicating candidate suitability
- **Good Points**: Specific strengths and matching criteria
- **Bad Points**: Areas of concern or missing requirements
- **Status Classification**: Automatic categorization (Assessment Scheduled, Passed, Failed, Pending)

### 🎯 **Smart Job Requirement Analysis**
The system analyzes job descriptions to identify:
- **Required Skills**: Must-have technical skills
- **Preferred Skills**: Nice-to-have skills
- **Experience Level**: Junior, Mid-level, or Senior positions
- **Education Requirements**: Degree and certification requirements
- **Keywords**: Remote work, contract type, etc.

### 📝 **Resume Content Extraction**
When actual resume content is available, the system extracts:
- **Personal Information**: Name, email, phone
- **Technical Skills**: Programming languages, frameworks, tools
- **Experience Level**: Years of experience
- **Education**: Degree and field of study
- **Projects**: Relevant project experience
- **Certifications**: Professional certifications

## How It Works

### 1. Job Description Analysis
```javascript
const jobRequirements = analyzeJobDescription(jobDescription)
// Returns: { requiredSkills, preferredSkills, experienceLevel, education, keywords }
```

### 2. Resume Content Parsing
```javascript
const resumeData = parseResumeContent(resumeContent, fileName)
// Returns: { name, email, phone, skills, experience, education, summary, projects, certifications }
```

### 3. Match Score Calculation
```javascript
const matchAnalysis = calculateMatchScore(jobRequirements, resumeData)
// Returns: { score, goodPoints, badPoints }
```

### 4. Candidate Generation
```javascript
const candidate = generateAccurateCandidate(file, index, jobDescription, resumeContent)
// Returns: Complete candidate profile with accurate analysis
```

## Example Analysis

### Job Description
```
Senior React Developer
Required: React, TypeScript, Node.js, 5+ years experience
Preferred: AWS, Docker, GraphQL
Education: Bachelor's degree in Computer Science
```

### Analysis Results
- **Score**: 85/100
- **Good Points**:
  - Matches 3 out of 3 required skills
  - Has 2 preferred skills
  - Experience level aligns well with job requirements
  - Education background is relevant
- **Bad Points**:
  - Limited relevant project experience

## Setup

1. **Environment Variables**
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

## API Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User authentication
- `GET /api/auth/me` - Get current user
- `POST /api/analysis/create` - Create new analysis
- `GET /api/analysis/list` - Get user's analyses

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: JWT with HTTP-only cookies
- **UI**: Tailwind CSS, Radix UI components
- **PDF Generation**: jsPDF

## Future Enhancements

- **Real PDF/DOCX Parsing**: Integration with document parsing libraries
- **AI-Powered Analysis**: Machine learning models for better matching
- **Interview Scheduling**: Automated interview coordination
- **Email Notifications**: Candidate status updates
- **Advanced Filtering**: More sophisticated search and filter options 