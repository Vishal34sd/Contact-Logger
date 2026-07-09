import { cn, getInitials } from '../../utils';

export function ContactCard({ contact, isActive, onClick }) {
  return (
    <button
      onClick={() => onClick(contact.id)}
      className={cn(
        "w-full text-left flex items-start space-x-4 p-3 rounded-lg border transition-all duration-200",
        isActive 
          ? "bg-muted/50 border-primary ring-1 ring-primary shadow-sm" 
          : "border-border hover:bg-muted/30 bg-card hover:border-muted-foreground/30"
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
        {getInitials(contact.firstName, contact.lastName)}
      </div>

      <div className="flex-1 space-y-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium leading-none truncate text-foreground">
            {contact.fullName || contact.email || 'Unknown Contact'}
          </p>
        </div>
        {contact.email && (
          <p className="text-xs text-muted-foreground truncate">
            {contact.email}
          </p>
        )}
        {contact.company && (
          <p className="text-xs text-muted-foreground/70 truncate">
            {contact.company}
          </p>
        )}
      </div>
    </button>
  );
}
