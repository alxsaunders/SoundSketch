import React from 'react';
import Youtube2Mp3 from '@/components/Youtube2Mp3/Youtube2Mp3.jsx';
import SongKeyAnalyzer from '@/components/SongKeyAnalyzer';
import RhymeFinder from '@/components/RhymeFinder/RhymeFinder'

// Add inline styles for guaranteed column layout
const columnContainerStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '20px',
  width: '100%'
};

const columnStyle = {
  minWidth: 0 // Ensures columns don't overflow
};

const Home = () => {
  return (
    <div>
      <h1 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>
        Music Tools Hub
      </h1>
      
      <div style={columnContainerStyle}>
        {/* Column 1: YouTube to MP3 */}
        <div style={columnStyle}>
          <h2 style={{ marginBottom: '10px', fontSize: '18px', fontWeight: 'bold' }}>
            YouTube to MP3 Converter
          </h2>
          <Youtube2Mp3 />
        </div>
        
        {/* Column 2: Song Key Analyzer */}
        <div style={columnStyle}>
          <h2 style={{ marginBottom: '10px', fontSize: '18px', fontWeight: 'bold' }}>
            Song Key Analyzer
          </h2>
          <SongKeyAnalyzer />
        </div>
        
        {/* Column 3: Your New Component */}
        <div style={columnStyle}>
          <h2 style={{ marginBottom: '10px', fontSize: '18px', fontWeight: 'bold' }}>
            New Component
          </h2>
         <RhymeFinder />
        </div>
      </div>
    </div>
  );
};

export default Home;