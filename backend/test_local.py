# backend/test_local.py

import os
from app.pipeline import analyze_and_label_video

if __name__ == "__main__":
    os.environ["OPENAI_API_KEY"] = "sk-..."  # Replace with your key or set it via terminal
    video_path = "data/red_green_test.mp4"
    segments = analyze_and_label_video(video_path, threshold=20.0, model="gpt-4o")
    
    for seg in segments:
        start = f"{seg['start']:.2f}"
        end = f"{seg['end']:.2f}" if seg['end'] is not None else "end"
        print(f"{start}s - {end}s: {seg['description']}")
