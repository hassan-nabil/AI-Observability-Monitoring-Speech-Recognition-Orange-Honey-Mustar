
import os, pathlib
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables from backend root .env (one level up from api/)
load_dotenv(dotenv_path=pathlib.Path(__file__).resolve().parents[1] / '.env')

# Initialize client from OPENAI_API_KEY in env
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Path to your audio file (e.g., .mp3, .wav, .m4a)
audio_path = "audio.mp3"

# Open the file in binary mode
with open(audio_path, "rb") as audio_file:
    # Send to Whisper model
    transcript = client.audio.transcriptions.create(
        model="gpt-4o-mini-transcribe",  # Whisper model
        file=audio_file
    )

# Print the transcribed text
print("Transcribed text:")
print(transcript.text)
