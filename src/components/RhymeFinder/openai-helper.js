import OpenAI from "openai";

// Initialize OpenAI client
// For browser usage we need dangerouslyAllowBrowser option
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY, // For Vite projects
  dangerouslyAllowBrowser: true // Only for development! Remove in production
});

/**
 * Fetches rhyming words using the Datamuse API
 * @param {string} word - The word to find rhymes for
 * @returns {Promise<string[]>} - Array of rhyming words
 */
export const fetchRhymes = async (word) => {
  if (!word.trim()) return [];
  
  try {
    // Using the Datamuse API to find rhyming words
    const response = await fetch(`https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(word)}&max=12`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract just the words from the response
    return data.map(item => item.word);
  } catch (error) {
    console.error('Error fetching rhymes:', error);
    throw error;
  }
};

/**
 * Generates lyrics using OpenAI
 * @param {string} originalWord - The original word
 * @param {string} rhymingWord - The rhyming word
 * @returns {Promise<string>} - Generated lyrics
 */
export const generateLyrics = async (originalWord, rhymingWord) => {
  try {
    // Check if OpenAI API key is set
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured. Check your .env file.');
    }
    
    // Call OpenAI to generate lyrics
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // You can also use "gpt-4o-mini" if preferred
      messages: [
        {
          role: "system",
          content: "You are a creative songwriter who specializes in writing emotional and catchy lyrics."
        },
        {
          role: "user",
          content: `Write a creative 3-4 line verse for a song that uses the words "${originalWord}" and "${rhymingWord}" in a rhyming pattern. Make it emotional and poetic.`
        }
      ],
      temperature: 0.7,
      max_tokens: 150,
      store: true // Include if you want to store the conversation
    });
    
    // Return the generated lyrics
    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating lyrics with OpenAI:', error);
    
    // Return a simple message instead of using fallback lyrics
    if (error.message.includes('429') || error.message.includes('quota')) {
      return "AI-generated lyrics unavailable. Please check your OpenAI API quota and billing settings.";
    } else if (error.message.includes('API key')) {
      return "AI-generated lyrics unavailable. OpenAI API key is not configured properly.";
    } else {
      return "AI-generated lyrics unavailable at this time. Please try again later.";
    }
  }
};