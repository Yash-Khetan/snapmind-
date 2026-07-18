from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from database.database import init_db
from backend.routes.upload_routes import router as upload_router
from backend.routes.auth_routes import router as auth_router
from backend.routes.search_routes import router as search_router

# Load environment variables from .env
load_dotenv()

# Initialize SQLite database and tables (Images + Users) right when app loads
init_db()

app = FastAPI(
    title="Snapmind API",
    description="Backend API for Snapmind handling single and bulk image uploads",
    version="2.0.0"
)

# Allow CORS so frontend can communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files so uploaded images can be accessed directly at /images/<filename>
ROOT_DIR = Path(__file__).resolve().parent.parent
IMAGES_DIR = ROOT_DIR / "images"
IMAGES_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/images", StaticFiles(directory=str(IMAGES_DIR)), name="images")

# Register routes
app.include_router(upload_router)
app.include_router(auth_router)
app.include_router(search_router)

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Snapmind Backend is running"}
