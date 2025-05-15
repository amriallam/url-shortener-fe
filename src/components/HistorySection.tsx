import UrlCard from './UrlCard';
import { Button } from '@/components/ui/button';
import { toast } from "@/components/ui/sonner";

interface HistorySectionProps {
  history: Array<{ originalUrl: string; shortUrl: string; timestamp: number; visitCount?: number }>;
  onClear: () => void;
  onRemove: (timestamp: number) => void;
}

const HistorySection = ({ history, onClear, onRemove }: HistorySectionProps) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-3xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Recent Links</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClear}
          className="text-gray-500 hover:text-gray-700"
        >
          Clear History
        </Button>
      </div>

      <div className="space-y-3">
        {history.map((item, index) => (
          <UrlCard 
            key={`${item.shortUrl}-${index}`}
            originalUrl={item.originalUrl}
            shortUrl={item.shortUrl}
            timestamp={item.timestamp}
            onRemove={onRemove}
            visitCount={item.visitCount}
          />
        ))}
      </div>
    </div>
  );
};

export default HistorySection;
