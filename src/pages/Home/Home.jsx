import React from 'react';
import Youtube2Mp3 from '@/components/Youtube2Mp3/Youtube2Mp3.jsx';
import SongKeyAnalyzer from '@/components/SongKeyAnalyzer/SongKeyAnalyzer';
import RhymeFinder from '@/components/RhymeFinder/RhymeFinder';

const Home = () => {
  // Container style with background image and blur effect
  const containerStyle = {
    backgroundImage: 'url("src/pages/Home/SoundSketch.jpeg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    minHeight: '100vh',
    width: '100%',
    position: 'relative',
    paddingTop: '40px' // Account for the header
  };
  
  // Overlay with blur effect
  const blurOverlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backdropFilter: 'blur(8px)',
    zIndex: 0
  };

  // Styles for the cards - matching the screenshot
  const cardStyle = {
    backgroundColor: 'rgba(32, 32, 32, 0.95)', // Dark background with transparency
    borderRadius: '12px',
    border: '2px solid rgba(255, 48, 48, 1)', // Red outline matching our theme color
    padding: '20px',
    height: '100%',
    minHeight: '500px',
    textAlign: 'center',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2), 0 0 15px rgba(255, 48, 48, 0.3)', 
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  };

  // Layout style - matching the screenshot spacing
  const columnContainerStyle = {
    display: 'flex',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    width: '100%',
    padding: '20px 50px',
    position: 'relative',
    zIndex: 1,
    marginTop: '30px'
  };

  // Column styles
  const columnStyle = {
    width: '30%',
    minWidth: '300px',
    minHeight: '800px',
    margin: '0 10px 20px',
    display: 'flex',
    flexDirection: 'column'
  };

  // Card title style
  const cardTitleStyle = {
    color: 'white',
    fontSize: '35px',
    fontWeight: 'bold',
    marginBottom: '50px',
    textAlign: 'center'
  };

  // Header style with custom font
  const headerStyle = {
    color: 'white',
    fontFamily: "'TopFont', cursive",
    fontSize: '50px',
    fontWeight: '300', // Light font weight
    textAlign: 'center',
    marginBottom: '30px',
    position: 'relative',
    zIndex: 1
  };

  return (
    <div style={containerStyle}>
      {/* Apply custom font face */}
      <style dangerouslySetInnerHTML={{ __html: `
        @font-face {
          font-family: 'TopFont';
          src: url('src/assets/top.otf') format('opentype');
          font-weight: normal;
          font-style: normal;
        }
      `}} />
      
      <div style={blurOverlayStyle}></div>
      
      <h1 style={headerStyle}>
      Efficiency Meets Creativity
      </h1>
      
      <div style={columnContainerStyle}>
        {/* Column 1: YouTube to MP3 */}
        <div style={columnStyle}>
          <div style={cardStyle}>
            <h2 style={cardTitleStyle}>
              YouTube to MP3 Converter
            </h2>
            <Youtube2Mp3 />
          </div>
        </div>
        
        {/* Column 2: Song Key Analyzer */}
        <div style={columnStyle}>
          <div style={cardStyle}>
            <h2 style={cardTitleStyle}>
              Song Key Analyzer
            </h2>
            <SongKeyAnalyzer />
          </div>
        </div>
        
        {/* Column 3: Rhyme Finder */}
        <div style={columnStyle}>
          <div style={cardStyle}>
            <h2 style={cardTitleStyle}>
              Rhyme Finder
            </h2>
            <RhymeFinder />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;