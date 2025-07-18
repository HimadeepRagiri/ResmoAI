import firebase_admin
from firebase_admin import credentials, auth, storage, firestore
import os
from dotenv import load_dotenv
from pathlib import Path

print("GOOGLE_APPLICATION_CREDENTIALS:", os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"))
print("File exists:", os.path.exists(os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", "")))

env_path = Path(__file__).resolve().parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path) # Explicitly load the .env file

if not firebase_admin._apps:
    cred = credentials.Certificate(os.environ["GOOGLE_APPLICATION_CREDENTIALS"])
    firebase_admin.initialize_app(cred, {
        'storageBucket': os.environ["FIREBASE_STORAGE_BUCKET"]
    })

def verify_id_token(id_token: str):
    return auth.verify_id_token(id_token)

def download_pdf_from_storage(storage_path: str, local_path: str):
    """
    Downloads a PDF from Firebase Storage to a local path.
    storage_path is the path in the bucket (e.g., 'resumes/userid/filename.pdf').
    """
    bucket = storage.bucket()
    blob = bucket.blob(storage_path)
    blob.download_to_filename(local_path)

def upload_pdf_to_storage(local_path: str, dest_path: str) -> str:
    """
    Uploads a local PDF to Firebase Storage and returns a public URL.
    """
    bucket = storage.bucket()
    blob = bucket.blob(dest_path)
    blob.upload_from_filename(local_path, content_type="application/pdf")
    # Make the file public
    blob.make_public()
    return blob.public_url

def write_result_to_firestore(user_id: str, data: dict, collection: str = "optimizations"):
    db = firestore.client()
    db.collection("users").document(user_id).collection(collection).add(data) 