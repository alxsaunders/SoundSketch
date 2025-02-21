import React, { useState, useRef } from 'react';
import { Upload, Music, Loader, Info } from 'lucide-react';

const SongKeyAnalyzer = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      setError(null);
      setResult(null);
    } else if (file) {
      setError('Please select a valid audio file');
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
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Draw bars
    chromaValues.forEach((item, i) => {
      const x = i * barWidth;
      const barHeight = item.intensity * (height - 40);

      // Draw bar
      ctx.fillStyle = `hsl(${i * 30}, 70%, 50%)`;
      ctx.fillRect(x, height - barHeight - 20, barWidth - 2, barHeight);

      // Draw note name
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(pitches[i], x + barWidth / 2, height - 5);

      // Draw percentage
      ctx.fillStyle = '#334155';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(item.intensity * 100)}%`, x + barWidth / 2, height - barHeight - 25);
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Music className="w-6 h-6 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-800">Song Key Analyzer</h2>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">WAV, MP3, or OGG (max 10MB)</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="audio/*"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {audioFile && (
            <div className="text-sm text-gray-600 flex items-center">
              <Info className="w-4 h-4 mr-1 text-blue-500" />
              Selected file: {audioFile.name} ({(audioFile.size / (1024 * 1024)).toFixed(2)} MB)
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!audioFile || isAnalyzing}
            className={`w-full py-2 px-4 rounded-md font-medium text-white transition-colors duration-200 flex items-center justify-center
              ${!audioFile || isAnalyzing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isAnalyzing ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Key'
            )}
          </button>

          {error && (
            <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded relative text-sm">
              {error}
            </div>
          )}

          {result && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Detected Key:</h3>
                <p className="text-3xl font-bold text-blue-600 mt-1">{result.mainKey.key}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Correlation: {result.mainKey.correlation.toFixed(3)}
                </p>

                {result.alternateKey && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-700">Alternate key: {result.alternateKey.key}</p>
                    <p className="text-xs text-gray-600">
                      Correlation: {result.alternateKey.correlation.toFixed(3)}
                    </p>
                  </div>
                )}

                {result.tempo && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-700">Estimated tempo: {result.tempo} BPM</p>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-800 mb-2">Pitch Class Distribution</h4>
                <canvas 
                  ref={canvasRef}
                  width="500"
                  height="200"
                  className="mx-auto border rounded bg-white"
                />
              </div>

              <div className="mt-6 text-sm text-gray-600">
                <h4 className="font-semibold mb-2">Top 5 Key Matches:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {result.correlations.slice(0, 5).map((corr, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{corr.key}</span>
                      <span className="font-mono">{corr.correlation.toFixed(3)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SongKeyAnalyzer;