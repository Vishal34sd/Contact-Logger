import { useState, useEffect, useCallback } from 'react';
import { notesApi } from '../../api/notes';
import { NoteCard } from './NoteCard';
import { AddNoteForm } from './AddNoteForm';
import { NotesSkeleton } from '../common/LoadingSkeleton';
import { ErrorState } from '../common/ErrorState';
import { Pagination } from '../common/Pagination';
import { FileText } from 'lucide-react';

export function NotesList({ contactId }) {
  const [notes, setNotes] = useState([]);
  const [meta, setMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchNotes = useCallback(async (page = 1) => {
    if (!contactId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await notesApi.getNotes(contactId, { page, limit: 10 });
      setNotes(response.data);
      setMeta(response.meta);
      setCurrentPage(page);
    } catch (err) {
      setError('Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  }, [contactId]);

  useEffect(() => {
    fetchNotes(1);
  }, [fetchNotes]);

  const handleNoteAdded = () => {
    // Refresh page 1 when new note is added
    fetchNotes(1);
  };

  if (isLoading && notes.length === 0) {
    return <NotesSkeleton />;
  }

  return (
    <div className="mt-8 flex flex-col h-full">
      <div className="flex items-center mb-4">
        <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
        <h3 className="text-lg font-semibold tracking-tight">Notes</h3>
      </div>

      <div className="space-y-4 mb-6">
        {error ? (
          <ErrorState message={error} onRetry={() => fetchNotes(currentPage)} />
        ) : notes.length === 0 ? (
          <div className="p-6 border border-dashed border-border rounded-lg text-center">
            <p className="text-sm text-muted-foreground">No notes yet. Add one below.</p>
          </div>
        ) : (
          notes.map(note => <NoteCard key={note.id} note={note} />)
        )}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="mb-4">
          <Pagination meta={meta} onPageChange={fetchNotes} />
        </div>
      )}

      <AddNoteForm contactId={contactId} onNoteAdded={handleNoteAdded} />
    </div>
  );
}
