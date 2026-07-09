import { AlertCircle, RefreshCw } from 'lucide-react';

export function ErrorState({ title = "Something went wrong", message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="h-10 w-10 text-destructive mb-4" />
      <h3 className="text-lg font-medium text-foreground">{title}</h3>
      {message && (
        <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-sm">
          {message}
        </p>
      )}
      {onRetry && (
        <button 
          onClick={onRetry}
          className="flex items-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm font-medium"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
}
