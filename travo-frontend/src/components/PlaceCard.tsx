import { Card, CardContent } from '@/components/ui/card';
import type { PlaceCardProps } from '@/types';
import { formatPlusCode, createMapsUrl } from '@/lib/utils';

/**
 * PlaceCard component - Displays individual place information within a trip
 * Shows place name, Plus Code, and notes with day-wise context
 */
export function PlaceCard({ place, className }: PlaceCardProps) {
  const formattedPlusCode = formatPlusCode(place.plus_code);
  const mapsUrl = createMapsUrl(place.plus_code);

  return (
    <Card className={`place-card ${className || ''}`}>
      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-foreground text-balance">
              {place.name}
            </h3>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:text-primary/80 font-mono shrink-0 ml-2"
              title="View on Google Maps"
            >
              {formattedPlusCode}
            </a>
          </div>
          
          {place.notes && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {place.notes}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}