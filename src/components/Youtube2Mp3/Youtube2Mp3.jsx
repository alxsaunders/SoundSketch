import React, { useState } from "react";
import axios from "axios";

const Youtube2Mp3 = () => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [downloadLink, setDownloadLink] = useState(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingTitle, setFetchingTitle] = useState(false);
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
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '15px'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 15px',
    borderRadius: '8px',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    backgroundColor: 'white',
    color: '#555',
    fontSize: '16px',
    fontWeight: '400',
    boxSizing: 'border-box'
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px',
    minHeight: '48px',
    transition: 'background-color 0.2s',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'rgba(255, 255, 255, 0.3)'
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
    textAlign: 'center',
    boxSizing: 'border-box'
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
    width: '100%',
    boxSizing: 'border-box'
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

  const videoTitleStyle = {
    color: 'white',
    fontSize: '14px',
    margin: '10px 0',
    padding: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    fontStyle: 'italic',
    textAlign: 'center',
    wordBreak: 'break-word'
  };

  const spinnerStyle = {
    width: '20px',
    height: '20px',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    borderTop: '3px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginRight: '10px'
  };

  // Helper function to clean title for display and download
  const cleanTitleForDisplay = (title) => {
    return title.replace(/🎵/g, '').trim(); // Remove music emoji but keep other characters for display
  };

  const cleanTitleForDownload = (title) => {
    return title
      .replace(/[🎵🎶🎤🎧🔥💯👑]/g, '') // Remove emojis
      .replace(/[\/\\?%*:|"<>]/g, '') // Remove invalid filename characters
      .replace(/["'"]/g, '') // Remove quotes
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim(); // Remove leading/trailing spaces
  };

  // Extract video ID from YouTube URL
  const extractVideoId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Get title using YouTube oEmbed API (no API key required)
  const getTitleFromOEmbed = async (videoId) => {
    try {
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (response.ok) {
        const data = await response.json();
        return data.title;
      }
    } catch (error) {
      console.error('oEmbed failed:', error);
    }
    return null;
  };

  // Backup method: scrape page title
  const getTitleFromPage = async (url) => {
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      const data = await response.json();
      
      if (data.contents) {
        const titleMatch = data.contents.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
          return titleMatch[1].replace(' - YouTube', '').trim();
        }
      }
    } catch (error) {
      console.error('Page scraping failed:', error);
    }
    return null;
  };

  // Convert to MP3 with automatic title fetching
  const handleConvert = async () => {
    if (!youtubeUrl.trim()) {
      setError("Please provide a valid YouTube URL.");
      return;
    }

    setError("");
    setDownloadLink(null);

    // First, try to get the title
    if (!videoTitle) {
      setFetchingTitle(true);
      const videoId = extractVideoId(youtubeUrl);
      
      if (videoId) {
        try {
          // Try oEmbed first
          let title = await getTitleFromOEmbed(videoId);
          
          // If oEmbed fails, try page scraping
          if (!title) {
            title = await getTitleFromPage(youtubeUrl);
          }

          if (title) {
            setVideoTitle(title);
          }
        } catch (err) {
          console.error('Error fetching title:', err);
          // Continue with conversion even if title fetch fails
        }
      }
      setFetchingTitle(false);
    }

    // Then proceed with conversion
    setLoading(true);

    try {
      console.log('Sending request to backend with URL:', youtubeUrl);
      const response = await axios.post("http://localhost:3001/convert", {
        url: youtubeUrl,
      });
      console.log('Received response:', response.data);
      
      if (response.data.success && response.data.downloadPath) {
        setDownloadLink(response.data.downloadPath);
        // Update title if we got one from the backend and don't have one already
        if (response.data.title && response.data.title !== "Unknown Title" && !videoTitle) {
          setVideoTitle(response.data.title);
        }
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

  const handleUrlChange = (e) => {
    setYoutubeUrl(e.target.value);
    // Clear previous results when URL changes
    if (videoTitle || downloadLink) {
      setVideoTitle("");
      setDownloadLink(null);
      setError("");
    }
  };

  return (
    <div style={containerStyle}>
      <div style={inputGroupStyle}>
        <input
          type="text"
          placeholder="Enter YouTube URL..."
          value={youtubeUrl}
          onChange={handleUrlChange}
          style={inputStyle}
        />
        
        <button
          onClick={handleConvert}
          disabled={loading || fetchingTitle || !youtubeUrl.trim()}
          style={loading || fetchingTitle || !youtubeUrl.trim() ? disabledButtonStyle : primaryButtonStyle}
        >
          {fetchingTitle ? (
            <>
              <div style={spinnerStyle}></div>
              Getting Title...
            </>
          ) : loading ? (
            <>
              <div style={spinnerStyle}></div>
              Converting...
            </>
          ) : (
            "Convert to MP3"
          )}
        </button>
      </div>
      
      {error && <div style={errorStyle}>{error}</div>}
      
      {loading && (
        <div style={loadingStyle}>
          <div style={spinnerStyle}></div>
          Converting video to MP3...
        </div>
      )}
      
      {videoTitle && (
        <div style={videoTitleStyle}>
          🎵 "{cleanTitleForDisplay(videoTitle)}"
        </div>
      )}
      
      {downloadLink && (
        <div style={successStyle}>
          <p>Conversion successful!</p>
          <a 
            href={downloadLink}
            style={downloadLinkStyle}
            download={videoTitle ? `${cleanTitleForDownload(videoTitle)}.mp3` : undefined}
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