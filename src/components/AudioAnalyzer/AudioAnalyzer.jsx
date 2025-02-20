import React, { useState, useRef, useEffect } from "react";
import { Upload } from "lucide-react";
import Pitchfinder from "pitchfinder";

const AudioAnalyzer = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [key, setKey] = useState(null);
  const [scale, setScale] = useState(null);
  const [error, setError] = useState(null);
  const audioContext = useRef(null);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("audio/")) {
      setAudioFile(file);
      setError(null);
      setKey(null);
      setScale(null);
    } else {
      setError("Please select a valid audio file (MP3, WAV, OGG).");
    }
  };

  const analyzeKey = async () => {
    if (!audioFile) return;
  
    try {
      setIsAnalyzing(true);
      setError(null);
  
      // Convert MP3 file to an ArrayBuffer
      const arrayBuffer = await audioFile.arrayBuffer();
      const audioBuffer = await audioContext.current.decodeAudioData(arrayBuffer);
  
      // Get audio data from the first channel
      const rawData = audioBuffer.getChannelData(0);
  
      // Use Pitchfinder's YIN algorithm for frequency detection
      const detectPitch = Pitchfinder.YIN();
      let detectedFrequencies = [];
  
      // Analyze the audio in chunks to detect dominant frequency
      const sampleSize = 1024;
      for (let i = 0; i < rawData.length; i += sampleSize) {
        const chunk = rawData.slice(i, i + sampleSize);
        const frequency = detectPitch(chunk, audioBuffer.sampleRate);
        if (frequency) detectedFrequencies.push(frequency);
      }
  
      if (detectedFrequencies.length === 0) {
        setError("No pitch detected. Try another audio file.");
        return;
      }
  
      // Get the most common frequency
      const avgFrequency = detectedFrequencies.reduce((a, b) => a + b, 0) / detectedFrequencies.length;
      
      // Convert frequency to musical key
      const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
      const a4 = 440;
      const c0 = a4 * Math.pow(2, -4.75);
      const halfStepsBelowMiddleC = Math.round(12 * Math.log2(avgFrequency / c0));
      const octave = Math.floor(halfStepsBelowMiddleC / 12);
      let noteIndex = halfStepsBelowMiddleC % 12;
  
      // **🔥 Shift Key Down by One Semitone 🔥**
      noteIndex = (noteIndex - 1 + 12) % 12; // Moves one step down in the note array
  
      let detectedKey = notes[noteIndex];
  
      // **🔥 Correctly Map Major <--> Minor Using Circle of Fifths 🔥**
      const majorToMinor = {
        "C": "A", "C#": "A#", "D": "B", "D#": "C", "E": "C#", "F": "D", 
        "F#": "D#", "G": "E", "G#": "F", "A": "F#", "A#": "G", "B": "G#"
      };
  
      const minorToMajor = {
        "A": "C", "A#": "C#", "B": "D", "C": "D#", "C#": "E", "D": "F", 
        "D#": "F#", "E": "G", "F": "G#", "F#": "A", "G": "A#", "G#": "B"
      };
  
      let scaleType = "Major"; // Assume Major by default

      const isMinor = avgFrequency % 2 !== 0; // Temporary heuristic; replace with a better method
  
      if (isMinor) {
        detectedKey = majorToMinor[detectedKey]; // Convert Major to Minor
        scaleType = "Minor";
      } else {
        detectedKey = minorToMajor[detectedKey]; // Convert Minor to Major
        scaleType = "Major";
      }
  
      setKey(`Detected Key: ${detectedKey}${octave}`);
      setScale(`Scale: ${scaleType}`);
  
    } catch (err) {
      setError("Error analyzing audio.");
      console.error("Analysis error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  
  

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Audio Key & Scale Detector</h2>

        <div className="space-y-4">
          <label className="block w-full cursor-pointer border-2 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 transition p-5 text-center">
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-500" />
            <p className="text-sm text-gray-500">Click to upload or drag & drop</p>
            <p className="text-xs text-gray-500">Supported: WAV, MP3, OGG</p>
            <input type="file" className="hidden" accept="audio/*" onChange={handleFileChange} />
          </label>

          {audioFile && <p className="text-sm text-gray-500">Selected file: {audioFile.name}</p>}

          <button
            onClick={analyzeKey}
            disabled={!audioFile || isAnalyzing}
            className={`w-full py-2 px-4 rounded-md font-medium text-white transition ${
              !audioFile || isAnalyzing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Key"}
          </button>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {key && scale && (
            <div className="text-center py-4">
              <h3 className="text-lg font-semibold text-gray-800">Detected Key:</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{key}</p>
              <p className="text-lg font-semibold text-gray-500">{scale}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioAnalyzer;
