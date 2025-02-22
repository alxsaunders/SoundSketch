import React, { useState } from "react";
import axios from "axios";

const Youtube2Mp3 = () => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [downloadLink, setDownloadLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Styles to match the Music Tools Hub theme
  const containerStyle = {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: 'white'
  };

  const inputGroupStyle = {
    width: '100%',
    display: 'flex',
    gap: '10px',
    marginBottom: '15px'
  };

  const inputStyle = {
    flex: 1,
    padding: '12px 15px',
    borderRadius: '8px',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    backgroundColor: 'white',
    color: '#555',
    fontSize: '16px',
    fontWeight: '400'
  };

  const buttonStyle = {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px',
    minWidth: '140px',
    transition: 'background-color 0.2s'
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    cursor: 'not-allowed',
    opacity: 0.7
  };

  const errorStyle = {
    color: 'rgba(255, 200, 200, 1)',
    margin: '10px 0',
    padding: '8px 12px',
    backgroundColor: 'rgba(255, 0, 0, 0.15)',
    borderRadius: '6px',
    width: '100%',
    textAlign: 'center'
  };

  const loadingStyle = {
    color: 'white',
    margin: '15px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const successStyle = {
    margin: '15px 0',
    padding: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    textAlign: 'center',
    width: '100%'
  };

  const downloadLinkStyle = {
    color: 'white',
    fontWeight: 'bold',
    textDecoration: 'underline',
    display: 'inline-block',
    marginTop: '8px',
    padding: '8px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '6px',
    transition: 'background-color 0.2s'
  };

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
    <div style={containerStyle}>
      <div style={inputGroupStyle}>
        <input
          type="text"
          placeholder="Enter YouTube URL..."
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          style={inputStyle}
        />
        <button
          onClick={handleConvert}
          disabled={loading}
          style={loading ? disabledButtonStyle : buttonStyle}
        >
          {loading ? "Converting..." : "Convert"}
        </button>
      </div>
      
      {error && <div style={errorStyle}>{error}</div>}
      
      {loading && (
        <div style={loadingStyle}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '3px solid rgba(255, 255, 255, 0.3)',
            borderTop: '3px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginRight: '10px'
          }}></div>
          Converting video to MP3...
        </div>
      )}
      
      {downloadLink && (
        <div style={successStyle}>
          <p>Conversion successful!</p>
          <a 
            href={downloadLink}
            style={downloadLinkStyle}
            download
          >
            Download MP3
          </a>
        </div>
      )}
      
      {/* Animation for the loader */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};

export default Youtube2Mp3;