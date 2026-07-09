import { formatDate, cn } from '../../utils';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export function NoteCard({ note }) {
  const getStatusDisplay = () => {
    switch (note.syncStatus) {
      case 'synced':
        return (
          <div className="flex items-center text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Synced
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center text-destructive bg-destructive/10 px-2 py-0.5 rounded-full" title={note.errorMessage}>
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </div>
        );
      default:
        return (
          <div className="flex items-center text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
            <Clock className="h-3 w-3 mr-1" />
            Pending Sync
          </div>
        );
    }
  };

  return (
    <div className={cn(
      "p-4 rounded-lg border text-sm space-y-3",
      note.syncStatus === 'failed' ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"
    )}>
      <p className="whitespace-pre-wrap text-foreground/90">{note.body}</p>
      
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
        <div className="flex items-center">
          <Clock className="h-3.5 w-3.5 mr-1" />
          {formatDate(note.createdAt)}
        </div>
        
        {getStatusDisplay()}
      </div>
    </div>
  );
}
