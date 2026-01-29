# BCYI x YorkU AI Assistant - Backend

Python FastAPI backend for the BCYI x YorkU AI Assistant, providing content generation capabilities with Google Drive integration.

## Features

- Google Drive integration for file management and auto-sorting
- AI-powered content generation using Google Gemini
- Template-based content creation (Newsletter, Blog Post, Donor Email, Social Media)
- Context-aware prompts using organization's Drive files
- MongoDB for data persistence

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your actual credentials
```

4. Set up Google Drive API:
   - Go to Google Cloud Console
   - Create a new project or select existing
   - Enable Google Drive API
   - Create OAuth 2.0 credentials
   - Download credentials and add to .env

5. Set up Gemini API:
   - Get API key from Google AI Studio
   - Add to .env

6. Start MongoDB (locally or use MongoDB Atlas)

7. Run the server:
```bash
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration
│   ├── models/              # Pydantic models
│   ├── services/            # Business logic
│   ├── templates/           # Content templates
│   ├── api/routes/          # API endpoints
│   ├── database/            # Database connection
│   └── utils/               # Utilities
├── requirements.txt
└── .env
```
