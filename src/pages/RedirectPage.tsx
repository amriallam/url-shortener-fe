import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const RedirectPage = () => {
  const { shortCode } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [longUrl, setLongUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const apiBase = import.meta.env.VITE_API_BASE_URL;
    setLoading(true);
    fetch(`${apiBase}/${shortCode}`)
      .then(async response => {
        if (!response.ok) throw new Error('Not found');
        const data = await response.json();
        if (data.originalUrl && isMounted) {
          setLongUrl(data.originalUrl);
        } else if (isMounted) {
          setError(true);
        }
      })
      .catch(() => {
        if (isMounted) setError(true);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [shortCode]);

  const handleShowQR = async () => {
    if (!shortCode) return;
    const apiBase = import.meta.env.VITE_API_BASE_URL;
    setShowQR(true);
    setQrCode(null);
    try {
      const response = await fetch(`${apiBase}/${shortCode}/qr`);
      if (!response.ok) throw new Error('Failed to fetch QR');
      const data = await response.json();
      setQrCode(data.qrCode);
    } catch {
      setQrCode(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="mb-4">
            <svg className="animate-spin h-12 w-12 text-indigo-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Redirecting you</h1>
          <p className="text-gray-600">Please wait a moment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="mb-4">
            <svg className="h-16 w-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Link Not Found</h1>
          <p className="text-gray-600 mb-6">This short link may have expired or doesn't exist.</p>
          <a 
            href="/" 
            className="inline-flex items-center px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  // If longUrl is found, show redirect and QR code options
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-4">
          <svg className="animate-spin h-12 w-12 text-indigo-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Ready to redirect</h1>
        <p className="text-gray-600 mb-6">Click below to go to the original URL or get a QR code.</p>
        <a
          href={longUrl || '#'}
          className="inline-flex items-center px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md transition-colors mb-4"
        >
          Go to Original URL
        </a>
        <br />
        <button
          onClick={handleShowQR}
          className="inline-flex items-center px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md transition-colors"
        >
          {qrCode ? 'Show QR Again' : 'Show QR Code'}
        </button>
        {showQR && qrCode && (
          <div className="mt-6 flex flex-col items-center">
            <img src={qrCode} alt="QR Code" className="w-48 h-48" />
            <p className="mt-2 text-gray-500">Scan to open the link</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RedirectPage;
