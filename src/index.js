import express from "express";
import cors from "cors";
import multer from "multer";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";
import {
  analyzeResume,
  geminiModel,
  generateJobDescription,
} from "./services/gemini.js";
import { sendEmail } from "./services/email.js";
import { AI_Interview_links, PORT, SCORING_CRITERIA } from "./constants.js";
import MarkdownIt from "markdown-it";
import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";

const execAsync = promisify(exec);

// Get current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const md = new MarkdownIt();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    credentials: true,
    maxAge: 86400, // 24 hours
  })
);
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");

  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-credentials", true);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, UPDATE");
  next();
});

// Path to the JSON file that will act as our database
const DB_PATH = join(process.cwd(), "data", "requisitions.json");
const CANDIDATES_DB_PATH = join(process.cwd(), "data", "candidates.json");
const PR_REVIEWS_PATH = join(process.cwd(), "data", "pr-reviews.json");

const isFrontend = (role) => {
  return role.toLowerCase().includes("frontend");
};

// Add this helper function near the top with other helper functions
const isHR = (role) => {
  return role.toLowerCase().includes("hr");
};

// Ensure the data directory exists and initialize the JSON files
async function initializeDatabase() {
  console.log("Initializing database...");
  const dataDir = join(process.cwd(), "data");
  try {
    await fs.access(dataDir);
    console.log("Data directory exists");
  } catch {
    await fs.mkdir(dataDir);
    console.log("Created data directory");
  }

  try {
    await fs.access(DB_PATH);
    console.log("Requisitions DB exists");
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify([]));
    console.log("Created requisitions DB file");
  }

  try {
    await fs.access(CANDIDATES_DB_PATH);
    console.log("Candidates DB exists");
  } catch {
    await fs.writeFile(CANDIDATES_DB_PATH, JSON.stringify([]));
    console.log("Created candidates DB file");
  }
  console.log("Database initialization complete");
}

// Read all requisitions
async function readRequisitions() {
  console.log("Reading requisitions from DB");
  const data = await fs.readFile(DB_PATH, "utf8");
  return JSON.parse(data);
}

// Write requisitions to file
async function writeRequisitions(requisitions) {
  console.log("Writing requisitions to DB");
  await fs.writeFile(DB_PATH, JSON.stringify(requisitions, null, 2));
}

// Read all candidates
async function readCandidates() {
  console.log("Reading candidates from DB");
  const data = await fs.readFile(CANDIDATES_DB_PATH, "utf8");
  return JSON.parse(data);
}

// Write candidates to file
async function writeCandidates(candidates) {
  console.log("Writing candidates to DB");
  await fs.writeFile(CANDIDATES_DB_PATH, JSON.stringify(candidates, null, 2));
}

// Increase payload size limit for JSON and URL-encoded data
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = join(process.cwd(), "uploads");
    try {
      await fs.access(uploadDir);
      console.log("Upload directory exists");
    } catch {
      await fs.mkdir(uploadDir);
      console.log("Created upload directory");
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    console.log(`Handling uploaded file: ${file.originalname}`);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    console.log(`Checking file type: ${file.mimetype}`);
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/msword" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, and DOCX files are allowed"));
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

// Add error handling middleware for multer errors
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File size too large. Maximum size is 100MB.",
      });
    }
    return res.status(400).json({
      error: `Upload error: ${err.message}`,
    });
  }
  next(err);
});

// Routes
app.post("/api/create-jd", async (req, res) => {
  try {
    console.log("Received request to create JD:", req.body);
    const { role, yearsOfExperience } = req.body;

    if (!role || !yearsOfExperience) {
      console.log("Missing required fields");
      return res.status(400).json({
        error: "Both role and yearsOfExperience are required",
      });
    }

    const jobDescription = await generateJobDescription(
      role,
      yearsOfExperience
    );
    console.log("Generated job description successfully");
    res.json({ jobDescription });
  } catch (error) {
    console.error("Error generating job description:", error);
    res.status(500).json({
      error: "Failed to generate job description",
      details: error.message,
    });
  }
});

