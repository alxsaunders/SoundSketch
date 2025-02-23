import React, { useState } from 'react';
import { fetchRhymes, generateLyrics } from './openai-helper';

const RhymeFinder = () => {
  const [word, setWord] = useState('');
  const [rhymes, setRhymes] = useState([]);
  const [lyrics, setLyrics] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatingLyrics, setGeneratingLyrics] = useState(false);
  const [error, setError] = useState('');

  // Styling to match the Music Tools Hub theme.
  const containerStyle = {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: 'white'
  };

  const formStyle = {
    width: '100%',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'center',
    gap: '10px'
  };

  const inputStyle = {
    padding: '10px 15px',
    borderRadius: '8px',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    backgroundColor: 'white',
    color: '#555',
    width: '70%',
    fontSize: '16px',
    fontWeight: '400'
  };

  const buttonStyle = {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px',
    transition: 'background-color 0.2s',
    minWidth: '140px'
  };

  const loadingStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '20px 0',
    color: 'white'
  };

  const spinnerStyle = {
    width: '30px',
    height: '30px',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    borderTop: '3px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '10px'
  };

  const resultsStyle = {
    width: '100%',
    marginTop: '20px',
    textAlign: 'center'
  };

  const rhymesContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '10px',
    margin: '15px 0'
  };

  const rhymeButtonStyle = {
    padding: '10px 16px',
    borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: 'white',
    cursor: 'pointer',
    fontSize: '15px',
    minWidth: '100px'
  };

  const lyricsStyle = {
    width: '100%',
    marginTop: '25px',
    padding: '15px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    textAlign: 'center'
  };

  const lyricsTextStyle = {
    whiteSpace: 'pre-line',
    textAlign: 'left',
    padding: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    margin: '15px 0'
  };

  const footerStyle = {
    marginTop: '25px',
    padding: '15px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    width: '100%'
  };

  const handleSearchRhymes = async (e) => {
    e.preventDefault();
    if (!word.trim()) return;

    setLoading(true);
    setError('');
    setRhymes([]);
    
    try {
      const rhymeWords = await fetchRhymes(word);
      setRhymes(rhymeWords);
      if (rhymeWords.length === 0) {
        setError(`No rhymes found for "${word}". Try another word like: heart, fire, blue, night, love.`);
      }
    } catch (err) {
      setError('Failed to fetch rhymes. Please try again.');
      console.error('Error fetching rhymes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLyrics = async (rhymingWord) => {
    setGeneratingLyrics(true);
    setLyrics('');
    
    try {
      const generatedLyrics = await generateLyrics(word, rhymingWord);
      setLyrics(generatedLyrics);
    } catch (err) {
      console.error('Error generating lyrics:', err);
      setError('Failed to generate lyrics. Please try again.');
      
      // Fallback if API fails
      const fallbackLyric = `I feel the ${word} in my heart,\nIt's tearing me apart,\nLike a ${rhymingWord} right from the start.`;
      setLyrics(fallbackLyric + '\n\n(Fallback lyric - API connection failed)');
    } finally {
      setGeneratingLyrics(false);
    }
  };

  // Animation for spinner
  const keyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  return (
    <div style={containerStyle}>
      <style>{keyframes}</style>
      
      <form onSubmit={handleSearchRhymes} style={formStyle}>
        <input
          type="text"
          style={inputStyle}
          placeholder="Enter a word (e.g., heart, dream, blue)"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          style={buttonStyle}
          disabled={loading || !word.trim()}
        >
          Find Rhymes
        </button>
      </form>

      {error && (
        <div style={{ color: 'yellow', margin: '10px 0', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={loadingStyle}>
          <div style={spinnerStyle}></div>
          <span>Searching for rhymes...</span>
        </div>
      )}

      {rhymes.length > 0 && (
        <div style={resultsStyle}>
          <h3 style={{ marginBottom: '10px' }}>Rhymes for "{word}":</h3>
          <div style={rhymesContainerStyle}>
            {rhymes.map((rhyme, index) => (
              <button
                key={index}
                style={rhymeButtonStyle}
                onClick={() => handleGenerateLyrics(rhyme)}
                disabled={generatingLyrics}
              >
                {rhyme}
              </button>
            ))}
          </div>
        </div>
      )}

      {generatingLyrics && (
        <div style={loadingStyle}>
          <div style={spinnerStyle}></div>
          <span>AI is crafting lyrics...</span>
        </div>
      )}

      {lyrics && (
        <div style={lyricsStyle}>
          <h3>Generated Lyrics:</h3>
          <p style={lyricsTextStyle}>{lyrics}</p>
          <div>
            <button 
              style={{...buttonStyle, marginTop: '10px'}}
              onClick={() => handleGenerateLyrics(rhymes[Math.floor(Math.random() * rhymes.length)])}
              disabled={generatingLyrics}
            >
              Generate new lyrics
            </button>
          </div>
        </div>
      )}

      <div style={footerStyle}>
        <h4 style={{ marginBottom: '10px' }}>How it works:</h4>
        <ol style={{ paddingLeft: '25px', textAlign: 'left' }}>
          <li>Enter a word to find rhymes using the Datamuse API</li>
          <li>Click on any rhyming word to generate lyrics with OpenAI</li>
          <li>Click "Generate new lyrics" to try different variations</li>
        </ol>
      </div>
    </div>
  );
};

export default RhymeFinder;