import { useState } from "react";
import UploadForm from "./components/UploadForm";
import LabelResults from "./components/LabelResults";
import "./styles.css";

export default function App() {
  const [videoSrc, setVideoSrc] = useState(null);
  const [segments, setSegments] = useState([]);

  return (
    <div className="dashboard-container">
      <header className="header">
        <h1 className="app-title">🎬 AI Video Segment Labeler</h1>
        <p className="app-subtitle">
          Upload a video to detect scenes and get AI-generated labels instantly.
        </p>
      </header>

      <main className="main-content">
        <UploadForm setVideoSrc={setVideoSrc} setSegments={setSegments} />

        {videoSrc && (
          <section className="video-preview-box">
            <h2 className="video-preview-title">Original Video</h2>
            <div className="video-preview-wrapper">
              <video src={videoSrc} controls />
            </div>
          </section>
        )}

        <LabelResults segments={segments} />
      </main>
    </div>
  );
}
