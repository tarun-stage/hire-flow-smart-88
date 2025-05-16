import { GoogleGenerativeAI } from "@google/generative-ai";
import { GOOGLE_API_KEY } from "../constants.js";

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});
export const generateJobDescription = async (role, yearsOfExperience) => {
  const prompt = `
    Generate a detailed job description for a ${role} position requiring ${yearsOfExperience} years of experience.
    Include:
    1. Job title and overview
    2. Key responsibilities
    3. Required skills and qualifications
    4. Preferred qualifications
    5. Education requirements
    6. Any additional requirements or benefits
    
    Format the response in a clear, professional manner suitable for a job posting.

    About the company:
    Started in 2019, STAGE is an entertainment platform for regional cultures known for producing premium quality content in Indian languages to reinforce, protect and validate people’s sense of identity for their culture and heritage.
    We currently focus on Haryanvi, Rajasthani and Bhojpuri languages. Our mobile apps have 15 Mn+ downloads and 4 Mn+ paying customers globally. That makes STAGE the biggest media platform in these regions.
    In 2023, STAGE was also featured on Shark Tank India S2. Watch our story here.


    Donot write anything else except the job description. Dont write anyything in [] like open things. I will directly use this text in a job posting.
  `;

  const result = await geminiModel.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

export const analyzeResume = async (resumeContent, jobDescription) => {
  const prompt = `
    Evaluate the following resume against the provided Job Description. For each parameter below, assess its relevance and strength in relation to the JD. Provide a brief pointer analysis explaining why the score for each parameter is increased or decreased. Assign a score from 1 to 5 (where 1 is poor/irrelevant and 5 is excellent/highly relevant) for each parameter. Finally, calculate a total weighted score out of the maximum possible points and provide an overall evaluation summary, highlighting the resume's key strengths and areas for improvement based on its alignment with the Job Description."
Evaluation Parameters (with emphasis on JD relevance):
Contact Information (Maximum Score: 5):
Completeness, professionalism, and clarity.
Pointer Analysis: Briefly note any issues or if information is clearly presented.
Summary/Objective (Maximum Score: 10):
Relevance to JD: How well does it tailor the candidate's profile to the specific requirements and keywords of the Job Description?
Clarity, conciseness, and impact.
Pointer Analysis: Highlight specific phrases or skills mentioned that align with the JD or note the absence of such alignment.
Work Experience (Maximum Score: 30):
Relevance to JD: How directly do the responsibilities and achievements in previous roles align with the requirements and preferred experience outlined in the Job Description?
Use of action verbs and quantifiable achievements.
Progression and growth.
Pointer Analysis: Point out 1-2 key achievements or responsibilities that are highly relevant to the JD and explain why. Conversely, note any significant disconnects.
Education (Maximum Score: 10):
Relevance to JD: How closely do the degrees, certifications, and coursework match the educational requirements and preferences stated in the Job Description?
Institution quality (if relevant).
Pointer Analysis: Mention if the required degree or a highly relevant field of study is present. Note if any preferred certifications are listed.
Skills (Maximum Score: 25):
Relevance to JD: How many of the key technical and soft skills mentioned in the Job Description are explicitly listed or demonstrated through experience in the resume?
Clarity and categorization of skills.
Pointer Analysis: List 1-2 crucial skills from the JD that are clearly present and/or mention the absence of key required skills.
Interpersonal Skills (Maximum Score: 5):
Evidence of teamwork, communication, problem-solving, leadership, or other relevant soft skills, ideally demonstrated through examples in the work experience or summary.
Pointer Analysis: Point to any examples or keywords suggesting strong interpersonal skills or note their absence.
Formatting and Presentation (Maximum Score: 5):
Cleanliness, professionalism, and ATS-friendliness.
Pointer Analysis: Briefly note any significant formatting issues or strengths.
Work History Stability (Maximum Score: 10):
Absence of frequent job switches (pattern of changing jobs every 2 years or less without clear progression).
Job:Years Ratio (not exceeding 0.65).
Pointer Analysis: Note if there's a pattern of frequent switching or if the job:years ratio is high.
Maximum Total Weighted Score: 100
    
    Job Description:
    ${jobDescription}
    
    Resume:
    ${resumeContent}
  `;

  const result = await geminiModel.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // Extract score from the response
  const scoreMatch = text.match(/Score:\s*(\d+)/);
  const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;

  return {
    score,
    analysis: text,
  };
};
