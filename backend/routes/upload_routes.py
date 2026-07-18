from typing import List, Optional
from fastapi import APIRouter, File, UploadFile, HTTPException, Request, Depends
from backend.services.upload_service import upload_service
from backend.models.user_model import UserRecord
from backend.utils.auth import get_current_user

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

    return await upload_service.process_file(file_to_process)


# from typing import List, Union
# from fastapi import APIRouter, File, UploadFile, HTTPException, Request

# router = APIRouter()

# @router.post("/upload-multiple")
# async def upload_multiple_files(
#     # Union allows FastAPI to parse both a single file or a list of files cleanly
#     images: Union[List[UploadFile], UploadFile, None] = File(None)
# ):
#     """
#     Accepts single or multiple uploaded images from the 'images' form field.
#     """
#     files_to_process = []

#     # 1. Normalize the input into a standard flat python list
#     if images:
#         if isinstance(images, list):
#             files_to_process = images
#         else:
#             files_to_process = [images]

#     # 2. Guard rail checking if files were actually provided
#     # (Checking if filename is empty handles empty file placeholders sent by some clients)
#     files_to_process = [f for f in files_to_process if f.filename != ""]

#     if not files_to_process:
#         raise HTTPException(
#             status_code=400,
#             detail="No files received. Use form-data with one or more files under the 'images' field."
#         )

#     # 3. Pass to your service layer
#     return await upload_service.process_files(files_to_process)


