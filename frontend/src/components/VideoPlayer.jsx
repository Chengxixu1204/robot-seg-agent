export default function VideoPlayer({ src }) {
    return (
      <video
        src={src}
        controls
        className="w-full border border-gray-300 rounded-md"
      />
    );
  }
  