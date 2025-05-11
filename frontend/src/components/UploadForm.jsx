// src/components/UploadForm.jsx
import { useRef, useState } from "react";
import axios from "axios";

export default function UploadForm({ setVideoSrc, setSegments }) {
  const fileInput = useRef();
  const [videoUrl, setVideoUrl] = useState("");
  const [fileLoading, setFileLoading] = useState(false);
  const [urlLoading, setUrlLoading] = useState(false);
  const [message, setMessage] = useState(null);       

  const clearMessage = () => {
    setTimeout(() => setMessage(null), 3000);
  };

  const handleUpload = async () => {
    const file = fileInput.current.files[0];
    if (!file) {
      setMessage({ type: "error", text: "Please choose a file first." });
      clearMessage();
      return;
    }

    setVideoSrc(URL.createObjectURL(file));
    setSegments([]);
    setFileLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await axios.post(
        "http://127.0.0.1:8000/analyze",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setSegments(data.segments);
      setMessage({ type: "success", text: "Video analyzed successfully!" });
    } catch {
      setMessage({ type: "error", text: "Failed to analyze video." });
    } finally {
      setFileLoading(false);
      clearMessage();
    }
  };

  const handleUrlSubmit = async () => {
    if (!videoUrl.trim()) {
      setMessage({ type: "error", text: "Please enter a video URL." });
      clearMessage();
      return;
    }

    setVideoSrc(videoUrl);
    setSegments([]);
    setUrlLoading(true);

    try {
      const { data } = await axios.post(
        "http://127.0.0.1:8000/analyze-url",
        { url: videoUrl },
        { headers: { "Content-Type": "application/json" } }
      );
      setSegments(data.segments);
      setMessage({ type: "success", text: "Video URL analyzed successfully!" });
    } catch {
      setMessage({ type: "error", text: "Failed to analyze video URL." });
    } finally {
      setUrlLoading(false);
      clearMessage();
    }
  };

  return (
    <div className="upload-box">
      {message && (
        <div className={`toast ${message.type}`}>{message.text}</div>
      )}

      <div className="form-row">
        <label htmlFor="file-input">Choose an MP4 Video:</label>
        <div className="form-controls">
          <input
            id="file-input"
            type="file"
            ref={fileInput}
            accept="video/mp4"
          />
          <button onClick={handleUpload} disabled={fileLoading}>
            {fileLoading ? "Analyzing..." : "Upload & Analyze"}
          </button>
        </div>
      </div>

      <div className="form-row">
        <label htmlFor="url-input">Or paste a video URL:</label>
        <div className="form-controls">
          <input
            id="url-input"
            className="url-input"
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://example.com/video.mp4"
          />
          <button onClick={handleUrlSubmit} disabled={urlLoading}>
            {urlLoading ? "Analyzing..." : "Analyze from URL"}
          </button>
        </div>
      </div>
    </div>
  );
}
