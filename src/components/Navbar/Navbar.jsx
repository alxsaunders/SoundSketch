import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navbarStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    background: scrolled 
      ? 'rgba(32, 32, 32, 0.95)'
      : 'linear-gradient(to bottom, rgba(0, 0, 0, 0.8) 0%, rgba(32, 32, 32, .1) 100%)',
    backdropFilter: 'blur(8px)',
    transition: 'all 0.3s ease',
    borderBottom: scrolled 
      ? '1px solid rgba(255, 48, 48, 0.3)'
      : 'none'
  };

  const containerStyle = {
    maxWidth: '1800px',
    minHeight: '90px',
    margin: '0 auto 1px',
    padding: '15px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: 'Poppins, sans-serif'
  };

  const logoStyle = {
    color: 'white',
    fontSize: '40px',
    fontWeight: '400',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    letterSpacing: '1px',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    transition: 'transform 0.2s ease',
    fontFamily: "'TopFont', sans-serif"
  };

  const rightTextStyle = {
    color: 'white',
    fontSize: '16px',
    fontWeight: '300',
    opacity: 0.9,
    letterSpacing: '0.5px',
    fontFamily: 'Poppins, sans-serif'
  };

  return (
    <nav style={navbarStyle}>
      <style>
        {`
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

          .nav-container {
            font-family: 'Poppins', sans-serif;
          }
        `}
      </style>
      <div style={containerStyle} className="nav-container">
        <Link to="/" style={logoStyle}>
          Sound Sketch
        </Link>
        <div style={rightTextStyle}>
          Your Music Hub
        </div>
      </div>
    </nav>
  );
};

export default Navbar;