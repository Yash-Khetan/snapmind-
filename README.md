# Snapmind

Snapmind is an AI-powered full-stack image knowledge base and visual exploration web application. It enables users to upload images, automatically extract OCR text, generate semantic vector embeddings, search visual content by natural language meaning, discover semantic connections between related images, and explore visual relationships through an interactive graph visualization.

---

## What the Project Does

Snapmind transforms static image libraries into interconnected, searchable visual knowledge bases by combining:

- **FastAPI Backend**: High-performance REST API for authentication, single/batch uploads, semantic search, image connections, and graph relationships.
- **React 19 + TypeScript Frontend**: Modern, responsive user interface built with Vite, Tailwind CSS, and React Router.
- **AI & NLP Pipeline**: Automated OCR extraction via Tesseract and vector embeddings via `sentence-transformers/all-MiniLM-L6-v2`.
- **Hybrid Storage & Cloud Media**: Database support via SQLAlchemy (PostgreSQL / SQLite) with secure cloud file storage via Supabase private buckets served through time-bound signed URLs.
- **Interactive Graph Visualization**: Dynamic node-edge mapping of image relationships and similarity scores powered by React Flow.

---

## Key Features

- **JWT Authentication & Security**: User registration, login, and secure protected routes with Bcrypt password hashing.
- **Single & Batch Image Uploads**: Upload single images or process multiple files simultaneously (`/api/upload-multiple`) with isolated error handling per file.
- **Automated OCR Extraction**: Extracts text content directly from uploaded images (`PyTesseract` / `Pillow`).
- **Semantic Vector Search**: Generates 384-dimensional dense embeddings (`all-MiniLM-L6-v2`) to find images based on conceptual meaning rather than exact keyword matches.
- **Semantic Connections & Similarity Ranking**: Automatically computes cosine similarity scores across images upon upload and surfaces the top related images (`/api/connections/{image_id}`).
- **Interactive Knowledge Graph**: Visualizes all uploaded images as nodes and high-similarity connections as weighted edges (`/api/graph`) using React Flow.
- **Explore & Dashboard Views**: Browse, filter, and sort images (`newest` vs `connections`) across dedicated dashboard and exploration views.
- **Detailed Image Inspector**: View full OCR text, similarity scores, and connected images in a dedicated detail view.
- **Query History Tracking**: Automatically records and displays user search queries over time.
- **Docker Support**: Containerized backend setup (`Dockerfile`) with pre-configured dependencies including system Tesseract OCR.

---

## Tech Stack

### Backend
- **Framework**: FastAPI, Uvicorn, Python-Multipart
- **Database & ORM**: SQLAlchemy 2.0 (PostgreSQL / SQLite)
- **AI & ML**: Sentence Transformers (`all-MiniLM-L6-v2`), PyTesseract OCR, Pillow, NumPy
- **Cloud Storage**: Supabase Python SDK (`supabase`)
- **Security & Auth**: PyJWT, Passlib with Bcrypt

### Frontend
- **Core**: React 19, TypeScript, Vite
- **Routing & State**: React Router DOM
- **Styling**: Tailwind CSS
- **Visualization**: React Flow (`@xyflow/react`)

---

## Project Structure

