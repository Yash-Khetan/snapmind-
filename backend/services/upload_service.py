from typing import List
from fastapi import UploadFile
from database.database import insert_image_record, SessionLocal
from backend.utils.file_utils import save_upload_file
from backend.services.ocr_service import extract_text_from_image
from backend.services.embeddings_service import generate_text_embedding
from backend.services.connection_service import create_connections_for_image

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
        print(f"[DEBUG] process_file started for: {file.filename}")
        self._counter += 1
        current_id = self._counter
        original_filename = file.filename or f"image_{current_id}.png"

        # Save file to images/ directory
        print(f"[DEBUG] Step 1: Saving file '{original_filename}' to disk...")
        file_path = await save_upload_file(file)
        print(f"[DEBUG] Step 1 complete: File saved to '{file_path}'")

        # Run OCR extraction on the saved image
        print(f"[DEBUG] Step 2: Running OCR extraction on '{file_path}'...")
        extracted_ocr_text = extract_text_from_image(file_path)
        print(f"[DEBUG] Step 2 complete: Extracted {len(extracted_ocr_text) if extracted_ocr_text else 0} chars of OCR text")

        # Generate vector embeddings from the extracted OCR text
        print(f"[DEBUG] Step 3: Generating vector embeddings...")
        ocr_embedding = generate_text_embedding(extracted_ocr_text)
        print(f"[DEBUG] Step 3 complete: Embedding generated (type: {type(ocr_embedding)})")

        # Persist image metadata, OCR text, and embeddings vector to SQLite
        print(f"[DEBUG] Step 4: Inserting image record into SQLite database...")
        db_id = insert_image_record(
            filename=original_filename,
            filepath=file_path,
            ocr_text=extracted_ocr_text,
            category=None,
            embeddings=ocr_embedding
        )
        print(f"[DEBUG] Step 4 complete: Database record inserted with db_id={db_id}")

        # Create semantic connections with existing images
        print(f"[DEBUG] Step 5: Creating semantic connections...")
        connections_count = 0
        if ocr_embedding is not None:
            db = SessionLocal()
            try:
                connections_count = create_connections_for_image(
                    new_image_id=db_id,
                    new_embedding=ocr_embedding,
                    db=db,
                )
                print(f"[DEBUG] Step 5 complete: Created {connections_count} connections")
            except Exception as e:
                import traceback
                print(f"[DEBUG] Step 5 FAILED during create_connections_for_image: {e}")
                traceback.print_exc()
                raise
            finally:
                db.close()
        else:
            print("[DEBUG] Step 5 skipped: ocr_embedding is None")

        # Build response payload
        print(f"[DEBUG] Step 6: Building response payload and updating store...")
        metadata = {
            "id": db_id,
            "filename": original_filename,
            "path": file_path,
            "ocr_text": extracted_ocr_text,
            "connections_created": connections_count,
            # "embeddings": ocr_embedding
        }
        self._store.append(metadata)
        print(f"[DEBUG] process_file successfully completed for id={db_id}, filename='{original_filename}'")
        return metadata



    async def process_files(self, files: List[UploadFile]) -> List[dict]:
        """
        Processes multiple files and returns a list of metadata dictionaries.
        """
        print(f"[DEBUG] process_files started for {len(files)} file(s)")
        results = []
        for idx, file in enumerate(files, start=1):
            print(f"[DEBUG] Batch processing file {idx}/{len(files)}: {file.filename}")
            try:
                metadata = await self.process_file(file)
                results.append(metadata)
                print(f"[DEBUG] Batch file {idx}/{len(files)} succeeded.")
            except Exception as e:
                import traceback
                print(f"[DEBUG] Batch file {idx}/{len(files)} ({file.filename}) FAILED with error: {e}")
                traceback.print_exc()
                raise
        print(f"[DEBUG] process_files finished successfully with {len(results)} file(s)")
        return results

# Global service instance
upload_service = UploadService()
