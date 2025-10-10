import { Button } from '@/components/ui/button';
import type { NavigationProps } from '@/types';

/**
 * Navigation component - Provides consistent navigation header across pages
 * Shows page title and optional back button for hierarchical navigation
 */
export function Navigation({ title, showBackButton = false, onBack }: NavigationProps) {
  return (
    <nav className="nav-header sticky top-0 z-50">
      <div className="flex items-center gap-3">
        {showBackButton && onBack && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onBack}
            className="p-2 hover:bg-muted shrink-0"
            aria-label="Go back"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Button>
        )}
        
        <h1 className="text-xl font-semibold text-foreground truncate">
          {title}
        </h1>
      </div>
      
      {/* Optional actions slot - can be extended in the future */}
      <div className="flex items-center gap-2">
        {/* Future: Add search, filter, or other action buttons */}
      </div>
    </nav>
  );
}