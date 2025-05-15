
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { generateShortUrl } from "@/lib/url-shortener";

interface UrlFormProps {
  onUrlShorten: (originalUrl: string, shortUrl: string) => void;
}

const UrlForm = ({ onUrlShorten }: UrlFormProps) => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    // Check if URL has http/https, if not add it
    let formattedUrl = url;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    if (!isValidUrl(formattedUrl)) {
      toast.error("Please enter a valid URL");
      return;
    }

    setIsLoading(true);

    try {
      const shortUrl = await generateShortUrl(formattedUrl);
      onUrlShorten(formattedUrl, shortUrl);
      setUrl("");
      toast.success("URL successfully shortened!");
    } catch (error) {
      toast.error("Failed to shorten URL. Please try again.");
      console.error("Error shortening URL:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Enter your long URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="pr-10 h-12 text-base"
          />
          {url && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setUrl("")}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="h-12 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Shortening...</span>
            </div>
          ) : (
            <span>Shorten</span>
          )}
        </Button>
      </div>
    </form>
  );
};

export default UrlForm;
