import { useState } from 'react';
import { authApi } from '../../api/auth';
import { LinkIcon, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

export function ConnectButton() {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const response = await authApi.getAuthUrl();
      // Redirect to HubSpot OAuth page
      window.location.href = response.data.url;
    } catch (error) {
      toast.error('Failed to get authorization URL');
      setIsConnecting(false);
    }
  };

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2"
    >
      {isConnecting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <LinkIcon className="mr-2 h-4 w-4" />
      )}
      {isConnecting ? 'Connecting...' : 'Connect HubSpot'}
    </button>
  );
}
