# backend/app/main.py

from fastapi import FastAPI, UploadFile, File, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.pipeline import analyze_and_label_video
import tempfile
import os
import requests
import shutil

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve video clips
app.mount("/clips", StaticFiles(directory="clips"), name="clips")


@app.post("/analyze")
async def analyze_video(file: UploadFile = File(...)):
    """Process uploaded video file."""
    suffix = os.path.splitext(file.filename)[1]
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            shutil.copyfileobj(file.file, temp_file)
            temp_path = temp_file.name

        segments = analyze_and_label_video(temp_path, threshold=20.0, model="gpt-4o")
        return {"segments": segments}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video processing failed: {e}")

    finally:
        try:
            os.remove(temp_path)
        except Exception:
            pass


@app.post("/analyze-url")
async def analyze_video_url(url: str = Body(..., embed=True)):
    """Download and process video from URL."""
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to download video: {e}")

    suffix = ".mp4"
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            for chunk in response.iter_content(chunk_size=8192):
                temp_file.write(chunk)
            temp_path = temp_file.name

        segments = analyze_and_label_video(temp_path, threshold=20.0, model="gpt-4o")
        return {"segments": segments}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video processing failed: {e}")

    finally:
        try:
            os.remove(temp_path)
        except Exception:
            pass
