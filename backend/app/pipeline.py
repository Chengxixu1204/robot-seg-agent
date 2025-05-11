# backend/app/pipeline.py

import os
import base64
import logging
import ffmpeg
import openai
from scenedetect import VideoManager, SceneManager
from scenedetect.detectors import ContentDetector

# Setup
logging.basicConfig(level=logging.INFO)
openai.api_key = os.getenv("OPENAI_API_KEY")

def detect_scenes(input_path, threshold=30.0):
    """Detect scene boundaries based on content changes."""
    video_manager = VideoManager([input_path])
    scene_manager = SceneManager()
    scene_manager.add_detector(ContentDetector(threshold=threshold))
    video_manager.start()
    scene_manager.detect_scenes(video_manager)
    scenes = scene_manager.get_scene_list()
    video_manager.release()
    return [(scene[0].get_seconds(), scene[1].get_seconds()) for scene in scenes]

def fallback_fixed_scenes(video_path, clip_length=5.0):
    """Fallback: evenly split video into fixed-length clips."""
    try:
        info = ffmpeg.probe(video_path)
        duration = float(info['format']['duration'])
    except Exception:
        return [(0.0, None)]
    return [(start, min(start + clip_length, duration)) for start in range(0, int(duration), int(clip_length))]

def split_into_clips(input_path, scenes, output_dir='clips'):
    """Trim scenes into individual video clips."""
    os.makedirs(output_dir, exist_ok=True)
    clip_paths = []
    for idx, (start, end) in enumerate(scenes):
        filename = f"clip_{idx:03d}.mp4"
        output_path = os.path.join(output_dir, filename)
        stream = ffmpeg.input(input_path, ss=start, to=end if end else None)
        stream.output(output_path, c='copy').overwrite_output().run(quiet=True)
        clip_paths.append(output_path)
    return clip_paths

def label_clip(clip_path, model):
    """Extract middle frame and send to OpenAI for description."""
    try:
        info = ffmpeg.probe(clip_path)
        duration = float(info['format']['duration'])
    except Exception:
        duration = None

    timestamp = duration / 2 if duration else 0
    frame_path = clip_path.replace(".mp4", "_frame.png")
    ffmpeg.input(clip_path, ss=timestamp).output(frame_path, vframes=1).overwrite_output().run(quiet=True)

    with open(frame_path, "rb") as f:
        image_base64 = base64.b64encode(f.read()).decode("utf-8")
    os.remove(frame_path)

    try:
        response = openai.ChatCompletion.create(
            model=model,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Describe what is happening in this frame."},
                        {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image_base64}"}}
                    ]
                }
            ]
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logging.error(f"OpenAI API error: {e}")
        return "Description unavailable"

def analyze_and_label_video(video_path, threshold=15.0, model="gpt-4o"):
    """Main entry: segment video and label each clip."""
    scenes = detect_scenes(video_path, threshold)
    if len(scenes) < 1:
        scenes = fallback_fixed_scenes(video_path, clip_length=5.0)
    clips = split_into_clips(video_path, scenes)
    results = []
    for (start, end), clip in zip(scenes, clips):
        desc = label_clip(clip, model)
        results.append({
            "start": start,
            "end": end,
            "description": desc,
            "filename": os.path.basename(clip)
        })
    return results
