from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from database.database import init_db
from routes.upload_routes import router as upload_router
from routes.auth_routes import router as auth_router
from routes.search_routes import router as search_router
from routes.connection_routes import router as connection_router
from routes.image_routes import router as image_router
from routes.graph_routes import router as graph_router

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

# Static file serving for images is removed because images are now stored in Supabase private buckets
# and served via signed URLs.
# Register routes
app.include_router(upload_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(search_router, prefix="/api")
app.include_router(connection_router, prefix="/api")
app.include_router(image_router, prefix="/api")
app.include_router(graph_router, prefix="/api")

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Snapmind Backend is running"}

if __name__ == "__main__":
    import uvicorn
    import os
    # Render provides the port in the PORT environment variable
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port)
