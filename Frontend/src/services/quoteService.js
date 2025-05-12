// Quote Service - Fetches inspirational quotes from external APIs with multiple fallbacks

// Backup quotes in case all APIs fail
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
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "The difference between ordinary and extraordinary is that little extra.", author: "Jimmy Johnson" },
  { text: "The key to success is to focus on goals, not obstacles.", author: "Unknown" },
  { text: "A year from now you may wish you had started today.", author: "Karen Lamb" },
  { text: "Habits are first cobwebs, then cables.", author: "Spanish Proverb" }
];

/**
 * Get a random quote from one of multiple APIs
 * Falls back to local quotes if all APIs fail
 */
export const getRandomQuote = async () => {
  // Try multiple APIs in sequence until one works
  try {
    // First attempt - Zen Quotes API
    const zenResponse = await fetch('https://zenquotes.io/api/random', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      timeout: 3000 // 3 second timeout
    });
    
    if (zenResponse.ok) {
      const data = await zenResponse.json();
      console.log('Quote API response (Zen Quotes):', data);
      
      if (Array.isArray(data) && data.length > 0) {
        return {
          text: data[0].q,
          author: data[0].a
        };
      }
    }
    
    // Second attempt - Quotable API (keeping as fallback in case it comes back online)
    const quotableResponse = await fetch('https://api.quotable.io/quotes/random?tags=inspirational,success,wisdom', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      timeout: 3000 // 3 second timeout
    });
    
    if (quotableResponse.ok) {
      const data = await quotableResponse.json();
      console.log('Quote API response (Quotable):', data);
      
      if (Array.isArray(data) && data.length > 0) {
        return {
          text: data[0].content,
          author: data[0].author
        };
      } else if (data.content) {
        return {
          text: data.content,
          author: data.author
        };
      }
    }
    
    // Third attempt - Type.fit quotes API
    const typeFitResponse = await fetch('https://type.fit/api/quotes', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      timeout: 3000 // 3 second timeout
    });
    
    if (typeFitResponse.ok) {
      const data = await typeFitResponse.json();
      console.log('Quote API response (Type.fit):', data);
      
      if (Array.isArray(data) && data.length > 0) {
        // Get a random quote from the array
        const randomIndex = Math.floor(Math.random() * data.length);
        const quote = data[randomIndex];
        return {
          text: quote.text,
          author: quote.author || 'Unknown'
        };
      }
    }

    // If all API requests fail, throw an error to use local fallback
    throw new Error('All quote APIs failed');
    
  } catch (error) {
    console.error('Error fetching quote from APIs:', error);
    
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