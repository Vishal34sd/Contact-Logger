import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils';
import { LogOut, Activity, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export function Navbar() {
  const { isConnected, lastSync, disconnect } = useAuth();

  const renderSyncStatus = () => {
    if (!lastSync) return null;
    
    if (lastSync.status === 'in_progress') {
      return (
        <div className="flex items-center text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
          <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          Syncing...
        </div>
      );
    }
    
    if (lastSync.status === 'completed') {
      return (
        <div className="flex items-center text-sm text-green-700 bg-green-50 px-2 py-1 rounded-full">
          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
          Synced {formatDate(lastSync.completedAt)}
        </div>
      );
    }
    
    return (
      <div className="flex items-center text-sm text-destructive bg-destructive/10 px-2 py-1 rounded-full">
        <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
        Sync failed
      </div>
    );
  };

  return (
    <nav className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Activity className="h-6 w-6 text-primary mr-2" />
            <span className="font-semibold text-lg tracking-tight">Contact Logger</span>
          </div>
          
          {isConnected && (
            <div className="flex items-center space-x-4">
              {renderSyncStatus()}
              <div className="h-4 w-px bg-border" />
              <button
                onClick={disconnect}
                className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
