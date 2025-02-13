import React, { useState } from "react";
import Youtube2Mp3 from "@/components/Youtube2Mp3/Youtube2Mp3";
import AudioAnalyzer from "@/components/AudioAnalyzer/AudioAnalyzer";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          YouTube to MP3 Converter & Audio Analyzer
        </h1>

        {/* YouTube to MP3 Converter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Convert YouTube to MP3
          </h2>
          <Youtube2Mp3 />
        </div>

        <div className="container mx-auto p-4">
      <AudioAnalyzer />
    </div>
      </div>
    </div>
  );
};

export default Home;
