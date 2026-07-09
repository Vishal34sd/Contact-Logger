import { useState, useEffect } from 'react';
import { useContacts } from '../../context/ContactsContext';
import { useDebounce } from '../../hooks/useDebounce';
import { ContactCard } from './ContactCard';
import { SearchBar } from './SearchBar';
import { ContactListSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';
import { ErrorState } from '../common/ErrorState';
import { Pagination } from '../common/Pagination';

export function ContactList() {
  const { 
    contacts, 
    meta, 
    isLoading, 
    error, 
    fetchContacts, 
    activeContactId, 
    selectContact 
  } = useContacts();

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchContacts({ page: currentPage, search: debouncedSearch, limit: 15 });
  }, [debouncedSearch, currentPage, fetchContacts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="flex flex-col h-full border-r border-border bg-card">
      <div className="p-4 border-b border-border space-y-4 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Contacts</h2>
          {meta && <span className="text-xs font-medium bg-muted px-2 py-1 rounded-md">{meta.totalItems} total</span>}
        </div>
        <SearchBar value={searchTerm} onChange={setSearchTerm} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {error ? (
          <ErrorState message={error} onRetry={() => fetchContacts({ page: currentPage, search: debouncedSearch, limit: 15 })} />
        ) : isLoading ? (
          <ContactListSkeleton />
        ) : contacts.length === 0 ? (
          <EmptyState 
            icon={debouncedSearch ? "search" : "contact"}
            title={debouncedSearch ? "No results found" : "No contacts"} 
            description={debouncedSearch ? `No contacts match "${debouncedSearch}"` : "Sync is pending or your HubSpot has no contacts."}
          />
        ) : (
          contacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              isActive={activeContactId === contact.id}
              onClick={selectContact}
            />
          ))
        )}
      </div>

      {!isLoading && !error && contacts.length > 0 && (
        <div className="shrink-0">
          <Pagination meta={meta} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  );
}
