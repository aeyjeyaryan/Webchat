# Use an official Python runtime as the base image
FROM python:3.12-slim

# Install system dependencies required for Playwright
RUN apt-get update && apt-get install -y \
    libgtk-4-1 \
    libgraphene-1.0-0 \
    libgstreamer-gl1.0-0 \
    libgstreamer-plugins-bad1.0-0 \
    libavif15 \
    libenchant-2-2 \
    libsecret-1-0 \
    libmanette-0.2-0 \
    libgles2 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright browsers
RUN playwright install

# Copy the application code
COPY . .

# Expose the port Render will use
EXPOSE $PORT

# Start the FastAPI application
CMD uvicorn src.main:app --host 0.0.0.0 --port $PORT