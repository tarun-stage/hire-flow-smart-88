import express from "express";
import cors from "cors";
import multer from "multer";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs/promises";
import { analyzeResume, generateJobDescription } from "./services/gemini.js";
import { sendEmail } from "./services/email.js";
import { PORT, SCORING_CRITERIA } from "./constants.js";
import MarkdownIt from "markdown-it";
import { existsSync, readFileSync, writeFileSync } from "fs";

const app = express();
const md = new MarkdownIt();

// Path to the JSON file that will act as our database
const DB_PATH = join(process.cwd(), "data", "requisitions.json");
const CANDIDATES_DB_PATH = join(process.cwd(), "data", "candidates.json");
const ASSIGNMENT_PATH = join(process.cwd(), "assignment", "frontend.pdf");
const PR_REVIEWS_PATH = join(process.cwd(), "data", "pr-reviews.json");

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

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const resumeDir = join(process.cwd(), "resume");
    try {
      await fs.access(resumeDir);
      console.log("Resume directory exists");
    } catch {
      await fs.mkdir(resumeDir);
      console.log("Created resume directory");
    }
    cb(null, resumeDir);
  },
  filename: (req, file, cb) => {
    console.log(`Handling uploaded file: ${file.originalname}`);
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    console.log(`Checking file type: ${file.mimetype}`);
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

// Middleware
app.use(cors());
app.use(express.json());

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

    console.log("Analyzing resume for role:", role);
    const { score, analysis } = await analyzeResume(resumeContent, prompt);

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
      // For shortlisted candidates, send assignment
      await sendEmail({
        to: email,
        subject: `${emailSubject} - ${role}`,
        html: emailTemplate(role, name),
        attachments: [
          {
            filename: "frontend.pdf",
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

// Add this function after other functions
async function analyzePR(prUrl, assignmentPath) {
  try {
    // Read the assignment PDF
    const assignmentContent = await fs.readFile(assignmentPath, "utf-8");

    // Create a prompt for Gemini to analyze the PR
    const prompt = `
      Please analyze this GitHub PR: ${prUrl}
      against the following assignment requirements:
      
      ${assignmentContent}
      
      Provide:
      1. A score out of 100
      2. Detailed analysis of the implementation
      3. Areas of improvement
      4. Code quality assessment
    `;

    // Call Gemini for analysis
    const { score, analysis } = await analyzeResume(prompt, assignmentContent);

    return { score, analysis };
  } catch (error) {
    console.error("Error analyzing PR:", error);
    throw error;
  }
}

// Update the PR review endpoint
app.post("/api/pr-review", async (req, res) => {
  try {
    const { name, email, prUrl, comments } = req.body;

    // Validate input
    if (!name || !email || !prUrl) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate PR URL format
    if (!prUrl.match(/^https:\/\/github\.com\/[\w-]+\/[\w-]+\/pull\/\d+$/)) {
      return res.status(400).json({ error: "Invalid PR URL format" });
    }

    // Analyze PR using Gemini
    console.log("Analyzing PR submission...");
    const { score, analysis } = await analyzePR(prUrl, ASSIGNMENT_PATH);
    console.log("PR analysis complete. Score:", score);

    // Determine status based on score
    let status;
    let emailTemplate;
    let emailSubject;

    if (score >= SCORING_CRITERIA.SHORTLISTED.minScore) {
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

    // Create new PR review
    const newReview = {
      id: Date.now().toString(),
      name,
      email,
      prUrl,
      comments: comments || "",
      status,
      submittedAt: new Date().toISOString(),
      analysis: {
        score,
        details: analysis,
      },
    };

    // Save to PR reviews database
    const reviews = readPrReviews();
    reviews.push(newReview);
    writePrReviews(reviews);

    // Find or create candidate record
    const candidates = await readCandidates();
    const existingCandidate = candidates.find((c) => c.email === email);

    if (existingCandidate) {
      // Update existing candidate
      existingCandidate.prSubmission = {
        url: prUrl,
        submittedAt: new Date().toISOString(),
        status,
        analysis: {
          score,
          details: analysis,
        },
      };
    } else {
      // Create new candidate
      candidates.push({
        id: Date.now(),
        name,
        email,
        appliedAt: new Date().toISOString(),
        status,
        prSubmission: {
          url: prUrl,
          submittedAt: new Date().toISOString(),
          status,
          analysis: {
            score,
            details: analysis,
          },
        },
      });
    }

    // Save updated candidates
    await writeCandidates(candidates);

    // Send email notification to admin
    await sendEmail({
      to: "tarun@stage.in",
      subject: "New PR Review Submission",
      html: `
        <h2>New PR Review Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>PR URL:</strong> <a href="${prUrl}">${prUrl}</a></p>
        <p><strong>Score:</strong> ${score}%</p>
        <p><strong>Status:</strong> ${status}</p>
        <h3>Analysis:</h3>
        <p>${analysis}</p>
        ${comments ? `<p><strong>Comments:</strong> ${comments}</p>` : ""}
        <p><strong>Submitted At:</strong> ${new Date().toLocaleString()}</p>
      `,
    });

    // Send confirmation email to candidate
    await sendEmail({
      to: email,
      subject: "PR Review Submission Received",
      html: `
        <h2>Thank You for Your Submission</h2>
        <p>Dear ${name},</p>
        <p>We have received your PR review submission. Our team will review your code and get back to you soon.</p>
        <p>Your PR URL: <a href="${prUrl}">${prUrl}</a></p>
        <p><strong>Initial Analysis Score:</strong> ${score}%</p>
        <h3>Analysis Summary:</h3>
        <p>${analysis}</p>
        ${comments ? `<p>Your comments: ${comments}</p>` : ""}
        <p>Best regards,<br>The Stage Team</p>
      `,
    });

    res.json({
      success: true,
      review: newReview,
      analysis: {
        score,
        details: analysis,
      },
    });
  } catch (error) {
    console.error("Error processing PR review:", error);
    res.status(500).json({ error: "Failed to process PR review" });
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
