import React from 'react';
import './Home.css';
import Youtube2Mp3 from '@/components/Youtube2Mp3/Youtube2Mp3.jsx';


const Home = () => {
  return (
    <div className="home">
      <div>
      <h1>Welcome to the YouTube to MP3 Converter</h1>
      <Youtube2Mp3 />
    </div>
    </div>
  );
};

export default Home;