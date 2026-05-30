# Reviewr - AI-Powered Code Review Platform

Reviewr is a full-stack code review platform that automates code analysis, highlights bugs/security issues, and suggests fixes.

## Phase 1: Core AI Review Workflow

In Phase 1, we built the core engine of Reviewr:
1. **Frontend**: A modern Next.js interface with dark mode, glassmorphism, and animations where you can paste code or a unified diff.
2. **Backend**: A FastAPI server that processes the submission, calls the Claude/OpenAI LLM, and structures the suggestions.
3. **Display**: Shows the code/diff inline with warning, info, and critical review comments color-coded by severity.

### Features Implemented
- [x] FastAPI Backend with `/api/review` endpoint.
- [x] Pydantic schemas for request/response validation.
- [x] OpenAI client integration for LLM Chat Completions.
- [x] Local Mock Fallback support for offline testing.
- [x] Next.js App Router frontend with Tailwind CSS 4.
- [x] Code input interface with sample templates (Python, JS, Diff).
- [x] Premium loading screens with micro-animations.
- [x] Inline review result cards with dynamic severity colors.

## Project Structure

- `backend/`: FastAPI application containing the API endpoints and core AI service.
- `frontend/`: Next.js web client.

## Getting Started

1. Set up the backend:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

2. Set up the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
