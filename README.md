![alt text](image-1.png)

# Snapmind

Snapmind is a full-stack image exploration app that lets users upload images, extract OCR text, generate semantic embeddings, search visual content by meaning, and explore relationships between images through a graph view.

## What the project does

Snapmind combines:

- a FastAPI backend for authentication, uploads, search, and graph APIs
- a React + TypeScript frontend for the web experience
- SQLite storage for users, image metadata, and semantic connections
- OCR and embedding-based search to make images discoverable beyond filenames

## Current features

- User registration and login with JWT authentication
- Image upload and batch upload support
- OCR extraction from uploaded images
- Semantic search over image content using embeddings
- Query history per user
- Image detail views
- Graph-based visualization of image relationships
- Protected frontend routes for authenticated users

## Tech stack

### Backend
- FastAPI
- SQLAlchemy
- SQLite
- Python-Multipart
- PyTesseract
- Pillow
- Sentence Transformers
- PyJWT
- Passlib/Bcrypt

### Frontend
- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- React Flow

## Project structure

- backend/
  - app.py - FastAPI app setup and route registration
  - routes/ - auth, upload, search, image, and graph endpoints
  - services/ - OCR, embeddings, upload, and search logic
  - database/ - SQLite initialization and model definitions
  - models/ - user, image, and connection schemas
  - utils/ - auth and file helpers
- frontend/
  - src/pages/ - landing, dashboard, upload, search, graph, and detail views
  - src/components/ - layout and graph UI components
- images/ - uploaded image files

## Requirements

- Python 3.11+
- Node.js 18+ and npm
- Tesseract OCR installed and available on your system path

## Backend setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload
```

The API will be available at:
- http://127.0.0.1:8000
- Swagger docs: http://127.0.0.1:8000/docs

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at:
- http://127.0.0.1:5173

## Main API endpoints

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Uploads
- POST /api/upload
- POST /api/upload-multiple

### Search
- POST /api/search

### Graph
- GET /api/graph

### Images
- GET /api/images
- GET /api/images/{id}

## Data storage

- Uploaded images are stored in the images/ directory
- Image metadata, OCR text, embeddings, and user records are persisted in SQLite
- The database file is created at backend/database/snapmind.db

## Notes

- The backend serves uploaded images statically from /images/
- The app is currently configured for local development and uses local SQLite storage
- OCR and semantic search depend on the available Python environment and Tesseract installation
