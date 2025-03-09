FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install system dependencies and GDAL
RUN apt-get update && apt-get install -y \
    software-properties-common \
    gnupg2 \
    wget \
    build-essential \
    python3-dev \
    libpq-dev \
    gdal-bin \
    libgdal-dev \
    postgresql-client \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set GDAL environment variables
ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir pip --upgrade && \
    gdal-config --version > gdal_version.txt && \
    export GDAL_VERSION=$(cat gdal_version.txt) && \
    pip install --no-cache-dir numpy && \
    pip install --no-cache-dir GDAL==$(cat gdal_version.txt) && \
    rm gdal_version.txt && \
    pip install --no-cache-dir -r requirements.txt && \
    # Verify installations
    python -c "import numpy; print('numpy version:', numpy.__version__)" && \
    python -c "from osgeo import gdal; print('gdal version:', gdal.__version__)" && \
    python -c "import requests; print('requests version:', requests.__version__)"

# Copy project
COPY . .

# Run migrations and start server
CMD ["sh", "-c", "cd hurrinet && python manage.py migrate && daphne -b 0.0.0.0 -p 8000 hurrinet.asgi:application"] 