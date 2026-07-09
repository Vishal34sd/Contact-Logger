import { useContacts } from '../../context/ContactsContext';
import { ContactDetailsSkeleton } from '../common/LoadingSkeleton';
import { EmptyState } from '../common/EmptyState';
import { getInitials, formatDate } from '../../utils';
import { NotesList } from './NotesList';
import { Mail, Phone, Building, Calendar, Hash } from 'lucide-react';

export function ContactDetails() {
  const { activeContact, activeContactId, isLoadingDetails } = useContacts();

  if (!activeContactId) {
    return (
      <div className="h-full flex items-center justify-center bg-card/50">
        <EmptyState 
          icon="contact" 
          title="Select a Contact" 
          description="Choose a contact from the list to view their details and notes." 
        />
      </div>
    );
  }

  if (isLoadingDetails || !activeContact) {
    return (
      <div className="p-8 h-full overflow-y-auto">
        <ContactDetailsSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-8">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6 border-b border-border pb-8">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-semibold">
            {getInitials(activeContact.firstName, activeContact.lastName)}
          </div>
          <div className="space-y-1 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {activeContact.fullName || 'Unknown Contact'}
            </h1>
            <p className="text-sm text-muted-foreground font-medium flex items-center">
              {activeContact.jobTitle && <span>{activeContact.jobTitle}</span>}
              {activeContact.jobTitle && activeContact.company && <span className="mx-2">•</span>}
              {activeContact.company && <span>{activeContact.company}</span>}
            </p>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 py-8">
          <div className="space-y-1">
            <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
              <Mail className="h-4 w-4 mr-2" /> Email
            </div>
            <p className="text-sm text-foreground">{activeContact.email || '—'}</p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
              <Phone className="h-4 w-4 mr-2" /> Phone
            </div>
            <p className="text-sm text-foreground">{activeContact.phone || '—'}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
              <Building className="h-4 w-4 mr-2" /> Company
            </div>
            <p className="text-sm text-foreground">{activeContact.company || '—'}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
              <Hash className="h-4 w-4 mr-2" /> HubSpot ID
            </div>
            <p className="text-sm text-foreground font-mono">{activeContact.hubSpotContactId}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
              <Calendar className="h-4 w-4 mr-2" /> Created Date
            </div>
            <p className="text-sm text-foreground">
              {formatDate(activeContact.hubSpotCreatedAt)}
            </p>
          </div>
        </div>

        {/* Notes Section */}
        <NotesList contactId={activeContact.id} />
      </div>
    </div>
  );
}
