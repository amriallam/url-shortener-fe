import { useState, useEffect } from 'react';
import UrlForm from '@/components/UrlForm';
import HistorySection from '@/components/HistorySection';
import { saveToHistory, getHistory, clearHistory, removeHistoryItem } from '@/lib/url-shortener';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const VISIBLE_HISTORY = 3;

const Index = () => {
  const [history, setHistory] = useState(getHistory());
  const [historyPage, setHistoryPage] = useState(0);
  const [visitCounts, setVisitCounts] = useState<Record<string, number>>({});

  const totalPages = Math.ceil(history.length / VISIBLE_HISTORY);
  const canScrollLeft = historyPage > 0;
  const canScrollRight = historyPage < totalPages - 1;
  const visibleHistory = history.slice(historyPage * VISIBLE_HISTORY, (historyPage + 1) * VISIBLE_HISTORY);

  useEffect(() => {
    if (visibleHistory.length === 0) return;
    const shortCodes = visibleHistory.map(item => item.shortUrl.split('/').pop());
    fetch(`${import.meta.env.VITE_API_BASE_URL}/visit-counts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shortCodes }),
    })
      .then(res => res.json())
      .then((data: Array<{ shortCode: string, visitCount: number }>) => {
        // Map to { shortCode: count }
        const map: Record<string, number> = {};
        data.forEach(item => { map[item.shortCode] = item.visitCount; });
        setVisitCounts(map);
      })
      .catch(() => setVisitCounts({}));
  }, [historyPage, history]);

  const handleUrlShortened = (originalUrl: string, shortUrl: string) => {
    let newHistory = getHistory();
    const existingIdx = newHistory.findIndex(h => h.originalUrl === originalUrl);
    if (existingIdx !== -1) {
      const [item] = newHistory.splice(existingIdx, 1);
      newHistory = [item, ...newHistory];
      localStorage.setItem('url_history', JSON.stringify(newHistory));
    } else {
      saveToHistory(originalUrl, shortUrl);
      newHistory = getHistory();
    }
    setHistory(newHistory);
    setHistoryPage(0);
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
    setHistoryPage(0);
  };

  const handleRemoveHistoryItem = (timestamp: number) => {
    removeHistoryItem(timestamp);
    const newHistory = getHistory();
    setHistory(newHistory);
    const newTotalPages = Math.ceil(newHistory.length / VISIBLE_HISTORY);
    if (historyPage > 0 && historyPage >= newTotalPages) {
      setHistoryPage(Math.max(0, newTotalPages - 1));
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
            LinkSnip
          </h1>
          <p className="text-xl text-gray-600 max-w-lg mx-auto">
            Transform long, unwieldy URLs into clean, memorable links in seconds.
          </p>
        </div>
        <div className="w-full max-w-3xl mb-12">
          <UrlForm onUrlShorten={handleUrlShortened} />
        </div>
        {history.length > 0 && (
          <div className="flex items-center w-full max-w-3xl">
            {history.length > VISIBLE_HISTORY && (
              <Button
                variant="ghost"
                size="icon"
                className="mr-2"
                onClick={() => setHistoryPage(i => Math.max(0, i - 1))}
                disabled={!canScrollLeft}
                aria-label="Scroll history left"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}
            <div className="flex-1">
              <HistorySection
                history={visibleHistory.map(item => {
                  const shortCode = item.shortUrl.split('/').pop() || '';
                  return {
                    ...item,
                    visitCount: typeof visitCounts[shortCode] === 'number' ? visitCounts[shortCode] : 0
                  };
                })}
                onClear={handleClearHistory}
                onRemove={handleRemoveHistoryItem}
              />
            </div>
            {history.length > VISIBLE_HISTORY && (
              <Button
                variant="ghost"
                size="icon"
                className="ml-2"
                onClick={() => setHistoryPage(i => Math.min(totalPages - 1, i + 1))}
                disabled={!canScrollRight}
                aria-label="Scroll history right"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