// New endpoint to create requisition
app.post("/api/create-requisition", async (req, res) => {
  try {
    console.log("Received request to create requisition:", req.body);
    const { role, yearsOfExperience, jobDescription } = req.body;

    if (!role || !yearsOfExperience || !jobDescription) {
      console.log("Missing required fields");
      return res.status(400).json({
        error: "Role, yearsOfExperience, and jobDescription are required",
      });
    }

    // Create new requisition object
    const newRequisition = {
      id: Date.now(), // Simple way to generate unique ID
      role,
      yearsOfExperience,
      jobDescription,
      createdAt: new Date().toISOString(),
      status: "OPEN",
    };

    // Read existing requisitions
    const requisitions = await readRequisitions();

    // Add new requisition
    requisitions.push(newRequisition);

    // Save to file
    await writeRequisitions(requisitions);

    // Format the job description using markdown-it
    const formattedJobDescription = md.render(jobDescription);

    // Send email notification with formatted Markdown
    const emailHtml = `
      <h1>New Job Requisition Created</h1>
      <p>A new job requisition has been created with the following details:</p>
      
      <h2>Role Details</h2>
      <p><strong>Position:</strong> ${role}</p>
      <p><strong>Years of Experience:</strong> ${yearsOfExperience}</p>
      
      <h2>Job Description</h2>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
        ${formattedJobDescription}
      </div>
      
      <p style="margin-top: 20px;">
        <a href="http://localhost:3000/requisitions" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          View Requisition
        </a>
      </p>
    `;

    await sendEmail({
      to: "tarun@stage.in",
      subject: `New Job Requisition: ${role}`,
      html: emailHtml,
      text: `New Job Requisition: ${role}\n\nPosition: ${role}\nYears of Experience: ${yearsOfExperience}\n\nJob Description:\n${jobDescription}`,
    });

    console.log("Requisition created and email sent successfully");
    res.json({
      success: true,
      message: "Requisition created successfully and notification sent",
      requisition: newRequisition,
    });
  } catch (error) {
    console.error("Error creating requisition:", error);
    res.status(500).json({
      error: "Failed to create requisition",
      details: error.message,
    });
  }
});

// Get all requisitions
app.get("/api/requisitions", async (req, res) => {
  try {
    console.log("Fetching all requisitions");
    const requisitions = await readRequisitions();
    res.json(requisitions);
  } catch (error) {
    console.error("Error fetching requisitions:", error);
    res.status(500).json({
      error: "Failed to fetch requisitions",
      details: error.message,
    });
  }
});

