import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addNoteSchema } from '../../schemas';
import { notesApi } from '../../api/notes';
import { toast } from 'react-toastify';
import { Loader2, Send } from 'lucide-react';

export function AddNoteForm({ contactId, onNoteAdded }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addNoteSchema),
    defaultValues: { body: '' }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await notesApi.createNote(contactId, data.body);
      toast.success('Note added successfully');
      reset();
      if (onNoteAdded) onNoteAdded();
    } catch (error) {
      // Interceptor handles the toast, we just reset state
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 border-t border-border pt-6">
      <h3 className="text-sm font-medium mb-3">Add Note</h3>
      <div className="space-y-3">
        <div className="relative">
          <textarea
            {...register('body')}
            placeholder="Type your note here..."
            className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            disabled={isSubmitting}
          />
          {errors.body && (
            <p className="text-[13px] font-medium text-destructive mt-1">
              {errors.body.message}
            </p>
          )}
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {isSubmitting ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </div>
    </form>
  );
}
