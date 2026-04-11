# Reviewr - AI-Powered Code Review Platform

Reviewr is a full-stack code review platform that automates code analysis, highlights bugs/security issues, and suggests fixes.

## Phase 1: Core AI Review Workflow

In Phase 1, we build the core engine of Reviewr:
1. **Frontend**: Paste code or a unified diff into a clean interface.
2. **Backend**: A FastAPI server that processes the submission, calls an LLM, and structures the suggestions.
3. **Display**: Show the code/diff inline with warning, info, and critical review comments.

## Project Structure

- `backend/`: FastAPI application containing the API endpoints and core AI service.
- `frontend/`: Next.js web client.
