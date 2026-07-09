import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ meta, onPageChange }) {
  if (!meta || meta.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-2 py-3 border-t border-border">
      <div className="text-sm text-muted-foreground">
        Showing <span className="font-medium">{(meta.currentPage - 1) * meta.itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(meta.currentPage * meta.itemsPerPage, meta.totalItems)}</span> of <span className="font-medium">{meta.totalItems}</span> results
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(meta.currentPage - 1)}
          disabled={!meta.hasPrevPage}
          className="p-1 rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-sm font-medium text-foreground">
          {meta.currentPage} / {meta.totalPages}
        </div>
        <button
          onClick={() => onPageChange(meta.currentPage + 1)}
          disabled={!meta.hasNextPage}
          className="p-1 rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
