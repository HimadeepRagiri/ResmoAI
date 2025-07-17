from pydantic import BaseModel
from typing import Optional

class OptimizeResumeRequest(BaseModel):
    id_token: str
    prompt: str
    file_url: str

class OptimizeResumeResponse(BaseModel):
    match_score: float
    feedback: str
    pdf_link: str

class CreateResumeRequest(BaseModel):
    id_token: str
    prompt: str
    file_url: Optional[str] = None

class CreateResumeResponse(BaseModel):
    pdf_link: str 