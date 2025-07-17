import os
from google import genai
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).resolve().parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path) # Explicitly load the .env file

# Get the API key from environment variables
api_key = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=api_key)

MODEL_NAME = "models/gemini-2.5-flash-lite-preview-06-17"

OPTIMIZE_PROMPT = (
    """
    You are an expert ATS resume assistant. Given a user's resume and a job description prompt, you will:
    1. Analyze the resume for ATS-friendliness and job match.
    2. Provide a match score (0-100) and feedback for improvement.
    3. Output an optimized, ATS-friendly resume in clear, professional English, in Markdown format.
    4. Do not use any placeholders like [Your Degree Name], [mention specific project], or [add more here]. If information is missing, fill in with realistic, professional details based on the context.
    Respond in JSON with keys: match_score (number), feedback (string), optimized_resume (string, Markdown).
    """
)

CREATE_PROMPT = (
    """
    You are an expert resume writer. Given a prompt (and optionally an existing resume), generate a new, ATS-friendly resume in Markdown format. Do not use any placeholders like [Your Degree Name], [mention specific project], or [add more here]. If information is missing, fill in with realistic, professional details based on the context. Respond in JSON with key: created_resume (string, Markdown).
    """
)

def call_gemini_api(resume_text: str, prompt: str, mode: str = "optimize") -> dict:
    """
    Calls Gemini 2.5 Flash-Lite with resume text and prompt.
    mode: 'optimize' (default) or 'create'.
    Returns dict with keys depending on mode.
    """
    if mode == "optimize":
        system_prompt = OPTIMIZE_PROMPT
        user_input = f"RESUME:\n{resume_text}\n\nPROMPT:\n{prompt}"
    else:
        system_prompt = CREATE_PROMPT
        if resume_text:
            user_input = f"EXISTING RESUME:\n{resume_text}\n\nPROMPT:\n{prompt}"
        else:
            user_input = f"PROMPT:\n{prompt}"
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=[
            system_prompt,
            user_input
        ]
    )
    import json
    import re
    try:
        # Clean up Gemini's response (remove ```json ... ```)
        cleaned = response.text.strip()
        # Remove triple backticks and optional language tag
        cleaned = re.sub(r'^```[a-zA-Z]*\n?', '', cleaned)
        cleaned = re.sub(r'```$', '', cleaned)
        data = json.loads(cleaned)
        if mode == "optimize":
            return {
                "match_score": data.get("match_score", 0),
                "feedback": data.get("feedback", ""),
                "optimized_resume": data.get("optimized_resume", "")
            }
        else:
            return {
                "created_resume": data.get("created_resume", "")
            }
    except Exception as e:
        raise RuntimeError(f"Gemini API error: {e}\nRaw response: {response.text}")