```
snapmind/
├── backend/
│   ├── app.py                     # FastAPI app initialization, CORS setup, and route registration
│   ├── database/
│   │   └── database.py            # SQLAlchemy engine, session management, and DB setup
│   ├── models/
│   │   ├── user_model.py          # User schema & query history
│   │   ├── image_model.py         # Image metadata, OCR text, and vector embeddings
│   │   └── connection_model.py    # Semantic connection pairs and similarity scores
│   ├── routes/
│   │   ├── auth_routes.py         # User registration, login, and profile (/api/auth/*)
│   │   ├── upload_routes.py       # Single and batch file upload endpoints (/api/upload*)
│   │   ├── search_routes.py       # Semantic vector search endpoint (/api/search)
│   │   ├── connection_routes.py   # Semantic connections lookup (/api/connections/{id})
│   │   ├── image_routes.py        # Image listing and detail endpoints (/api/images*)
│   │   └── graph_routes.py        # Node-edge graph data endpoint (/api/graph)
│   ├── services/
│   │   ├── ocr_service.py         # Tesseract OCR text extraction pipeline
│   │   ├── embeddings_service.py  # MiniLM sentence embedding generation
│   │   ├── upload_service.py      # Orchestration for file processing and DB insertion
│   │   ├── search_service.py      # Cosine similarity computation for search queries
│   │   └── connection_service.py  # Automated connection creation between related images
│   ├── utils/
│   │   ├── auth.py                # Password hashing and JWT verification helpers
│   │   ├── file_utils.py          # File upload handler for Supabase storage
│   │   └── supabase_client.py     # Supabase client setup & signed URL generation
│   ├── Dockerfile                 # Backend container configuration with Tesseract OCR
│   └── requirements.txt           # Python dependencies
└── frontend/
    ├── src/
    │   ├── api/                   # Typed API clients (auth, search, images, client)
    │   ├── components/            # Reusable layout and UI components
    │   ├── pages/                 # Landing, Dashboard, Explore, Upload, Search, Graph, ImageDetails, Login, Register
    │   ├── types/                 # TypeScript interfaces and data contracts
    │   └── main.tsx               # Application entry point & router setup
    ├── package.json               # Frontend dependencies and scripts
    └── vite.config.ts             # Vite build configuration
```

---

## Requirements & Prerequisites

- **Python**: `3.11+`
- **Node.js**: `18+` and `npm`
- **Tesseract OCR**: Installed and accessible on your system `PATH` (`tesseract --version`)
- **Supabase Project** (or Local Database): Storage bucket (`images`) and database connection (`DATABASE_URL`)

---

## Environment Setup

Create a `.env` file in the `backend/` directory with your database and Supabase credentials:

```ini
# Database Connection (PostgreSQL connection string from Supabase or local URL)
DATABASE_URL=postgresql://user:password@host:port/dbname

# Supabase Storage Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SECRET_KEY=your-supabase-secret-or-service-role-key
# Or publishable key if secret key is not required:
SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

---

## Running the Application Locally

### 1. Backend Setup

```bash
cd backend
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn app:app --reload
```

The backend server will start at:
- **API URL**: `http://127.0.0.1:8000`
- **Interactive API Docs (Swagger)**: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup

In a separate terminal window:

```bash
cd frontend
npm install
npm run dev
```

The frontend application will start at:
- **Web App URL**: `http://127.0.0.1:5173`

---

## Main API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new user account and receive a JWT token
- `POST /api/auth/login` — Authenticate an existing user and receive a JWT token
- `GET /api/auth/me` — Retrieve the authenticated user's profile and query history

### Uploads (`/api`)
- `POST /api/upload` — Upload and process a single image file
- `POST /api/upload-multiple` — Upload and process multiple image files in batch

### Search & Connections (`/api`)
- `POST /api/search` — Perform a natural language semantic search over image OCR text
- `GET /api/connections/{image_id}` — Retrieve the top semantically connected images and similarity scores for a specific image

### Images & Graph (`/api`)
- `GET /api/images` — List user images with optional sorting (`?sort=newest` or `?sort=connections`)
- `GET /api/images/{id}` — Retrieve detailed metadata and signed file URL for a specific image
- `GET /api/graph` — Retrieve structured nodes and edges for React Flow graph visualization

---

## Data Storage & Architecture Notes

- **Cloud Media Storage**: Image files are uploaded directly to a secure private Supabase storage bucket (`images`) and accessed securely via short-lived signed URLs (`get_signed_url`).
- **Relational Persistence**: User records, image metadata, extracted OCR text, and semantic connection mappings are stored using SQLAlchemy models with support for PostgreSQL / SQLite.
- **Vector Embeddings**: Text embeddings are stored as serialized floating-point arrays and compared using cosine similarity directly within the Python search service layer.
- **Docker Deployment**: The backend can also be built and deployed via Docker using the provided `Dockerfile`, which automatically installs system-level Tesseract dependencies.

