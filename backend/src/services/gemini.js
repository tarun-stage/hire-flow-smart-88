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
    Analyze this resume against the following job description and provide a compatibility score from 0-100.
    Also provide a brief explanation of the score.
    
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
