from typing import List, Optional
from fastapi import APIRouter, File, UploadFile, HTTPException, Request, Depends
from services.upload_service import upload_service
from models.user_model import UserRecord
from utils.auth import get_current_user

router = APIRouter()

@router.post("/upload")
async def upload_file(
    request: Request,
    image: Optional[UploadFile] = File(None),
    current_user: UserRecord = Depends(get_current_user),
):
    """
    Accepts a single uploaded image from the 'image' form field.
    """
    file_to_process = image

    if file_to_process is None:
        try:
            form_data = await request.form()
            for _, value in form_data.multi_items():
                if isinstance(value, UploadFile):
                    file_to_process = value
                    break
        except Exception:
            pass

    if file_to_process is None:
        raise HTTPException(
            status_code=400,
            detail="No file received. Use form-data with a single file under the 'image' field."
        )

    return await upload_service.process_file(file_to_process, user_id=current_user.id)


@router.post("/upload-multiple")
async def upload_multiple_files(
    images: List[UploadFile] = File(...),
    current_user: UserRecord = Depends(get_current_user),
):
    """
    Accepts multiple uploaded images from the 'images' form field.
    Each file is processed through the same pipeline as /upload:
    save → OCR → embedding → DB insert → semantic connections.
    Per-file errors are isolated so one failure doesn't abort the batch.
    """
    # Filter out empty filename placeholders sent by some HTTP clients
    files_to_process = [f for f in images if f.filename]

    if not files_to_process:
        raise HTTPException(
            status_code=400,
            detail="No files received. Use form-data with one or more files under the 'images' field.",
        )

    return await upload_service.process_files(files_to_process, user_id=current_user.id)
