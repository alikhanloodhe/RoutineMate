// Quote Service - Fetches inspirational quotes from external API

// Backup quotes in case the API fails
const fallbackQuotes = [
  { text: "The secret of your future is hidden in your daily routine.", author: "Mike Murdock" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "It's not what we do once in a while that shapes our lives, but what we do consistently.", author: "Tony Robbins" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { text: "Good habits formed at youth make all the difference.", author: "Aristotle" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" }
];

/**
 * Get a random quote from the Quotable API
 * Falls back to local quotes if the API fails
 */
export const getRandomQuote = async () => {
  try {
    // Try to fetch from the Quotable API (free and no API key required)
    const response = await fetch('https://api.quotable.io/quotes/random?tags=inspirational,success,wisdom', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('API response not OK:', response.status, response.statusText);
      throw new Error(`Failed to fetch quote from API: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Log successful API response for debugging
    console.log('Quote API response:', data);
    
    // The API returns an array with a single quote object
    if (Array.isArray(data) && data.length > 0) {
      return {
        text: data[0].content,
        author: data[0].author
      };
    } else if (data.content) {
      // Handle single quote object response
      return {
        text: data.content,
        author: data.author
      };
    } else {
      throw new Error('Unexpected API response format');
    }
  } catch (error) {
    console.error('Error fetching quote from API:', error);
    
    // Fall back to a random quote from our local collection
    const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
    return fallbackQuotes[randomIndex];
  }
};

/**
 * Get a random quote for the day
 * Uses localStorage to ensure the same quote is shown throughout the day
 */
export const getDailyQuote = async () => {
  const today = new Date().toDateString();
  const savedDate = localStorage.getItem('quoteDate');
  
  // If it's a new day or no quote is saved, get a new quote
  if (savedDate !== today) {
    try {
      const newQuote = await getRandomQuote();
      localStorage.setItem('quoteDate', today);
      localStorage.setItem('dailyQuote', JSON.stringify(newQuote));
      return newQuote;
    } catch (error) {
      console.error('Error getting new daily quote:', error);
      // Fallback to a random local quote
      const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
      return fallbackQuotes[randomIndex];
    }
  } 
  
  // If it's the same day, use the saved quote
  const savedQuote = localStorage.getItem('dailyQuote');
  if (savedQuote) {
    return JSON.parse(savedQuote);
  }
  
  // If no saved quote found for some reason, get a new one
  const newQuote = await getRandomQuote();
  localStorage.setItem('dailyQuote', JSON.stringify(newQuote));
  return newQuote;
}; 