import os
import google.generativeai as genai
from utils.config import basicconfig

try:
    genai.configure(api_key=basicconfig.GOOGLE_API_KEY)
except (KeyError, AttributeError):
    raise RuntimeError("Error: Could not find GOOGLE_API_KEY in your config.")

def upload_pdf_to_genai(pdf_path):
    """Uploads a local PDF file to Google Generative AI."""
    resume_file = genai.upload_file(path=pdf_path)
    return resume_file

def generate_review_from_ai(resume_file, prompt, instructions):
    """Generates a review using the Google Generative AI model."""
    model = genai.GenerativeModel(
        model_name='gemini-2.5-pro',
        system_instruction=instructions
    )
    response = model.generate_content([prompt, resume_file])
    return response.text

def process_resume(pdf_path: str, prompt: str, instructions_path: str = "utils/instructions.txt") -> str:
    """Main function to run the resume review process."""
    if not os.path.exists(pdf_path):
        return f"Error: PDF file not found at {pdf_path}"

    try:
        with open(instructions_path, "r", encoding="utf-8") as f:
            instructions = f.read()
    except FileNotFoundError:
        return "Error: 'utils/instructions.txt' not found. Please create it."

    uploaded_file = None
    try:
        uploaded_file = upload_pdf_to_genai(pdf_path)
        review_content = generate_review_from_ai(uploaded_file, prompt, instructions)
        return review_content
    except Exception as e:
        return f"Error: Failed to process resume. Details: {e}"
    finally:
        if uploaded_file:
            try:
                genai.delete_file(uploaded_file.name)
            except Exception as e:
                print(f"Warning: Failed to delete uploaded file from GenAI servers: {e}")

        try:
            if os.path.exists(pdf_path):
                os.remove(pdf_path)
        except Exception as e:
            print(f"Warning: Failed to delete local PDF file: {e}")
