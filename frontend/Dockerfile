# Frontend Dockerfile for BCYI AI Assistant

FROM node:20-alpine

WORKDIR /app

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies (including TypeScript types)
RUN pnpm install

# Copy application code
COPY . .

# Set environment variable for backend URL
ENV BACKEND_URL=http://backend:8000
ENV NEXT_TELEMETRY_DISABLED=1

# Expose port
EXPOSE 3000

# Run the application in development mode
CMD ["pnpm", "run", "dev"]
