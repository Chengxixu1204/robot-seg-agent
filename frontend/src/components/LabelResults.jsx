import { useRef, useEffect, useState } from "react";
import SegmentCard from "./SegmentCard";

export default function LabelResults({ segments }) {
  const trackRef = useRef();
  const [cardWidth, setCardWidth] = useState(0);

  useEffect(() => {
    if (trackRef.current && segments.length) {
      const firstItem = trackRef.current.querySelector(".carousel-item");
      if (firstItem) {
        setCardWidth(firstItem.getBoundingClientRect().width);
      }
    }
  }, [segments]);

  const scrollByCard = (direction) => {
    trackRef.current.scrollBy({
      left: direction * cardWidth,
      behavior: "smooth",
    });
  };

  if (!segments.length) return null;

  return (
    <section className="clips-section">
      {/* Clipped Videos Title */}
      <h2 className="clipped-title">Clipped Videos</h2>

      <div className="carousel-container">
        <div className="carousel-nav">
          <button onClick={() => scrollByCard(-1)}>&larr; Prev</button>
          <button onClick={() => scrollByCard(1)}>Next &rarr;</button>
        </div>

        <div className="carousel-track" ref={trackRef}>
          {segments.map((segment, idx) => (
            <div
              className="carousel-item"
              key={idx}
              style={{ minWidth: "100%", maxWidth: "800px", margin: "0 auto" }}
            >
              <SegmentCard segment={segment} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
