import React, { useState, useRef } from 'react';
import { Upload, Music, Loader, Info } from 'lucide-react';

const SongKeyAnalyzer = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false); // Added for drag feedback
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Styles matching the Music Tools Hub theme
  const containerStyle = {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: 'white'
  };

  const sectionStyle = {
    width: '100%',
    marginBottom: '20px'
  };

  const uploadLabelStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '150px',
    border: `2px dashed ${isDragOver ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.5)'}`, // Dynamic border
    borderRadius: '12px',
    cursor: 'pointer',
    backgroundColor: isDragOver ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)', // Dynamic background
    transition: 'all 0.2s ease',
    padding: '15px',
    marginBottom: '15px',
    boxSizing: 'border-box'
  };

  const uploadTextStyle = {
    fontSize: '16px',
    color: 'white',
    marginBottom: '8px',
    textAlign: 'center'
  };

  const uploadSubTextStyle = {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center'
  };

  const buttonStyle = {
    width: '100%',
    padding: '14px 24px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
    margin: '15px 0',
    boxSizing: 'border-box'
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    cursor: 'not-allowed',
    opacity: 0.7
  };

  const fileInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.9)',
    padding: '8px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    marginTop: '10px',
    boxSizing: 'border-box'
  };

  const errorStyle = {
    width: '100%',
    padding: '10px 15px',
    backgroundColor: 'rgba(255, 100, 100, 0.2)',
    border: '1px solid rgba(255, 100, 100, 0.3)',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    marginTop: '10px',
    boxSizing: 'border-box'
  };

  const resultContainerStyle = {
    width: '100%',
    padding: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    marginTop: '20px',
    boxSizing: 'border-box'
  };

  const resultHeaderStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '15px',
    textAlign: 'center'
  };

  const resultKeyStyle = {
    fontSize: '36px',
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    margin: '10px 0'
  };

  const resultSubTextStyle = {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    margin: '5px 0'
  };

  const canvasContainerStyle = {
    width: '100%',
    marginTop: '20px',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    padding: '10px',
    boxSizing: 'border-box'
  };

  const correlationListStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    marginTop: '15px'
  };

  // Handle file selection (both click and drag)
  const handleFileSelection = (file) => {
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      setError(null);
      setResult(null);
    } else if (file) {
      setError('Please select a valid audio file (MP3, WAV, OGG, etc.)');
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    handleFileSelection(file);
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set drag over to false if we're leaving the upload area entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!audioFile) return;

    setIsAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append('audio', audioFile);

    try {
      const response = await fetch('http://127.0.0.1:5000/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze audio');
      }

      setResult(data);
      setTimeout(() => {
        drawChromagram(data.chromaValues);
      }, 100);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const drawChromagram = (chromaValues) => {
    if (!canvasRef.current || !chromaValues) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / 12;
    const pitches = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, width, height);

    // Draw bars
    chromaValues.forEach((item, i) => {
      const x = i * barWidth;
      const barHeight = item.intensity * (height - 40);

      // Draw bar with colors that match our theme
      ctx.fillStyle = `hsl(${i * 30}, 80%, 60%)`;
      ctx.fillRect(x, height - barHeight - 20, barWidth - 2, barHeight);

      // Draw note name
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(pitches[i], x + barWidth / 2, height - 5);

      // Draw percentage
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(item.intensity * 100)}%`, x + barWidth / 2, height - barHeight - 25);
    });
  };

  return (
    <div style={containerStyle}>
      <div style={sectionStyle}>
        <label 
          style={uploadLabelStyle} 
          onClick={() => fileInputRef.current.click()}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Upload style={{ color: 'white', marginBottom: '10px' }} size={30} />
          <p style={uploadTextStyle}>
            <span style={{ fontWeight: 'bold' }}>
              {isDragOver ? 'Drop your audio file here' : 'Click to upload or drag and drop'}
            </span>
          </p>
          <p style={uploadSubTextStyle}>WAV, MP3, or OGG files (max 10MB)</p>
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: 'none' }}
            accept="audio/*"
            onChange={handleFileChange}
          />
        </label>

        {audioFile && (
          <div style={fileInfoStyle}>
            <Info size={16} style={{ marginRight: '8px', color: 'white' }} />
            Selected file: {audioFile.name} ({(audioFile.size / (1024 * 1024)).toFixed(2)} MB)
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!audioFile || isAnalyzing}
          style={!audioFile || isAnalyzing ? disabledButtonStyle : buttonStyle}
        >
          {isAnalyzing ? (
            <>
              <Loader size={20} style={{ marginRight: '10px', animation: 'spin 1s linear infinite' }} />
              Analyzing...
            </>
          ) : (
            'Analyze Key'
          )}
        </button>

        {error && (
          <div style={errorStyle}>
            {error}
          </div>
        )}
      </div>

      {result && (
        <div style={resultContainerStyle}>
          <h3 style={resultHeaderStyle}>Detected Key:</h3>
          <p style={resultKeyStyle}>{result.mainKey.key}</p>
          <p style={resultSubTextStyle}>
            Correlation: {result.mainKey.correlation.toFixed(3)}
          </p>

          {result.alternateKey && (
            <div style={{ textAlign: 'center', margin: '15px 0' }}>
              <p style={{ fontSize: '16px', color: 'white' }}>Alternate key: {result.alternateKey.key}</p>
              <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
                Correlation: {result.alternateKey.correlation.toFixed(3)}
              </p>
            </div>
          )}

          {result.tempo && (
            <div style={{ textAlign: 'center', margin: '15px 0' }}>
              <p style={{ fontSize: '16px', color: 'white' }}>Estimated tempo: {result.tempo} BPM</p>
            </div>
          )}

          <div style={canvasContainerStyle}>
            <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', marginBottom: '10px' }}>
              Pitch Class Distribution
            </h4>
            <canvas 
              ref={canvasRef}
              width="400"
              height="200"
              style={{ width: '100%', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginTop: '20px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', marginBottom: '10px' }}>
              Top 5 Key Matches:
            </h4>
            <div style={correlationListStyle}>
              {result.correlations.slice(0, 5).map((corr, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: 'white' }}>
                  <span>{corr.key}</span>
                  <span style={{ fontFamily: 'monospace' }}>{corr.correlation.toFixed(3)}</span>
                </div>
              ))}
            </div>
          </div>
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

export default SongKeyAnalyzer;