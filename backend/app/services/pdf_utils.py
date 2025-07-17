from PyPDF2 import PdfReader
import re
import markdown2
from xhtml2pdf import pisa

def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extracts all text from a PDF file using PyPDF2.
    """
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text

def generate_pdf_from_text(text: str, output_path: str):
    """
    Converts Markdown to HTML, then HTML to PDF using xhtml2pdf.
    Strips triple backticks and language tags if present.
    """
    # Remove triple backticks and optional language tag
    cleaned = text.strip()
    cleaned = re.sub(r'^```[a-zA-Z]*\n?', '', cleaned)
    cleaned = re.sub(r'```$', '', cleaned)
    html = markdown2.markdown(cleaned)
    with open(output_path, "wb") as f:
        pisa.CreatePDF(html, dest=f)