// Utility functions for URL shortening, history management, and backend integration in the LinkSnip app.

export async function generateShortUrl(originalUrl: string): Promise<string> {
  const apiBase = import.meta.env.VITE_API_BASE_URL;

  const response = await fetch(`${apiBase}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ longUrl: originalUrl }),
  });

  if (!response.ok) throw new Error('Failed to shorten URL');
  const data = await response.json();
  return `${data.shortCode}`;
}

export function saveToHistory(originalUrl: string, shortUrl: string): void {
  const history = getHistory();
  const newEntry = {
    originalUrl,
    shortUrl,
    timestamp: new Date().getTime()
  };
  const updatedHistory = [newEntry, ...history].slice(0, 10);
  localStorage.setItem('url_history', JSON.stringify(updatedHistory));
}

export function getHistory(): Array<{originalUrl: string, shortUrl: string, timestamp: number}> {
  const historyJSON = localStorage.getItem('url_history');
  if (!historyJSON) return [];
  try {
    return JSON.parse(historyJSON);
  } catch (e) {
    console.error('Failed to parse URL history:', e);
    return [];
  }
}

export function clearHistory(): void {
  localStorage.removeItem('url_history');
}

export function removeHistoryItem(timestamp: number): void {
  const history = getHistory();
  const updatedHistory = history.filter(item => item.timestamp !== timestamp);
  localStorage.setItem('url_history', JSON.stringify(updatedHistory));
}
