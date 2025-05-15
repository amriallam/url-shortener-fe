import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { generateShortUrl } from "@/lib/url-shortener";
import { Switch } from "@/components/ui/switch";

interface UrlFormProps {
  onUrlShorten: (originalUrl: string, shortUrl: string) => void;
}

const UrlForm = ({ onUrlShorten }: UrlFormProps) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (bulkMode) {
        // Bulk mode: split by comma, trim, filter empty
        const urls = url
          .split(",")
          .map((u) => u.trim())
          .filter(Boolean);
        if (urls.length === 0) {
          toast.error("Please enter at least one URL.");
          setLoading(false);
          return;
        }
        const apiBase = import.meta.env.VITE_API_BASE_URL;
        const response = await fetch(`${apiBase}/bulk`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(urls.map((longUrl) => ({ longUrl }))),
        });
        if (!response.ok) {
          toast.error("Bulk shorten failed.");
          setLoading(false);
          return;
        }
        const data = await response.json();
        // Assume data is array of { longUrl, shortCode }
        data.forEach((item: { longUrl: string; shortCode: string }) => {
          onUrlShorten(item.longUrl, item.shortCode);
        });
        toast.success("Bulk URLs shortened!");
        setUrl("");
      } else {
        // Single mode
        const shortUrl = await generateShortUrl(url);
        onUrlShorten(url, shortUrl);
        toast.success("URL shortened!");
        setUrl("");
      }
    } catch (err) {
      toast.error("Failed to shorten URL.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2">
        <Switch
          checked={bulkMode}
          onCheckedChange={setBulkMode}
          id="bulk-switch"
        />
        <label
          htmlFor="bulk-switch"
          className="text-sm text-gray-700 select-none cursor-pointer"
        >
          Bulk URLs (comma separated)
        </label>
      </div>
      {bulkMode ? (
        <textarea
          style={{ boxShadow: "none" }}
          className="w-full border rounded p-2 text-sm min-h-[80px]"
          placeholder="Enter URLs separated by commas"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
        />
      ) : (
        <Input
          type="text"
          style={{ boxShadow: "none" }}
          placeholder="Enter a long URL to shorten"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
        />
      )}
      <Button
        type="submit"
        disabled={loading || !url.trim()}
        className="bg-black hover:bg-neutral-900 text-white"
      >
        {loading ? "Shortening..." : bulkMode ? "Shorten All" : "Shorten"}
      </Button>
    </form>
  );
};

export default UrlForm;
