# Resume Analyzer Backend

This is the backend service for the resume analysis application. It handles file uploads and uses Google's Gemini AI to analyze resumes against job descriptions.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:

```
PORT=3001
GOOGLE_API_KEY=your_gemini_api_key_here
```

3. Start the development server:

```bash
npm run dev
```

## API Endpoints

### POST /api/upload-resume

Uploads a resume and analyzes it against a job description.

**Request:**

- Method: POST
- Content-Type: multipart/form-data
- Body:
  - resume: PDF file
  - jobDescription: string

**Response:**

```json
{
  "message": "Resume uploaded and analyzed successfully",
  "fileName": "resume.pdf",
  "score": 85,
  "analysis": "Detailed analysis text..."
}
```

## Features

- PDF file upload handling
- Resume storage in /resume directory
- Integration with Google's Gemini AI
- CORS enabled for frontend integration
- Error handling and validation
