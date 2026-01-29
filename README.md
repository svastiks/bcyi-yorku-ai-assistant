# BCYI x YorkU AI Assistant

AI-powered content generation assistant for Black Creek Youth Initiative, helping create newsletters, blog posts, donor emails, social media content, and more with context from Google Drive.

![BCYI AI Assistant](https://img.shields.io/badge/AI-Powered-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-16-black) ![FastAPI](https://img.shields.io/badge/FastAPI-Python-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)

## Features

- **AI-Powered Content Generation**: Uses Google Gemini API to create high-quality content
- **Google Drive Integration**: Auto-sorts files and retrieves context for content generation
- **Template System**: Pre-built templates for different content types
- **Context-Aware**: Uses organization's existing files to inform content generation
- **Chat Interface**: Interactive conversation for iterative content creation

## Content Types

1. **Newsletter** 📧 - Monthly community updates and highlights
2. **Blog Post** ✍️ - In-depth stories and impact narratives
3. **Donor Email** 💝 - Gratitude messages with impact stories
4. **Social Media** 📱 - Engaging posts for various platforms
5. **General** 💬 - Flexible content creation for any purpose

## Quick Start with Docker

### Prerequisites

- Docker and Docker Compose installed
- Google Drive API credentials (see below)
- Gemini API key (see below)

### 1. Get API Keys

#### Google Drive API Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable **Google Drive API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google Drive API" → Enable
4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:8000/auth/callback`
5. Copy the **Client ID** and **Client Secret**

#### Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Select or create a Google Cloud project
4. Copy the generated API key

### 2. Set Up Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your API keys
# - GOOGLE_CLIENT_ID
# - GOOGLE_CLIENT_SECRET  
# - GEMINI_API_KEY
```

### 3. Start the Application

```bash
# Start all services (Frontend, Backend, MongoDB)
docker-compose up

# Or run in background
docker-compose up -d
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **MongoDB**: localhost:27017

### 5. Stop the Application

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v
```

## Manual Setup (Without Docker)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your credentials
```

5. Start MongoDB locally or use MongoDB Atlas

6. Run the server:
```bash
uvicorn app.main:app --reload
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
pnpm install
# or: npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit with backend URL (default: http://localhost:8000)
```

4. Run development server:
```bash
pnpm dev
# or: npm run dev
```

## Project Structure

```
bcyi-yorku-ai-assistant/
├── frontend/          # Next.js TypeScript frontend with shadcn/ui
│   ├── app/          # Next.js app directory
│   ├── components/   # UI components
│   ├── lib/          # Utilities and API client
│   └── Dockerfile
├── backend/          # Python FastAPI backend
│   ├── app/
│   │   ├── main.py              # FastAPI app entry
│   │   ├── config.py            # Configuration
│   │   ├── models/              # Pydantic models
│   │   ├── services/            # Business logic
│   │   ├── templates/           # Content templates
│   │   ├── api/routes/          # API endpoints
│   │   ├── database/            # MongoDB connection
│   │   └── utils/               # Utilities
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml # Docker orchestration
├── .env.example       # Environment variables template
└── README.md         # This file
```

## API Endpoints

### Chat
- `POST /api/chat/create` - Create chat session
- `POST /api/chat/{id}/message` - Send message
- `GET /api/chat/{id}` - Get chat history
- `GET /api/chat/` - List chats

### Content
- `GET /api/content/types` - List content types
- `GET /api/content/types/{type}` - Get type details

### Drive
- `GET /api/drive/auth` - Initiate OAuth
- `POST /api/drive/sync` - Sync files from Drive
- `POST /api/drive/sort` - Auto-sort files into folders
- `GET /api/drive/status` - Get sync status
- `GET /api/drive/files` - List files

## How It Works

### File Auto-Sorting
1. User authenticates with Google Drive
2. System scans all files and extracts metadata
3. Files are categorized based on patterns (name, MIME type)
4. Files are moved to organized folders (Newsletters, Blog Posts, etc.)
5. Metadata cached in MongoDB for fast retrieval

### Content Generation
1. User selects content type and enters request
2. System extracts keywords from request
3. Relevant files retrieved from Google Drive
4. Prompt built combining: template + context + request + history
5. Gemini API generates content
6. Response returned with context file count

## File Sorting Rules

The system automatically organizes files based on:

- **Newsletters**: Files with `newsletter_`, `monthly_update` in name
- **Blog Posts**: Files with `blog_`, `article_`, `post_` prefixes
- **Donor Emails**: Files with `donor_`, `thank_you_`, `donation_`
- **Social Media**: Files with `sm_`, `instagram_`, `twitter_`, etc.
- **Images**: JPG, PNG, GIF, WebP files → `Media/Images`
- **Videos**: MP4, MOV files → `Media/Videos`

## Development

### Tech Stack

**Frontend:**
- Next.js 16 (App Router)
- TypeScript
- shadcn/ui components
- Tailwind CSS
- Radix UI primitives

**Backend:**
- Python 3.11+
- FastAPI
- MongoDB (Motor for async)
- Google Drive API
- Google Gemini API

### Running Tests

```bash
# Backend tests (when implemented)
cd backend
pytest

# Frontend type checking
cd frontend
pnpm type-check
```

## Troubleshooting

### Backend won't start
- Check MongoDB is running: `docker ps | grep mongo`
- Verify .env file has all required variables
- Check logs: `docker-compose logs backend`

### Frontend shows demo responses
- Verify backend is running at http://localhost:8000
- Check backend health: http://localhost:8000/health
- Review browser console for errors

### Google Drive authentication fails
- Verify OAuth redirect URI matches: `http://localhost:8000/auth/callback`
- Check credentials are correct in .env
- Ensure Google Drive API is enabled in Google Cloud Console

### No content generated
- Verify Gemini API key is set in .env
- Check backend logs for API errors
- Try testing with demo mode first

## Future Enhancements

- Semantic search using embeddings and vector database
- Admin dashboard for managing templates and rules
- Multi-user support with authentication
- Content version control and editing
- Scheduled tasks for automatic syncing
- Export to various formats (PDF, DOCX, etc.)

## Contributing

This project was built for Black Creek Youth Initiative's partnership with York University.

## License

All rights reserved - Black Creek Youth Initiative x York University

## Support

For issues or questions, please contact the BCYI technical team.
