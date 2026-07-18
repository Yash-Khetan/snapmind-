# Snapmind

Snapmind is an image upload backend built with FastAPI and SQLite. Uploaded images are saved to a local `images/` folder, and metadata is stored in a SQLite `Images` table.

## Features

- Single image upload endpoint
- Local image storage in `images/`
- SQLite metadata persistence for uploaded images
- Static file serving for image access via `/images/<filename>`

## Project structure

- `backend/`
  - `app.py` - FastAPI application setup and route registration
  - `routes/upload_routes.py` - upload API routes
  - `services/upload_service.py` - image processing and storage business logic
  - `utils/file_utils.py` - helper for saving uploaded files safely
- `database/`
  - `database.py` - SQLite initialization and record insertion
- `images/` - stored uploaded files
- `requirements.txt` - Python dependencies

## Requirements

- Python 3.11+ (or any Python version with `sqlite3` included)
- `pip`

## Install

```bash
cd snapmind
pip install -r requirements.txt
```

> Note: `sqlite3` is part of the Python standard library, so no separate pip package is required.

## Run

```bash
uvicorn backend.app:app --reload
```

The app will start on `http://127.0.0.1:8000` by default.

## API Endpoints

### Single upload

`POST /upload`

- Form field: `image`
- Content type: `multipart/form-data`
- Response: saved image metadata

Example using `curl`:

```bash
curl -X POST "http://127.0.0.1:8000/upload" \
  -F "image=@/path/to/image.png"
```

## Database table

The SQLite schema includes one table:

- `Images`
  - `id`
  - `filename`
  - `filepath`
  - `uploaded_at`
  - `ocr_text`
  - `category`

The database file is created under `database/snapmind.db`.

## Notes

- Uploaded files are served statically from `/images/`
- Additional metadata fields like `ocr_text` and `category` are prepared for future enhancements
