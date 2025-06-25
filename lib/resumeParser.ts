// Mock resume parsing for preview (no external dependencies)
export class ResumeParser {
  static async extractText(file: File): Promise<string> {
    // Simulate text extraction with realistic resume content
    const fileName = file.name.toLowerCase()

    if (fileName.endsWith(".pdf") || fileName.endsWith(".docx")) {
      return this.generateMockResumeText(file.name)
    } else {
      throw new Error(`Unsupported file type: ${file.name}`)
    }
  }

  static generateMockResumeText(fileName: string): string {
    // Generate realistic resume content based on filename
    const name = fileName.replace(/[_\-.]/g, " ").replace(/\.(pdf|docx)$/i, "")

    const resumeTemplates = [
      {
        name: name,
        content: `${name}
Senior Frontend Developer

CONTACT
Email: ${name.toLowerCase().replace(/\s+/g, ".")}@email.com
Phone: +1 (555) 123-4567
Location: San Francisco, CA

EXPERIENCE
Senior Frontend Developer | TechCorp Inc. | 2020 - Present
• Developed and maintained React applications with TypeScript
• Led a team of 5 developers in building scalable web applications
• Implemented CI/CD pipelines using Docker and AWS
• Built responsive user interfaces using modern CSS frameworks
• Collaborated with UX designers on design system implementation

Frontend Developer | StartupXYZ | 2018 - 2020
• Created interactive web applications using React and Redux
• Optimized application performance and improved loading times by 40%
• Worked with REST APIs and GraphQL for data integration
• Participated in agile development processes and code reviews

SKILLS
Programming Languages: JavaScript, TypeScript, Python, HTML5, CSS3
Frontend Frameworks: React, Vue.js, Angular, Next.js
Backend: Node.js, Express.js, REST APIs, GraphQL
Cloud & DevOps: AWS, Docker, Kubernetes, Jenkins, CI/CD
Tools: Git, Webpack, Babel, Jest, Cypress, Figma

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley | 2014 - 2018

PROJECTS
• E-commerce Platform: Built a full-stack e-commerce solution using React and Node.js
• Real-time Chat Application: Developed using WebSocket and React
• Design System: Created reusable component library for multiple projects`,
      },
      {
        name: name,
        content: `${name}
Full Stack Developer

CONTACT
Email: ${name.toLowerCase().replace(/\s+/g, ".")}@gmail.com
Phone: +1 (555) 987-6543
Location: Austin, TX

EXPERIENCE
Full Stack Developer | InnovateTech | 2019 - Present
• Built end-to-end web applications using React, Node.js, and MongoDB
• Designed and implemented RESTful APIs and microservices architecture
• Managed AWS infrastructure and deployment pipelines
• Mentored junior developers and conducted technical interviews

Software Engineer | DataSolutions | 2017 - 2019
• Developed data visualization dashboards using React and D3.js
• Implemented automated testing strategies with Jest and Cypress
• Collaborated with product managers on feature requirements
• Optimized database queries and improved application performance

SKILLS
Frontend: React, JavaScript, TypeScript, HTML, CSS, Sass
Backend: Node.js, Python, Java, Express.js, Django
Databases: MongoDB, PostgreSQL, MySQL, Redis
Cloud: AWS, Azure, Docker, Kubernetes
Tools: Git, Jenkins, Jira, Confluence

EDUCATION
Master of Science in Software Engineering
Stanford University | 2015 - 2017

Bachelor of Engineering in Computer Science
University of Texas at Austin | 2011 - 2015

CERTIFICATIONS
• AWS Certified Solutions Architect
• MongoDB Certified Developer`,
      },
    ]

    return resumeTemplates[Math.floor(Math.random() * resumeTemplates.length)].content
  }

  static extractCandidateName(resumeText: string): string {
    // Extract name from the first line of resume
    const lines = resumeText.split("\n").filter((line) => line.trim().length > 0)

    for (const line of lines.slice(0, 3)) {
      const trimmed = line.trim()

      // Skip common headers
      if (trimmed.toLowerCase().includes("resume") || trimmed.toLowerCase().includes("cv") || trimmed.length < 3) {
        continue
      }

      // Check if line looks like a name
      const words = trimmed.split(/\s+/)
      if (words.length >= 2 && words.length <= 4) {
        const isName = words.every((word) => /^[A-Z][a-z]+$/.test(word) || /^[A-Z]\.?$/.test(word))

        if (isName) {
          return trimmed
        }
      }
    }

    // Fallback
    return lines[0] || "Unknown Candidate"
  }
}
