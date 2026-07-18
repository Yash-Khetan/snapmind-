from typing import List
from fastapi import UploadFile
from database.database import insert_image_record
from backend.utils.file_utils import save_upload_file
from backend.services.ocr_service import extract_text_from_image
from backend.services.embeddings_service import generate_text_embedding

class UploadService:
    def __init__(self):
        # In-memory ID counter and store for uploaded images
        # Later, this can easily be replaced with a database call
        self._counter = 0
        self._store = []

    async def process_file(self, file: UploadFile) -> dict:
        """
        Processes a single file: saves it to disk, runs OCR, generates embeddings, and saves to SQLite.
        Returns the formatted dictionary output.
        """
        self._counter += 1
        current_id = self._counter
        original_filename = file.filename or f"image_{current_id}.png"

        # Save file to images/ directory
        file_path = await save_upload_file(file)

        # Run OCR extraction on the saved image
        extracted_ocr_text = extract_text_from_image(file_path)

        # Generate vector embeddings from the extracted OCR text
        ocr_embedding = generate_text_embedding(extracted_ocr_text)

        # Persist image metadata, OCR text, and embeddings vector to SQLite
        db_id = insert_image_record(
            filename=original_filename,
            filepath=file_path,
            ocr_text=extracted_ocr_text,
            category=None,
            embeddings=ocr_embedding
        )

        # Build response payload
        metadata = {
            "id": db_id,
            "filename": original_filename,
            "path": file_path,
            "ocr_text": extracted_ocr_text,
            "embeddings": ocr_embedding
        }
        self._store.append(metadata)
        return metadata



    async def process_files(self, files: List[UploadFile]) -> List[dict]:
        """
        Processes multiple files and returns a list of metadata dictionaries.
        """
        return [await self.process_file(file) for file in files]

# Global service instance
upload_service = UploadService()
