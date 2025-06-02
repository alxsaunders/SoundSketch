import React from 'react';
import Youtube2Mp3 from '@/components/Youtube2Mp3/Youtube2Mp3.jsx';
import SongKeyAnalyzer from '@/components/SongKeyAnalyzer/SongKeyAnalyzer';
import RhymeFinder from '@/components/RhymeFinder/RhymeFinder';
import StickyNote from '@/components/StickyNote/StickyNote';

const Home = () => {
  // Container style with background image and blur effect
  const containerStyle = {
    backgroundImage: `
      linear-gradient(
        to bottom,
        rgba(255, 255, 255, 0.1) 0%,
        rgba(255, 255, 255, 0.05) 25%,
        rgba(255, 255, 255, 0.02) 50%,
        rgba(0, 0, 0, 0.1) 75%,
        rgba(0, 0, 0, 0.2) 100%
      ),
      url("src/pages/Home/cool-background.png")
    `,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    minHeight: '100vh',
    width: '100%',
    position: 'relative',
    paddingTop: '60px'
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
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Dark background with transparency
    borderRadius: '12px',
    border: '0px solid rgb(0, 0, 0)', 
    padding: '20px',
    height: '100%',
    minHeight: '500px',
    textAlign: 'center',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2), 0 0 15px rgba(0, 0, 0, 0.3)', 
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
    color: 'black',
    fontSize: '35px',
    fontWeight: '600',
    marginBottom: '50px',
    textAlign: 'center',
    fontFamily: 'Poppins, sans-serif'
  };

  // Header style with custom font
  const headerStyle = {
    color: 'white',
    fontFamily: "'TopFont', cursive",
    letterSpacing: '2px',
    fontSize: '50px',
    fontWeight: '100', // Light font weight
    textAlign: 'center',
    marginBottom: '30px',
    marginTop: '6vh',
    position: 'relative',
    zIndex: 1
  };
  const footer = {
    color: 'white',
    fontFamily: "'TopFont', cursive",
    fontWeight: '50',
    letterSpacing: '2px',
    fontSize: '30px',
    textAlign: 'center',
    marginTop: '5vh',
    position: 'relative',
    zIndex: 1
  };
  

  return (
    <div style={containerStyle}>
      {/* Apply custom font faces */}
      <style dangerouslySetInnerHTML={{ __html: `
        @font-face {
          font-family: 'TopFont';
          src: url('src/assets/top.otf') format('opentype');
          font-weight: normal;
          font-style: normal;
        }

        @font-face {
          font-family: 'Poppins';
          src: url('src/assets/Poppins.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
        }

        * {
          font-family: 'Poppins', sans-serif;
        }

        h1.main-header {
          font-family: 'TopFont', cursive;
        }
      `}} />
      
      <div style={blurOverlayStyle}></div>
      
      <h1 style={headerStyle} className="main-header">
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
      <StickyNote />
      <h1 style={footer} className="main-header">
        Sound Sketch
      </h1>
    </div>
  );
};

export default Home;