FROM python:3.11-slim

WORKDIR /app

# Prevent Python from creating .pyc files
ENV PYTHONDONTWRITEBYTECODE=1

# Send Python output directly to Docker logs
ENV PYTHONUNBUFFERED=1

# Install Python dependencies
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy AI application
COPY . .

# AI service port
EXPOSE 8000

# Start AI service
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]