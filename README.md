# HurriNet Project Backend

## Introduction

HurriNet is my Final Project at UoL, and is a Disaster Preparedness Network designed specifically for Saint Lucia. This platform aims to provide a centralized solution for disaster monitoring and preparedness, addressing both public and emergency management needs in the face of frequent hurricanes and storms.

This guide explains how to set up and run the HurriNet backend application locally for development purposes, assuming you do not have Docker installed. The project uses Django, PostgreSQL with PostGIS, Redis, and Celery.

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

1.  **Python:** Version **3.12**. You can download it from [python.org](https://www.python.org/downloads/) or use a version manager like `pyenv`.
2.  **Pip:** Python's package installer (usually comes with Python). Ensure it's up to date (`pip install --upgrade pip`).
3.  **Git:** For cloning the repository.
4.  **PostgreSQL:** Version **15** (or compatible). Download from [postgresql.org](https://www.postgresql.org/download/).
5.  **PostGIS:** Version **3.3** (or compatible) extension for PostgreSQL. Installation instructions often depend on the OS and PostgreSQL installation method. See [PostGIS Installation](https://postgis.net/install/).
6.  **Redis:** Version **7** (or compatible). Download from [redis.io](https://redis.io/docs/getting-started/installation/).
7.  **GDAL (Geospatial Data Abstraction Library):** This can be tricky to install. The version should ideally match what the Python GDAL package expects (around 3.6.2 based on requirements).
    *   **Debian/Ubuntu:** `sudo apt-get update && sudo apt-get install -y gdal-bin libgdal-dev python3-dev gcc g++ libpq-dev curl`
    *   **macOS (Homebrew):** `brew install gdal postgresql redis` (Homebrew usually installs `libpq` with `postgresql`). You might also need `brew install gcc`.
    *   **Windows:** This is significantly more complex. Consider using [WSL (Windows Subsystem for Linux)](https://learn.microsoft.com/en-us/windows/wsl/install) or finding pre-compiled GDAL binaries/installers specifically for Windows (e.g., from [OSGeo4W](https://trac.osgeo.org/osgeo4w/)). `libpq-dev` equivalent might require installing PostgreSQL with developer headers...or...using Docker! :D
8.  **Build Tools:** `gcc`, `g++`, `python3-dev` (Python development headers), `libpq-dev` (PostgreSQL development headers). These are often needed to build some Python dependencies. (See OS-specific commands above).

## Setup Instructions

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/remyfrancis/HurriNet.git
    cd HurriNetProjectFinal
    ```

2.  **Navigate to Backend Directory:**
    ```bash
    cd backend
    ```

3.  **Create/Update `requirements.txt`:**
    Ensure the `backend/requirements.txt` file contains the following exact dependencies (copy and paste this content into `backend/requirements.txt`):
    ```txt
    amqp==5.3.1
    asgiref==3.8.1
    attrs==25.3.0
    autobahn==24.4.2
    Automat==24.8.1
    billiard==4.2.1
    boto3==1.37.13
    botocore==1.37.13
    celery==5.4.0
    certifi==2025.1.31
    cffi==1.17.1
    channels==4.2.0
    channels_redis==4.2.1
    charset-normalizer==3.4.1
    click==8.1.8
    click-didyoumean==0.3.1
    click-plugins==1.1.1
    click-repl==0.3.0
    constantly==23.10.4
    cryptography==44.0.2
    daphne==4.1.2
    Django==5.1.7
    django-cors-headers==4.7.0
    django-environ==0.12.0
    django-filter==25.1
    django-redis==5.4.0
    django-storages==1.14.5
    djangorestframework==3.15.2
    djangorestframework-gis==1.0
    djangorestframework_simplejwt==5.5.0
    drf-yasg==1.21.7
    Faker==37.0.0
    GDAL==3.6.2
    geographiclib==2.0
    geopy==2.4.1
    gunicorn==23.0.0
    hyperlink==21.0.0
    idna==3.10
    incremental==24.7.2
    inflection==0.5.1
    jmespath==1.0.1
    kombu==5.5.0
    msgpack==1.1.0
    numpy==1.26.4
    packaging==24.2
    pandas==2.2.3
    pillow==11.1.0
    prompt_toolkit==3.0.50
    psycopg2==2.9.10
    pyasn1==0.6.1
    pyasn1_modules==0.4.1
    pycparser==2.22
    PyJWT==2.9.0
    pyOpenSSL==25.0.0
    python-dateutil==2.9.0.post0
    python-dotenv==1.0.1
    pytz==2025.1
    PyYAML==6.0.2
    redis==5.2.1
    requests==2.32.3
    s3transfer==0.11.4
    scipy==1.12.0
    service-identity==24.2.0
    setuptools==76.0.0
    six==1.17.0
    sqlparse==0.5.3
    Twisted==24.11.0
    txaio==23.1.1
    typing_extensions==4.12.2
    tzdata==2025.1
    uritemplate==4.1.1
    urllib3==2.3.0
    vine==5.1.0
    wcwidth==0.2.13
    wheel==0.45.1
    whitenoise==6.9.0
    zope.interface==7.2
    ```

4.  **Create Virtual Environment:**
    (From within the `backend` directory)
    ```bash
    python -m venv venv
    ```
    Activate it:
    *   Linux/macOS: `source venv/bin/activate`
    *   Windows: `venv\Scripts\activate`

5.  **Install Python Dependencies:**
    ```bash
    # Ensure GDAL library is installed system-wide first (see Prerequisites)!
    pip install -r requirements.txt
    ```
    *(Note: `psycopg2` might require `libpq-dev`. GDAL Python package installation requires the GDAL library and headers to be installed correctly.)*

6.  **Set Up PostgreSQL Database:**
    *   Ensure your PostgreSQL 15 server is running.
    *   Connect to PostgreSQL using `psql` or a GUI tool.
    *   Create the database user:
        ```sql
        CREATE USER postgres WITH PASSWORD 'yadmon13'; 
        ```
    *   Create the database:
        ```sql
        CREATE DATABASE hurrinet_db OWNER postgres;
        ```
    *   Connect to the new database (`\c hurrinet_db`) and enable the PostGIS extension:
        ```sql
        CREATE EXTENSION postgis;
        ```
    *   Grant privileges (if needed, often the owner has them):
        ```sql
        GRANT ALL PRIVILEGES ON DATABASE hurrinet_db TO postgres;
        ```

7.  **Set Up Redis:**
    *   Ensure your Redis server is running (usually `redis-server` if installed via package manager, or follow download instructions). It typically runs on `127.0.0.1` port `6379` by default.

8.  **Configure Environment Variables:**
    *   Create a file named `.env` inside the `backend` directory (`backend/.env`).
    *   Copy the content of `.env.example` (see below) into `.env`.
    *   **Crucially, update the values** in `.env` for your *local* setup, especially `POSTGRES_HOST`, `POSTGRES_PORT`, `REDIS_HOST`, `REDIS_PORT`, and potentially the user/password if you chose different ones.

    **`.env.example` (Create this file in `backend/.env.example` and commit it):**
    ```env
    # Django Settings
    DEBUG=1
    DJANGO_SETTINGS_MODULE=hurrinet.settings
    SECRET_KEY='your_secret_key_here' # CHANGE THIS! Generate a strong secret key

    # Database Settings (PostgreSQL/PostGIS)
    POSTGRES_DB=hurrinet_db
    POSTGRES_USER=postgres
    POSTGRES_PASSWORD=yadmon13 # Use the password you set for the DB user
    POSTGRES_HOST=127.0.0.1 # Use localhost or IP for local setup
    POSTGRES_PORT=5432

    # Redis Settings
    REDIS_HOST=127.0.0.1 # Use localhost or IP for local setup
    REDIS_PORT=6379
    # Example for REDIS_URL if preferred by django-redis/celery config:
    # REDIS_URL=redis://127.0.0.1:6379/1 # Use db 1 like in docker-compose

    # Celery Settings (if needed directly as env vars)
    # CELERY_BROKER_URL=redis://127.0.0.1:6379/1
    # CELERY_RESULT_BACKEND=redis://127.0.0.1:6379/1

    # Add other necessary environment variables (e.g., API keys)
    ```
    *   **SECURITY WARNING:** Add `.env` to your `.gitignore` file to avoid committing secrets. Only commit `.env.example`.

9.  **Run Database Migrations:**
    (Make sure your virtual environment is active and you are in the `backend/hurrinet` directory where `manage.py` is)
    ```bash
    cd hurrinet
    python manage.py migrate
    ```

10. **Create Superuser (Optional):**
    To access the Django admin interface (`/admin/`).
    ```bash
    python manage.py createsuperuser
    ```
    Follow the prompts.

## Running the Application

You need to run the Django application server and the Celery worker (since Celery is in requirements).

1.  **Run the Development Server (using Daphne for ASGI):**
    (From the `backend/hurrinet` directory with the virtual environment active)
    ```bash
    daphne -b 127.0.0.1 -p 8000 hurrinet.asgi:application
    # Or use the standard Django development server (might not support Channels/ASGI fully):
    # python manage.py runserver
    ```
    The application should be available at `http://127.0.0.1:8000/`.

2.  **Run the Celery Worker:**
    (Open a *new* terminal, navigate to `backend`, activate the virtual environment (`source venv/bin/activate` or `venv\Scripts\activate`), then go to the `hurrinet` directory)
    ```bash
    cd path/to/HurriNetProjectFinal/backend/hurrinet
    celery -A hurrinet worker --loglevel=info
    ```
    (Replace `hurrinet` with your actual Django project name if different, it's the directory containing `celery.py` or where the Celery app is defined). This process runs in the foreground and processes background tasks.

## Running Tests (Optional)

If you have tests set up, you can usually run them with:
(From the `backend/hurrinet` directory with the virtual environment active)

```bash
python manage.py test
```

## Docker Alternative

A Docker setup is also available for containerized deployment and development. See the `Dockerfile` and `docker-compose.yml` files for details.


# Frontend Setup (Local - No Docker)

This section describes how to set up and run the Next.js frontend application locally.

**Prerequisites:**

*   **Node.js and npm:** Install Node.js (v18 or later recommended) which includes npm. Download from [nodejs.org](https://nodejs.org/).

**Setup Instructions:**

1.  **Navigate to Frontend Directory:**
    (From the project root: `/HurriNetProjectFinal/`)
    ```bash
    cd HurriNet 
    ```

2.  **Install Dependencies:**
    ```bash
    npm install --legacy-peer-deps
    ```
    *(The `--legacy-peer-deps` flag is needed for this project's dependencies.)*

3.  **Configure Environment Variables:**
    *   Create a file named `.env.local` in the frontend directory (`frontend/.env.local`).
    *   Copy the content of `.env.example` (see below) into `.env.local`.
    *   **Update the values** in `.env.local`:
        *   The backend URLs should point to your locally running backend (e.g., `http://localhost:8000`).
        *   You **must** check the Appendices of the HurriNet Project Report for the API keys/tokens for Mapbox and Tomorrow.io and add them.

    **`frontend/.env.example` (Create this file and commit it):**
    ```env
    # Backend URLs (Adjust if your backend runs elsewhere)
    NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
    NEXT_PUBLIC_WS_URL=ws://localhost:8000
    NEXT_PUBLIC_API_URL=http://localhost:8000/api
    BACKEND_URL=http://localhost:8000

    # Public API Keys (Replace with your own keys!)
    NEXT_PUBLIC_MAPBOX_TOKEN="YOUR_MAPBOX_PUBLIC_TOKEN_HERE"  
    NEXT_PUBLIC_TOMORROW_API_KEY="YOUR_TOMORROW_IO_API_KEY_HERE"

    ```

**Running the Frontend Development Server:**

1.  **Start the Server:**
    (From within the `hurrinet` directory)
    ```bash
    npm run dev
    ```

2.  **Access the Application:**
    *   Open your browser and navigate to `http://localhost:3000` (or the URL provided in the terminal output). Then click Login and login with your user account or register one.