// Get unique job roles
app.get("/api/roles", async (req, res) => {
  try {
    console.log("Fetching unique roles");
    const requisitions = await readRequisitions();
    const uniqueRoles = [...new Set(requisitions.map((req) => req.role))];
    console.log("Found unique roles:", uniqueRoles);
    res.json(uniqueRoles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({
      error: "Failed to fetch roles",
      details: error.message,
    });
  }
});

app.post("/api/upload-resume", upload.single("resume"), async (req, res) => {
  try {
    console.log("Processing resume upload");
    if (!req.file) {
      console.log("No file uploaded");
      return res.status(400).json({ error: "No file uploaded" });
    }

    const jobDescription = req.body.jobDescription;
    if (!jobDescription) {
      console.log("Missing job description");
      return res.status(400).json({ error: "Job description is required" });
    }

    // Read the uploaded file
    const fileContent = await fs.readFile(req.file.path, "utf-8");

    // Analyze resume using Gemini
    console.log("Analyzing resume with Gemini");
    const { score, analysis } = await analyzeResume(
      fileContent,
      jobDescription
    );

    // Send email notification if email is provided
    if (req.body.email) {
      console.log("Sending analysis email to:", req.body.email);
      const emailHtml = `
        <h2>Resume Analysis Results</h2>
        <p>Your resume has been analyzed against the job description.</p>
        <p><strong>Compatibility Score:</strong> ${score}%</p>
        <h3>Analysis:</h3>
        <p>${analysis}</p>
      `;

      await sendEmail({
        to: req.body.email,
        subject: "Your Resume Analysis Results",
        html: emailHtml,
      });
    }

    console.log("Resume analysis complete");
    res.json({
      message: "Resume uploaded and analyzed successfully",
      fileName: req.file.originalname,
      score,
      analysis,
    });
  } catch (error) {
    console.error("Error processing resume:", error);
    res.status(500).json({
      error: "Failed to process resume",
      details: error.message,
    });
  }
});

// Handle candidate application
app.post("/api/apply", upload.single("resume"), async (req, res) => {
  try {
    console.log("Processing candidate application");
    const { name, email, phone, coverLetter, role } = req.body;
    const resumeFile = req.file;

    if (!resumeFile) {
      console.log("Missing resume file");
      return res.status(400).json({ error: "Resume file is required" });
    }

    // Read the uploaded resume file
    const resumeContent = await fs.readFile(resumeFile.path, "utf-8");

    // Get the job description for the selected role
    const requisitions = await readRequisitions();
    const jobRequisition = requisitions.find((req) => req.role === role);

    if (!jobRequisition) {
      console.log("Role not found:", role);
      return res.status(400).json({ error: "Selected role not found" });
    }

    // Analyze resume with job description and cover letter
    const prompt = coverLetter
      ? `Job Description: ${jobRequisition.jobDescription}\n\nCover Letter: ${coverLetter}`
      : jobRequisition.jobDescription;

    console.log("Analyzing portfolio for role:", role);
    const result = await analyzeResume(resumeContent, prompt);
    const score = result.score;
    const analysis = result.analysis;

    // Determine status based on score
    let status;
    let emailTemplate;
    let emailSubject;

    if (true || score >= SCORING_CRITERIA.SHORTLISTED.minScore) {
      status = SCORING_CRITERIA.SHORTLISTED.status;
      emailTemplate = SCORING_CRITERIA.SHORTLISTED.emailTemplate;
      emailSubject = SCORING_CRITERIA.SHORTLISTED.emailSubject;
    } else if (score >= SCORING_CRITERIA.HOLD.minScore) {
      status = SCORING_CRITERIA.HOLD.status;
      emailTemplate = SCORING_CRITERIA.HOLD.emailTemplate;
      emailSubject = SCORING_CRITERIA.HOLD.emailSubject;
    } else {
      status = SCORING_CRITERIA.REJECTED.status;
      emailTemplate = SCORING_CRITERIA.REJECTED.emailTemplate;
      emailSubject = SCORING_CRITERIA.REJECTED.emailSubject;
    }

    console.log("Application status determined:", status);

    // Create new candidate object with analysis results
    const newCandidate = {
      id: Date.now(),
      name,
      email,
      phone,
      coverLetter: coverLetter || "",
      role,
      resumeFileName: resumeFile.filename,
      appliedAt: new Date().toISOString(),
      status,
      analysis: {
        score,
        details: analysis,
        jobDescription: jobRequisition.jobDescription,
      },
    };

    // Read existing candidates
    const candidates = await readCandidates();

    // Add new candidate
    candidates.push(newCandidate);

    // Save to file
    await writeCandidates(candidates);

    // Send status email to candidate
    console.log("Sending status email to candidate");
    if (status === SCORING_CRITERIA.SHORTLISTED.status) {
      const ASSIGNMENT_PATH = path.join(
        process.cwd(),
        "assignments",
        isFrontend(role) ? "frontend.pdf" : isHR(role) ? "hr.pdf" : "design.pdf"
      );
      // For shortlisted candidates, send assignment
      await sendEmail({
        to: email,
        subject: `${emailSubject} - ${role}`,
        html: emailTemplate(role, name),
        attachments: [
          {
            filename: isFrontend(role)
              ? "frontend.pdf"
              : isHR(role)
              ? "hr.pdf"
              : "design.pdf",
            path: ASSIGNMENT_PATH,
          },
        ],
      });
    } else {
      // For other statuses, send regular status email
      await sendEmail({
        to: email,
        subject: `${emailSubject} - ${role}`,
        html: emailTemplate(role),
      });
    }

    // Send analysis results email
    console.log("Application process completed successfully");
    res.json({
      success: true,
      message: "Application submitted successfully",
      candidate: newCandidate,
    });
  } catch (error) {
    console.error("Error submitting application:", error);
    res.status(500).json({
      error: "Failed to submit application",
      details: error.message,
    });
  }
});

// Add these functions after other database functions
function initializePrReviewsDatabase() {
  try {
    if (!existsSync(PR_REVIEWS_PATH)) {
      writeFileSync(PR_REVIEWS_PATH, JSON.stringify({ reviews: [] }, null, 2));
      console.log("PR reviews database initialized");
    }
  } catch (error) {
    console.error("Error initializing PR reviews database:", error);
  }
}

function readPrReviews() {
  try {
    const data = readFileSync(PR_REVIEWS_PATH, "utf-8");
    return JSON.parse(data).reviews;
  } catch (error) {
    console.error("Error reading PR reviews:", error);
    return [];
  }
}

function writePrReviews(reviews) {
  try {
    writeFileSync(PR_REVIEWS_PATH, JSON.stringify({ reviews }, null, 2));
  } catch (error) {
    console.error("Error writing PR reviews:", error);
  }
}

// Add this helper function
function getDeadlineDate() {
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 2);
  return deadline.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Function to validate and extract GitHub URL
function getRepoUrlFromGithubUrl(githubUrl) {
  // Simply append .git if not present
  if (!githubUrl.endsWith(".git")) {
    return `${githubUrl}.git`;
  }
  return githubUrl;
}

// Function to clone repository
async function cloneRepository(repoUrl) {
  const repoName = repoUrl.split("/").pop().replace(".git", "");
  const cloneDir = path.join(process.cwd(), "repos", repoName);

  // Create repos directory if it doesn't exist
  if (!existsSync(path.join(process.cwd(), "repos"))) {
    await fs.mkdir(path.join(process.cwd(), "repos"));
  }

  // Remove existing directory if it exists
  if (existsSync(cloneDir)) {
    await fs.rm(cloneDir, { recursive: true, force: true });
  }

  // Clone the repository
  await execAsync(`git clone ${repoUrl} ${cloneDir}`);
  return cloneDir;
}

// Function to concatenate project files
async function concatenateProjectFiles(projectDir) {
  let outputContent = "";

  async function processDirectory(directoryPath) {
    const filesAndDirs = await fs.readdir(directoryPath);

    for (const item of filesAndDirs) {
      const itemPath = path.join(directoryPath, item);
      const stats = await fs.stat(itemPath);

      // Skip node_modules, .git, and other common directories
      if (stats.isDirectory()) {
        if (
          ["node_modules", ".git", ".vscode", "dist", "build"].includes(item)
        ) {
          continue;
        }
        await processDirectory(itemPath);
      } else {
        // Skip common files
        if ([".DS_Store", "package-lock.json", "yarn.lock"].includes(item)) {
          continue;
        }

        try {
          const fileContent = await fs.readFile(itemPath, "utf8");
          const relativePath = path.relative(projectDir, itemPath);
          outputContent += `--- START FILE: ${relativePath} ---\n`;
          outputContent += `\`\`\`${
            path.extname(relativePath).substring(1) || "plaintext"
          }\n`;
          outputContent += fileContent;
          outputContent += `\n\`\`\`\n`;
          outputContent += `--- END FILE: ${relativePath} ---\n\n`;
        } catch (error) {
          console.error(`Error reading file ${itemPath}:`, error);
        }
      }
    }
  }

  await processDirectory(projectDir);
  return outputContent;
}

// Update the analyzeGithubRepo function to handle HR roles
async function analyzeGithubRepo(githubUrl, previewUrl, assignmentPath, role) {
  try {
    const assignmentContent = await fs.readFile(assignmentPath, "utf8");

    // Clone and process the repository
    const repoName = githubUrl.split("/").pop().replace(".git", "");
    const cloneDir = path.join(process.cwd(), "repos", repoName);

    // Create repos directory if it doesn't exist
    if (!fs.existsSync(path.join(process.cwd(), "repos"))) {
      await fs.mkdir(path.join(process.cwd(), "repos"));
    }

    // Remove existing directory if it exists
    if (fs.existsSync(cloneDir)) {
      await fs.rm(cloneDir, { recursive: true, force: true });
    }

    // Clone the repository
    console.log("Cloning repository...");
    await execAsync(`git clone "${githubUrl}" "${cloneDir}"`);

    // Process repository files
    let projectCode = "";
    const ignoreDirs = ["node_modules", ".git", "dist", "build", ".next"];
    const ignoreFiles = [".DS_Store", "package-lock.json", "yarn.lock"];

    async function processDirectory(directoryPath) {
      const filesAndDirs = await fs.readdir(directoryPath);

      for (const item of filesAndDirs) {
        const itemPath = path.join(directoryPath, item);
        const stats = await fs.stat(itemPath);

        if (stats.isDirectory()) {
          if (ignoreDirs.includes(item)) {
            console.log(`Skipping directory: ${item}`);
            continue;
          }
          await processDirectory(itemPath);
        } else {
          if (ignoreFiles.includes(item)) {
            console.log(`Skipping file: ${item}`);
            continue;
          }

          try {
            const content = await fs.readFile(itemPath, "utf8");
            const relativePath = path.relative(cloneDir, itemPath);
            projectCode += `\n=== FILE: ${relativePath} ===\n`;
            projectCode += content;
            projectCode += `\n=== END FILE: ${relativePath} ===\n\n`;
          } catch (error) {
            console.error(`Error reading file ${itemPath}:`, error);
          }
        }
      }
    }

    // Process all files
    console.log("Processing repository files...");
    await processDirectory(cloneDir);

    // Clean up
    console.log("Cleaning up...");
    await fs.rm(cloneDir, { recursive: true, force: true });

    // Customize prompt based on role
    let roleSpecificPrompt = "";
    if (isHR(role)) {
      roleSpecificPrompt = `
Please focus on:
1. HR Process Implementation:
   - Review HR workflow implementation
   - Check recruitment process automation
   - Evaluate candidate management features
   - Assess employee onboarding flows

2. Data Management:
   - Review data organization and structure
   - Check data validation and security
   - Evaluate database schema design
   - Assess data privacy compliance

3. User Experience:
   - Evaluate HR portal usability
   - Check form designs and validations
   - Assess workflow efficiency
   - Review accessibility features

4. Technical Implementation:
   - Review API integrations
   - Check state management
   - Evaluate error handling
   - Assess code maintainability`;
    } else {
      roleSpecificPrompt = `
Please focus on:
1. Code Analysis:
   - Review the code line by line
   - Check code quality, best practices, and patterns
   - Evaluate error handling and edge cases
   - Assess component structure and organization

2. UI/UX Analysis:
   - Visit the preview URL and test the implementation
   - Evaluate visual design and user experience
   - Check responsiveness and cross-browser compatibility
   - Assess accessibility implementation

3. Feature Implementation:
   - Verify all required features are implemented
   - Check feature completeness and functionality
   - Evaluate code reusability and maintainability
   - Assess performance considerations

4. Technical Assessment:
   - Review technical decisions and architecture
   - Evaluate state management approach
   - Check API integration and data handling
   - Assess testing coverage`;
    }

    const prompt = `You are an expert code reviewer. Please analyze this ${role} assignment submission:

Repository URL: ${githubUrl}
Preview URL: ${previewUrl}

Project Code:
${projectCode}

Assignment Requirements:
${assignmentContent}
${roleSpecificPrompt}

Provide a detailed analysis with:
1. A score out of 100 (40% code quality, 30% feature implementation, 20% UI/UX, 10% technical architecture)
2. A breakdown of strengths and weaknesses
3. Specific code examples with suggestions
4. UI/UX observations and recommendations
5. Feature completion status
6. Technical recommendations

Format your response as:
SCORE: [number]
ANALYSIS: [detailed analysis]`;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract score and analysis
    const scoreMatch = text.match(/SCORE:\s*(\d+)/);
    const analysisMatch = text.match(/ANALYSIS:([\s\S]*)/);

    const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
    const analysis = analysisMatch ? analysisMatch[1].trim() : text;

    return { score, analysis };
  } catch (error) {
    console.error("Error analyzing repository:", error);
    throw new Error("Failed to analyze repository");
  }
}

async function analyzeHRAssignment(assignmentFile, assignmentPath) {
  try {
    const assignmentContent = await fs.readFile(assignmentPath, "utf8");
    const portfolioContent = await fs.readFile(assignmentFile.path, "utf8");

    const prompt = `You are an expert design reviewer. Please analyze this design assignment submission:

Assignment req:
${portfolioContent}

Assignment responese:
${assignmentContent}

Please focus on:
1. HR Process Implementation:
   - Review HR workflow implementation
   - Check recruitment process automation
   - Evaluate candidate management features
   - Assess employee onboarding flows

2. Data Management:
   - Review data organization and structure
   - Check data validation and security
   - Evaluate database schema design
   - Assess data privacy compliance

3. User Experience:
   - Evaluate HR portal usability
   - Check form designs and validations
   - Assess workflow efficiency
   - Review accessibility features

4. Technical Implementation:
   - Review API integrations
   - Check state management
   - Evaluate error handling
   - Assess code maintainability

Format your response as:
SCORE: [number]
ANALYSIS: [detailed analysis]`;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract score and analysis
    const scoreMatch = text.match(/SCORE:\s*(\d+)/);
    const analysisMatch = text.match(/ANALYSIS:([\s\S]*)/);

    const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
    const analysis = analysisMatch ? analysisMatch[1].trim() : text;

    return { score, analysis };
  } catch (error) {
    console.error("Error analyzing design portfolio:", error);
    throw new Error("Failed to analyze design portfolio");
  }
}

// Function to analyze design portfolio with Gemini
async function analyzeDesignPortfolio(portfolioFile, assignmentPath) {
  try {
    const assignmentContent = await fs.readFile(assignmentPath, "utf8");
    const portfolioContent = await fs.readFile(portfolioFile.path, "utf8");

    const prompt = `You are an expert design reviewer. Please analyze this design assignment submission:

Portfolio Content:
${portfolioContent}

Assignment Requirements:
${assignmentContent}

Please follow these steps in your analysis:

1. Design Analysis:
   - Review the design principles applied
   - Evaluate visual hierarchy and composition
   - Check typography and color usage
   - Assess consistency and branding

2. UX Analysis:
   - Evaluate user flow and interaction design
   - Check information architecture
   - Assess accessibility considerations
   - Review responsive design approach

3. Implementation Quality:
   - Evaluate design execution
   - Check attention to detail
   - Assess technical implementation
   - Review file organization

4. Overall Assessment:
   - Compare with assignment requirements
   - Evaluate creativity and innovation
   - Check presentation quality
   - Assess professional standards

Provide a detailed analysis with:
1. A score out of 100 (40% design quality, 30% UX implementation, 20% technical execution, 10% presentation)
2. A breakdown of strengths and weaknesses
3. Specific design examples with suggestions
4. UX observations and recommendations
5. Implementation quality assessment
6. Overall recommendations

Format your response as:
SCORE: [number]
ANALYSIS: [detailed analysis]`;

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract score and analysis
    const scoreMatch = text.match(/SCORE:\s*(\d+)/);
    const analysisMatch = text.match(/ANALYSIS:([\s\S]*)/);

    const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
    const analysis = analysisMatch ? analysisMatch[1].trim() : text;

    return { score, analysis };
  } catch (error) {
    console.error("Error analyzing design portfolio:", error);
    throw new Error("Failed to analyze design portfolio");
  }
}

// Update the PR review endpoint to handle HR roles
app.post("/api/pr-review", upload.single("portfolio"), async (req, res) => {
  try {
    const { name, email, role, githubUrl, previewUrl } = req.body;
    const isFrontendRole = role.toLowerCase().includes("frontend");
    const isHRRole = isHR(role);

    // Validate required fields
    if (!name || !email || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Role-specific validation
    if (isFrontendRole) {
      if (!githubUrl || !previewUrl) {
        return res.status(400).json({
          error: "GitHub URL and preview URL are required for frontend roles",
        });
      }
    } else {
      if (!req.file) {
        return res.status(400).json({
          error: "Portfolio file is required for non-frontend roles",
        });
      }
    }

    // Get the appropriate assignment file path
    let assignmentPath;
    if (isFrontendRole) {
      assignmentPath = path.join("assignments", "frontend.pdf");
    } else if (isHRRole) {
      assignmentPath = path.join("assignments", "hr.pdf");
    } else {
      assignmentPath = path.join("assignments", "design.pdf");
    }

    // Analyze submission based on role
    let analysis;
    if (isFrontendRole) {
      analysis = await analyzeGithubRepo(
        githubUrl,
        previewUrl,
        assignmentPath,
        role
      );
    } else if (isHRRole) {
      analysis = await analyzeHRAssignment(req.file, assignmentPath);
    } else {
      analysis = await analyzeDesignPortfolio(req.file, assignmentPath);
    }

    // Determine status based on score
    let status;
    if (analysis.score >= 50) {
      status = "SHORTLISTED";
    } else if (analysis.score >= 20) {
      status = "HOLD";
    } else {
      status = "REJECTED";
    }

    // Send AI interview scheduling email for shortlisted candidates
    if (true || status === "SHORTLISTED") {
      const interviewLink =
        AI_Interview_links[
          isFrontendRole ? "frontend" : isHRRole ? "hr" : "pm"
        ];

      await sendEmail({
        to: email,
        subject: "Schedule Your Round 1 Interview - Stage",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb; margin-bottom: 20px;">Schedule Your Round 1 Interview</h1>
            
            <p style="font-size: 16px; line-height: 1.6;">Dear ${name},</p>
            
            <p style="font-size: 16px; line-height: 1.6;">Congratulations on being shortlisted! The next step is to complete your Round 1 AI Interview.</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #1e40af; margin-top: 0;">Interview Details</h2>
              
              <p style="font-size: 16px; line-height: 1.6;">Please click the link below to start your AI interview:</p>
              
              <p style="text-align: center;">
                <a href="${interviewLink}" 
                   style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Start Interview
                </a>
              </p>
              
              <p style="font-size: 16px; line-height: 1.6;">Important notes:</p>
              <ul style="font-size: 16px; line-height: 1.6;">
                <li>The interview will take approximately 30-45 minutes</li>
                <li>Ensure you have a stable internet connection</li>
                <li>Find a quiet place without distractions</li>
                <li>Have your camera and microphone ready</li>
              </ul>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6;">Best regards,<br>
            <strong>Stage Hiring Team</strong></p>
          </div>
        `,
      });
    }

    // Create review object
    const review = {
      name,
      email,
      role,
      status,
      score: analysis.score,
      analysis: analysis.analysis,
      submittedAt: new Date(),
      ...(isFrontendRole
        ? {
            githubUrl,
            previewUrl,
          }
        : {
            portfolioFile: req.file.filename,
          }),
    };

    // Store in MongoDB

    // Send email notifications
    const emailData = {
      name,
      email,
      role,
      status,
      score: analysis.score,
      analysis: analysis.analysis,
      ...(isFrontendRole
        ? {
            githubUrl,
            previewUrl,
          }
        : {
            portfolioFile: req.file.filename,
          }),
    };

    // Send to admin

    res.json({ review });
  } catch (error) {
    console.error("Error processing submission:", error);
    res.status(500).json({ error: "Failed to process submission" });
  }
});

// Initialize database and start server
async function startServer() {
  console.log("Starting server initialization...");
  await initializeDatabase();
  initializePrReviewsDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
