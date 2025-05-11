export default function SegmentCard({ segment }) {
    const { start, end, description, filename } = segment;
    const src = `http://127.0.0.1:8000/clips/${filename}`;
  
    return (
      <div className="segment-card">
        <div className="video-frame-wrapper">
          <video src={src} controls />
        </div>
        <div className="segment-label-box">
          <p className="segment-time">
            {start.toFixed(2)}s – {end?.toFixed(2) || "end"}s
          </p>
          <p className="segment-description">{description}</p>
        </div>
      </div>
    );
  }
  