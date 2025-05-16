import { Resend } from "resend";
import { RESEND_API_KEY } from "../constants.js";
import fs from "fs/promises";

const resend = new Resend(RESEND_API_KEY);

export const sendEmail = async ({ to, subject, html, attachments }) => {
  try {
    const emailData = {
      from: "Resume Analyzer <onboarding@resend.dev>",
      to,
      subject,
      html,
    };

    // Only add attachments if they exist
    if (attachments && attachments.length > 0) {
      const formattedAttachments = await Promise.all(
        attachments.map(async (attachment) => ({
          filename: attachment.filename,
          content: await fs.readFile(attachment.path), // Read file as Buffer
        }))
      );
      console.log("Formatted attachments:", formattedAttachments);
      emailData.attachments = formattedAttachments;
    }

    const data = await resend.emails.send(emailData);
    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};
