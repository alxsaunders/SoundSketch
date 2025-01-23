import React, { useState } from "react";
import axios from "axios";

const Youtube2Mp3 = () => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [downloadLink, setDownloadLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConvert = async () => {
    if (!youtubeUrl.trim()) {
      setError("Please provide a valid YouTube URL.");
      return;
    }

    setError("");
    setLoading(true);
    setDownloadLink(null);

    try {
      console.log('Sending request to backend with URL:', youtubeUrl);
      const response = await axios.post("http://localhost:3001/convert", {
        url: youtubeUrl,
      });
      console.log('Received response:', response.data);
      
      if (response.data.success && response.data.downloadPath) {
        setDownloadLink(response.data.downloadPath);
      } else {
        setError("Conversion failed. Please try again.");
      }
    } catch (err) {
      console.error('Detailed error:', err.response || err);
      setError("Failed to convert the video. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 font-sans">
      <h1 className="text-2xl font-bold mb-4">YouTube to MP3 Converter</h1>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter YouTube URL..."
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={handleConvert}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          {loading ? "Converting..." : "Convert"}
        </button>
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {loading && <p className="mt-2">Converting video to MP3...</p>}
      {downloadLink && (
        <p className="mt-2">
          Conversion successful!{" "}
          <a 
            href={downloadLink}
            className="text-blue-500 hover:underline"
            download
          >
            Download MP3
          </a>
        </p>
      )}
    </div>
  );
};

export default Youtube2Mp3;