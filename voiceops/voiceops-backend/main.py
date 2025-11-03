"""
reVoiced Backend - Simple FastAPI application
"""
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from pathlib import Path
from dotenv import load_dotenv
from api.TranscribeWhisper import transcribe_audio

# Load environment variables from .env file
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

# Initialize FastAPI app
app = FastAPI(title="reVoiced API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "reVoiced API is running!"}

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.post("/api/v1/save-audio")
async def save_audio(file: UploadFile = File(...)):
    """Save uploaded audio file as audio.mp3 or audio.wav in api folder"""
    try:
        api_folder = Path(__file__).resolve().parent / "api"
        # Use original filename extension or default to .mp3
        filename = file.filename or "audio.mp3"
        # Extract extension
        ext = Path(filename).suffix.lower()
        if ext in ['.wav', '.wave']:
            audio_path = api_folder / "audio.wav"
        elif ext in ['.webm']:
            audio_path = api_folder / "audio.webm"
        else:
            audio_path = api_folder / "audio.mp3"
        
        # Read file content
        content = await file.read()
        
        # Remove stale audio files with other extensions to avoid picking old files
        try:
            for other_ext in [".mp3", ".wav", ".webm"]:
                candidate = api_folder / f"audio{other_ext}"
                if candidate != audio_path and candidate.exists():
                    candidate.unlink(missing_ok=True)
        except Exception:
            pass
        
        # Save to audio.mp3 or audio.wav based on file type
        with open(audio_path, "wb") as f:
            f.write(content)
        
        file_size = len(content)
        print(f"Saved audio file: {audio_path} ({file_size} bytes, extension: {ext})")
        
        return {"message": "Audio file saved successfully", "path": str(audio_path), "size": file_size}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save audio: {str(e)}")


@app.post("/api/v1/transcribe")
async def transcribe():
    """Run TranscribeWhisper.py script to transcribe audio.mp3 or audio.wav"""
    try:
        text = transcribe_audio()
        return {"text": text}
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=f"Audio file not found: {str(e)}")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        import traceback
        error_detail = f"Transcription failed: {str(e)}\n{traceback.format_exc()}"
        raise HTTPException(status_code=500, detail=error_detail)
