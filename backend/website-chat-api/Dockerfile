FROM python:3.12-slim  

# Set working directory to /app/src (matches local dev)
WORKDIR /app/src

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc python3-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements from root and install
COPY ../requirements.txt /app/requirements.txt 
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy only the src folder (avoid copying unnecessary files)
COPY src/ .

# Run from the working directory (/app/src)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]