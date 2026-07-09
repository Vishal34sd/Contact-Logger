import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ConnectButton } from '../components/auth/ConnectButton';
import { Activity } from 'lucide-react';
import { toast } from 'react-toastify';

export function LandingPage() {
  const { isConnected, isLoading, refreshStatus } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (isLoading) return;

    // Check if coming back from OAuth redirect successfully
    if (searchParams.get('auth') === 'success') {
      toast.success('Successfully connected to HubSpot!');
      
      // Clean up URL without triggering reload
      setSearchParams({});
      
      // Force refresh status since the callback just finished on backend
      refreshStatus();
    }
  }, [searchParams, isLoading, refreshStatus, setSearchParams]);

  useEffect(() => {
    if (!isLoading && isConnected) {
      navigate('/dashboard', { replace: true });
    }
  }, [isConnected, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-muted rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center">
              <Activity className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Contact Logger
          </h1>
          <p className="text-muted-foreground">
            Connect your HubSpot account to automatically sync contacts and manage notes seamlessly.
          </p>
        </div>

        <div className="pt-8 border-t border-border">
          <ConnectButton />
          <p className="text-xs text-muted-foreground mt-4">
            You will be redirected to HubSpot to authorize access.
          </p>
        </div>
      </div>
    </div>
  );
}
