import { useState } from 'react';
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, QrCode, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import * as PopoverPrimitive from "@radix-ui/react-popover";

interface UrlCardProps {
  originalUrl: string;
  shortUrl: string;
  timestamp: number;
  onRemove?: (timestamp: number) => void;
  visitCount?: number;
}

const UrlCard = ({ originalUrl, shortUrl, timestamp, onRemove, visitCount }: UrlCardProps) => {
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQROpen] = useState(false);
  const [qrLoading, setQRLoading] = useState(false);
  const [qrError, setQRError] = useState<string | null>(null);
  const [qrCode, setQRCode] = useState<string | null>(null);

  const fetchQRCode = async () => {
    setQRLoading(true);
    setQRError(null);
    setQRCode(null);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiBase}/${shortUrl.split('/').pop()}/qr`);
      if (!response.ok) throw new Error('Failed to fetch QR');
      const data = await response.json();
      setQRCode(data.qrCode);
    } catch (e) {
      setQRError('Could not load QR code');
    } finally {
      setQRLoading(false);
    }
  };

  const handleQRClick = () => {
    setQROpen(true);
    // Always retry fetch if error or no QR code
    if (!qrCode || qrError) fetchQRCode();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl)
      .then(() => {
        setCopied(true);
        toast.success("URL copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        toast.error("Failed to copy to clipboard");
      });
  };

  const formatUrl = (url: string,useDomain: boolean = false) => {
    try {
      const urlObj = new URL(url);
      let display = (useDomain ? window.location.origin : urlObj.hostname) + urlObj.pathname;
      if (display.length > 40) {
        display = display.substring(0, 40) + '...';
      }
      return display;
    } catch {
      return url.length > 40 ? url.substring(0, 40) + '...' : url;
    }
  };

  const getRelativeTime = (timestamp: number) => {
    const now = new Date().getTime();
    const diff = now - timestamp;
    
    // Less than a minute
    if (diff < 60000) {
      return 'just now';
    }
    
    // Less than an hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    // Less than a day
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    // Format as date
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <Card className="w-full overflow-hidden transition-all hover:shadow-md relative">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-grow truncate">
            <div className="flex flex-col">
              <a 
                href={originalUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium text-sm text-gray-500 hover:underline truncate"
                title={originalUrl}
              >
                {formatUrl(originalUrl)}
              </a>
              <a 
                href={formatUrl(shortUrl,true)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-md font-semibold text-indigo-600 hover:underline"
              >
                {formatUrl(shortUrl,true)}
              </a>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                <span>{getRelativeTime(timestamp)}</span>
                {typeof visitCount === 'number' && (
                  <span className="ml-2">Visited: {visitCount}x</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-row gap-2 items-end">
            <Button 
              onClick={copyToClipboard} 
              variant="outline"
              size="icon"
              className={`min-w-[40px] ${copied ? 'bg-green-50 text-green-600 border-green-200' : ''}`}
              aria-label="Copy short URL"
            >
              {copied ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                </svg>
              )}
            </Button>
            <PopoverPrimitive.Root open={qrOpen} onOpenChange={setQROpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverPrimitive.Trigger asChild>
                    <Button
                      onClick={handleQRClick}
                      variant="outline"
                      size="icon"
                      className="min-w-[40px]"
                      aria-label="Show QR code"
                    >
                      <QrCode className="w-4 h-4" />
                    </Button>
                  </PopoverPrimitive.Trigger>
                </TooltipTrigger>
                <TooltipContent>Show QR code</TooltipContent>
              </Tooltip>
              <PopoverPrimitive.Portal>
                <PopoverPrimitive.Content sideOffset={8} className="z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-xl min-w-[180px] min-h-[180px] flex flex-col items-center justify-center">
                  {qrLoading && <Loader2 className="animate-spin w-8 h-8 text-gray-400" />}
                  {qrError && <span className="text-red-500 text-sm">{qrError}</span>}
                  {qrCode && (
                    <img src={qrCode} alt="QR Code" className="w-32 h-32 object-contain" />
                  )}
                </PopoverPrimitive.Content>
              </PopoverPrimitive.Portal>
            </PopoverPrimitive.Root>
            {onRemove && (
              <Button
                onClick={() => onRemove(timestamp)}
                variant="outline"
                size="icon"
                className="min-w-[40px] text-gray-400 hover:text-red-500"
                aria-label="Remove from history"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UrlCard;
