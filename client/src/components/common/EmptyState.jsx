import { cn } from '../../utils';
import { FileQuestion, SearchX, UserX } from 'lucide-react';

const icons = {
  default: FileQuestion,
  search: SearchX,
  contact: UserX,
};

export function EmptyState({ 
  title = "No data found", 
  description = "Get started by adding some data.",
  icon = "default",
  className 
}) {
  const Icon = icons[icon] || icons.default;

  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <div className="bg-muted p-4 rounded-full mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
        {description}
      </p>
    </div>
  );
}
