import React, { useState } from 'react';
import Youtube2Mp3 from '@/components/Youtube2Mp3/Youtube2Mp3.jsx';
import AudioAnalyzer from '@/components/AudioAnalyzer/AudioAnalyzer.jsx';
import { Upload } from 'lucide-react';

const Home = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAudioFile(file);
      setFileName(file.name);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          YouTube to MP3 Converter & Audio Analyzer
        </h1>

        {/* YouTube to MP3 Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Convert YouTube to MP3
          </h2>
          <Youtube2Mp3 />
        </div>

        {/* Audio Analysis Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Audio Analysis
          </h2>
          
          {/* File Upload */}
          <div className="mb-6">
            <label 
              htmlFor="audio-file" 
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">MP3, WAV, or OGG</p>
              </div>
              <input
                id="audio-file"
                type="file"
                className="hidden"
                accept="audio/*"
                onChange={handleFileChange}
              />
            </label>
            
            {fileName && (
              <p className="mt-2 text-sm text-gray-600">
                Selected file: {fileName}
              </p>
            )}
          </div>

          {/* Audio Analyzer */}
          {audioFile && <AudioAnalyzer file={audioFile} />}
        </div>
      </div>
    </div>
  );
};

export default Home;