# BCYI x YorkU AI Assistant

AI-powered content generation assistant for Black Creek Youth Initiative, helping create newsletters, blog posts, donor emails, social media content, and more with context from Google Drive.

## Demo

https://github.com/user-attachments/assets/bd7ab1be-3668-4aa3-a080-8cd4455c231c

https://github.com/user-attachments/assets/b67f9da5-6e71-4a84-b43f-c0c493863227

## Technologies

- FastAPI
- Python
- MongoDB
- Next.js
- Typescript
- TailwindCSS
- shadcn/ui
- Radix UI primitives

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

### 1. Prerequisites

- Docker and Docker Compose installed
- Google Drive API credentials (see below)
- Gemini API key (see below)

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
docker-compose up --build
```

### 4. How to access the application locally?

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
