import os
from fastapi import FastAPI, UploadFile, Form, File, HTTPException
from fastapi.responses import JSONResponse
from resume_reviewer import process_resume
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VALID_AUTH_KEY = "7YEl59RuVweFVE92CFAI6w"
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.post("/process/")
async def process_request(
    auth_key: str = Form(...), 
    pdf: UploadFile = File(...), 
    text: str = Form(...)
):
    if auth_key != VALID_AUTH_KEY:
        raise HTTPException(status_code=401, detail="Invalid authentication key")

    file_path = os.path.join(UPLOAD_FOLDER, pdf.filename)
    with open(file_path, "wb") as f:
        f.write(await pdf.read())

    review_content = process_resume(file_path, text)

    return JSONResponse({
        "message": "Resume review generated",
        "review": review_content
    })

if __name__ == "__main__":
    import uvicorn
    print("Server running at http://127.0.0.1:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
