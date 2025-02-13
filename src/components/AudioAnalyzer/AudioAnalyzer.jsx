import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

const AudioAnalyzer = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [key, setKey] = useState(null);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const audioContext = useRef(null);

  // YIN algorithm threshold
  const YIN_THRESHOLD = 0.1;

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      setError(null);
      setKey(null);
      setDebugInfo(null);
    } else {
      setError('Please select a valid audio file');
    }
  };

  // YIN pitch detection algorithm
  const detectPitch = (buffer, sampleRate) => {
    const bufferLength = buffer.length;
    const yinBuffer = new Float32Array(bufferLength / 2);
    
    // Step 1: Autocorrelation
    for (let t = 0; t < yinBuffer.length; t++) {
      yinBuffer[t] = 0;
      for (let i = 0; i < yinBuffer.length; i++) {
        const diff = buffer[i] - buffer[i + t];
        yinBuffer[t] += diff * diff;
      }
    }

    // Step 2: Cumulative mean normalized difference
    let runningSum = 0;
    yinBuffer[0] = 1;
    for (let t = 1; t < yinBuffer.length; t++) {
      runningSum += yinBuffer[t];
      yinBuffer[t] = yinBuffer[t] * t / runningSum;
    }

    // Step 3: Absolute threshold
    let tau = 0;
    let minValue = Infinity;
    for (let t = 2; t < yinBuffer.length; t++) {
      if (yinBuffer[t] < minValue) {
        minValue = yinBuffer[t];
        tau = t;
      }
      if (minValue < YIN_THRESHOLD) {
        break;
      }
    }

    // Step 4: Parabolic interpolation
    if (tau !== 0 && tau < yinBuffer.length - 1) {
      const alpha = yinBuffer[tau - 1];
      const beta = yinBuffer[tau];
      const gamma = yinBuffer[tau + 1];
      const peak = 0.5 * (alpha - gamma) / (alpha - 2 * beta + gamma);
      tau = tau + peak;
    }

    return sampleRate / tau;
  };

  // Function to get note from frequency
  const getNote = (frequency) => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const a4 = 440;
    const c0 = a4 * Math.pow(2, -4.75);
    const halfStepsBelowMiddleC = Math.round(12 * Math.log2(frequency / c0));
    const octave = Math.floor(halfStepsBelowMiddleC / 12);
    const noteIndex = halfStepsBelowMiddleC % 12;
    return {
      note: notes[noteIndex],
      octave: octave,
      frequency: frequency
    };
  };

  const analyzeKey = async () => {
    if (!audioFile) return;

    try {
      setIsAnalyzing(true);
      setError(null);
      setDebugInfo(null);

      // Initialize audio context
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const arrayBuffer = await audioFile.arrayBuffer();
      const audioBuffer = await audioContext.current.decodeAudioData(arrayBuffer);
      
      // Create audio nodes
      const source = audioContext.current.createBufferSource();
      const analyser = audioContext.current.createAnalyser();
      
      source.buffer = audioBuffer;
      source.connect(analyser);
      analyser.connect(audioContext.current.destination);
      
      // Set up analyzer node
      analyser.fftSize = 2048;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Float32Array(bufferLength);

      // Process audio in chunks
      const sampleRate = audioBuffer.sampleRate;
      const channelData = audioBuffer.getChannelData(0);
      const chunkSize = Math.floor(sampleRate / 10); // 100ms chunks
      const chunks = Math.floor(channelData.length / chunkSize);
      
      const pitchCounts = new Map();
      const debugNotes = [];

      // Analyze chunks
      for (let i = 0; i < chunks; i++) {
        const chunk = channelData.slice(i * chunkSize, (i + 1) * chunkSize);
        
        // Calculate RMS of chunk to check if it's not silence
        const rms = Math.sqrt(chunk.reduce((acc, val) => acc + val * val, 0) / chunk.length);
        
        if (rms > 0.01) { // Skip silent parts
          const frequency = detectPitch(chunk, sampleRate);
          
          if (frequency && frequency > 50 && frequency < 2000) {
            const noteInfo = getNote(frequency);
            const noteKey = `${noteInfo.note}`;
            
            pitchCounts.set(noteKey, (pitchCounts.get(noteKey) || 0) + 1);
            debugNotes.push({
              time: i * (chunkSize / sampleRate),
              ...noteInfo
            });
          }
        }
      }

      // Find the most common notes
      const sortedNotes = Array.from(pitchCounts.entries())
        .sort((a, b) => b[1] - a[1]);

      // Determine if major or minor based on the interval pattern
      let possibleKeys = new Map();
      
      for (const [baseNote] of sortedNotes.slice(0, 3)) {
        // Check for major third and perfect fifth
        const majorThird = sortedNotes.some(([note]) => {
          const interval = (getNote(440).note.indexOf(note) - getNote(440).note.indexOf(baseNote) + 12) % 12;
          return interval === 4;
        });
        
        const perfectFifth = sortedNotes.some(([note]) => {
          const interval = (getNote(440).note.indexOf(note) - getNote(440).note.indexOf(baseNote) + 12) % 12;
          return interval === 7;
        });

        if (majorThird && perfectFifth) {
          possibleKeys.set(`${baseNote} Major`, pitchCounts.get(baseNote));
        } else {
          possibleKeys.set(`${baseNote} Minor`, pitchCounts.get(baseNote));
        }
      }

      // Sort possible keys by count
      const sortedKeys = Array.from(possibleKeys.entries())
        .sort((a, b) => b[1] - a[1]);

      setKey(sortedKeys[0][0]);
      setDebugInfo({
        noteDistribution: Object.fromEntries(pitchCounts),
        analyzedChunks: chunks,
        topNotes: sortedNotes.slice(0, 5),
        possibleKeys: sortedKeys
      });

    } catch (err) {
      setError('Error analyzing audio: ' + err.message);
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Audio Key Analyzer</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">WAV, MP3, or OGG</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="audio/*"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {audioFile && (
            <div className="text-sm text-gray-500">
              Selected file: {audioFile.name}
            </div>
          )}

          <button
            onClick={analyzeKey}
            disabled={!audioFile || isAnalyzing}
            className={`w-full py-2 px-4 rounded-md font-medium text-white transition-colors duration-200
              ${!audioFile || isAnalyzing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Key'}
          </button>

          {error && (
            <div className="text-red-500 text-sm py-2">{error}</div>
          )}

          {key && (
            <div className="text-center py-4">
              <h3 className="text-lg font-semibold text-gray-800">Detected Key:</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{key}</p>
              
              {debugInfo && (
                <div className="mt-4 text-left text-sm text-gray-600">
                  <p className="font-semibold">Top 5 detected notes:</p>
                  <ul className="list-disc pl-5">
                    {debugInfo.topNotes.map(([note, count], i) => (
                      <li key={i}>{note}: {count} occurrences</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioAnalyzer;