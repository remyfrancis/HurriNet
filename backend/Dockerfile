FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive

# Set work directory
WORKDIR /app

# Install system dependencies and GDAL
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    gdal-bin \
    libgdal-dev \
    python3-dev \
    gcc \
    g++ \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set GDAL environment variables
ENV CPLUS_INCLUDE_PATH=/usr/include/gdal \
    C_INCLUDE_PATH=/usr/include/gdal

# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -U pip setuptools wheel && \
    gdal-config --version > gdal_version.txt && \
    pip install --no-cache-dir GDAL==$(cat gdal_version.txt) && \
    pip install --no-cache-dir -r requirements.txt && \
    rm gdal_version.txt

# Create necessary directories
RUN mkdir -p /app/staticfiles /app/media

# Copy the entire backend directory
COPY . /app/

# Set working directory to where manage.py is
WORKDIR /app/hurrinet

# Collect static files during build
ENV DJANGO_SETTINGS_MODULE=hurrinet.settings
RUN python manage.py collectstatic --noinput --clear

# Run migrations and start server
CMD ["sh", "-c", "python manage.py migrate && daphne -b 0.0.0.0 -p 8000 hurrinet.asgi:application"] 