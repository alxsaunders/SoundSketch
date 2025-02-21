import React, { useState } from 'react';
import { fetchRhymes, generateLyrics } from './openai-helper';
import './RhymeFinder.css';

const RhymeFinder = () => {
  const [word, setWord] = useState('');
  const [rhymes, setRhymes] = useState([]);
  const [lyrics, setLyrics] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatingLyrics, setGeneratingLyrics] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <div className="rhyme-finder-container">
      <h2 className="rhyme-finder-title">AI Rhyme Finder & Lyric Generator</h2>
      
      <form onSubmit={handleSearchRhymes} className="rhyme-finder-form">
        <input
          type="text"
          className="rhyme-finder-input"
          placeholder="Enter a word (e.g., heart, dream, blue)"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="rhyme-finder-button"
          disabled={loading || !word.trim()}
        >
          Find Rhymes
        </button>
      </form>

      {error && (
        <div className="rhyme-finder-error">
          {error}
        </div>
      )}

      {loading && (
        <div className="rhyme-finder-loading">
          <div className="rhyme-finder-spinner"></div>
          <span>Searching for rhymes...</span>
        </div>
      )}

      {rhymes.length > 0 && (
        <div className="rhyme-finder-results">
          <h3>Rhymes for "{word}":</h3>
          <div className="rhyme-finder-rhymes">
            {rhymes.map((rhyme, index) => (
              <button
                key={index}
                className="rhyme-finder-rhyme-button"
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
        <div className="rhyme-finder-loading">
          <div className="rhyme-finder-spinner"></div>
          <span>AI is crafting lyrics...</span>
        </div>
      )}

      {lyrics && (
        <div className="rhyme-finder-lyrics">
          <h3>Generated Lyrics:</h3>
          <p className="rhyme-finder-lyrics-text">{lyrics}</p>
          <div className="rhyme-finder-actions">
            <button 
              className="rhyme-finder-refresh"
              onClick={() => handleGenerateLyrics(rhymes[Math.floor(Math.random() * rhymes.length)])}
              disabled={generatingLyrics}
            >
              Generate new lyrics
            </button>
          </div>
        </div>
      )}

      <div className="rhyme-finder-footer">
        <h4>How it works:</h4>
        <ol>
          <li>Enter a word to find rhymes using the Datamuse API</li>
          <li>Click on any rhyming word to generate lyrics with OpenAI</li>
          <li>Click "Generate new lyrics" to try different variations</li>
        </ol>
      </div>
    </div>
  );
};

export default RhymeFinder;