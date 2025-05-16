export const GOOGLE_API_KEY = "AIzaSyCDayCijNIZeYMqXs25DvfBgQuVnfTRdN0";
export const RESEND_API_KEY = "re_Bo381DYw_MQxvDW4rniPfjbj2EeodEkmR";
export const PORT = process.env.PORT || 3001;

// Helper function to get deadline date (3 days from now)
const getDeadlineDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const SCORING_CRITERIA = {
  SHORTLISTED: {
    minScore: 40,
    status: "SHORTLISTED",
    emailSubject: "Next Round: Technical Assignment",
    emailTemplate: (role, name) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb; margin-bottom: 20px;">Next Round: Technical Assignment</h1>
        
        <p style="font-size: 16px; line-height: 1.6;">Dear ${name},</p>
        
        <p style="font-size: 16px; line-height: 1.6;">Thank you for your interest in the <strong>${role}</strong> position. We would like to proceed with your application to the next round of our selection process.</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #1e40af; margin-top: 0;">Technical Assignment Details</h2>
          
          <p style="font-size: 16px; line-height: 1.6;">Please find attached a technical assignment that will help us evaluate your skills. Important details:</p>
          
          <ul style="font-size: 16px; line-height: 1.6;">
            <li>Assignment is attached to this email</li>
            <li>Submission deadline: <strong>${getDeadlineDate()}</strong></li>
            <li>Please review all requirements thoroughly</li>
            <li>Questions can be asked in this email thread</li>
          </ul>
        </div>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #0369a1; margin-top: 0;">About Stage</h2>
          
          <p style="font-size: 16px; line-height: 1.6;">Learn more about our company:</p>
          
          <ul style="font-size: 16px; line-height: 1.6;">
            <li>Website: <a href="https://stage.in" style="color: #2563eb; text-decoration: none;">stage.in</a></li>
            <li>Shark Tank: <a href="https://www.youtube.com/watch?v=KlzQBavpUNU" style="color: #2563eb; text-decoration: none;">Watch our episode</a></li>
          </ul>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6;">We look forward to reviewing your submission. For any queries regarding the assignment, please respond to this email.</p>
        
        <p style="font-size: 16px; line-height: 1.6;">Best regards,<br>
        <strong>Stage Hiring Team</strong></p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
          <p>Note: This is an automated email. Please do not reply directly to this message.</p>
        </div>
      </div>
    `,
  },
  HOLD: {
    minScore: 20,
    maxScore: 40,
    status: "ON_HOLD",
    emailSubject: "Application Under Review",
    emailTemplate: (role) => `
      <h1>Application Under Review</h1>
      <p>Thank you for applying for the ${role} position.</p>
      <p>Your application is currently under review. We will keep you updated on the status of your application.</p>
      <p>Best regards,<br>The Hiring Team</p>
    `,
  },
  REJECTED: {
    maxScore: 19,
    status: "REJECTED",
    emailSubject: "Application Status Update",
    emailTemplate: (role) => `
      <h1>Application Status Update</h1>
      <p>Thank you for your interest in the ${role} position.</p>
      <p>After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.</p>
      <p>We encourage you to apply for other positions that match your skills and experience.</p>
      <p>Best regards,<br>The Hiring Team</p>
    `,
  },
};

export const AI_Interview_links = {
  design:
    "https://screener.hyring.com/jobseeker/ai-interview/preview?interviewId=e038ce98-5bd6-4496-bbdc-7a3d164304be",
  frontend:
    "https://screener.hyring.com/jobseeker/ai-interview/preview?interviewId=7cdd7a6d-c26c-4cf1-a8e1-5b717c489571",
};
