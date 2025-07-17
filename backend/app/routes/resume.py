from fastapi import APIRouter, HTTPException, Request
from app.models import schemas
from app.services import firebase, pdf_utils, gemini
import tempfile
import os
import uuid
import time

router = APIRouter()

@router.post("/optimize-resume", response_model=schemas.OptimizeResumeResponse)
async def optimize_resume(request: Request, data: schemas.OptimizeResumeRequest):
    try:
        # 1. Verify Firebase ID token
        decoded_token = firebase.verify_id_token(data.id_token)
        user_id = decoded_token["uid"]
        print(f"User ID: {user_id}")

        # 2. Download PDF from Firebase Storage
        with tempfile.TemporaryDirectory() as tmpdir:
            pdf_path = os.path.join(tmpdir, "input.pdf")
            print(f"Downloading PDF from storage path: {data.file_url}")
            firebase.download_pdf_from_storage(data.file_url, pdf_path)

            # 3. Extract text from PDF
            resume_text = pdf_utils.extract_text_from_pdf(pdf_path)
            print("Extracted resume text (first 200 chars):", resume_text[:200])

            # 4. Call Gemini API
            ai_result = gemini.call_gemini_api(resume_text, data.prompt, mode="optimize")
            print("AI result:", ai_result)
            optimized_resume_md = ai_result["optimized_resume"]
            match_score = ai_result["match_score"]
            feedback = ai_result["feedback"]

            # 5. Generate PDF from AI output
            output_pdf_path = os.path.join(tmpdir, "optimized_resume.pdf")
            try:
                pdf_utils.generate_pdf_from_text(optimized_resume_md, output_pdf_path)
                print(f"PDF generated at: {output_pdf_path}")
            except Exception as e:
                print("PDF generation failed:", e)
                raise HTTPException(status_code=500, detail="PDF generation failed")

            # 6. Upload new PDF to Firebase Storage
            unique_id = f"{int(time.time())}_{uuid.uuid4().hex}"
            dest_path = f"users/{user_id}/optimized_resumes/optimized_{unique_id}.pdf"
            try:
                pdf_link = firebase.upload_pdf_to_storage(output_pdf_path, dest_path)
                print(f"PDF uploaded to: {pdf_link}")
            except Exception as e:
                print("PDF upload failed:", e)
                raise HTTPException(status_code=500, detail="PDF upload failed")

        # 7. Write result to Firestore
        firebase.write_result_to_firestore(user_id, {
            "match_score": match_score,
            "feedback": feedback,
            "pdf_link": pdf_link,
            "prompt": data.prompt,
            "file_url": data.file_url
        })

        # 8. Return response
        return schemas.OptimizeResumeResponse(
            match_score=match_score,
            feedback=feedback,
            pdf_link=pdf_link
        )
    except Exception as e:
        print("Error in optimize_resume:", e)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/create-resume", response_model=schemas.CreateResumeResponse)
async def create_resume(request: Request, data: schemas.CreateResumeRequest):
    try:
        # 1. Verify Firebase ID token
        decoded_token = firebase.verify_id_token(data.id_token)
        user_id = decoded_token["uid"]
        print(f"User ID: {user_id}")

        with tempfile.TemporaryDirectory() as tmpdir:
            resume_text = ""
            if data.file_url:
                # Download and extract text from existing resume
                pdf_path = os.path.join(tmpdir, "input.pdf")
                print(f"Downloading PDF from storage path: {data.file_url}")
                firebase.download_pdf_from_storage(data.file_url, pdf_path)
                resume_text = pdf_utils.extract_text_from_pdf(pdf_path)
                print("Extracted resume text (first 200 chars):", resume_text[:200])
            # 2. Call Gemini API (creation or modification)
            ai_result = gemini.call_gemini_api(resume_text, data.prompt, mode="create")
            print("AI result:", ai_result)
            created_resume_md = ai_result["created_resume"]
            # 3. Generate PDF from AI output
            output_pdf_path = os.path.join(tmpdir, "created_resume.pdf")
            try:
                pdf_utils.generate_pdf_from_text(created_resume_md, output_pdf_path)
                print(f"PDF generated at: {output_pdf_path}")
            except Exception as e:
                print("PDF generation failed:", e)
                raise HTTPException(status_code=500, detail="PDF generation failed")
            # 4. Upload new PDF to Firebase Storage
            unique_id = f"{int(time.time())}_{uuid.uuid4().hex}"
            dest_path = f"users/{user_id}/created_resumes/created_{unique_id}.pdf"
            try:
                pdf_link = firebase.upload_pdf_to_storage(output_pdf_path, dest_path)
                print(f"PDF uploaded to: {pdf_link}")
            except Exception as e:
                print("PDF upload failed:", e)
                raise HTTPException(status_code=500, detail="PDF upload failed")
        # 5. Write result to Firestore
        firebase.write_result_to_firestore(user_id, {
            "pdf_link": pdf_link,
            "prompt": data.prompt,
            "file_url": data.file_url,
            "created_resume": created_resume_md,
            "type": "create_resume"
        }, collection="resumes")
        # 6. Return response
        return schemas.CreateResumeResponse(
            pdf_link=pdf_link
        )
    except Exception as e:
        print("Error in create_resume:", e)
        raise HTTPException(status_code=500, detail=str(e)) 