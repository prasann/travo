import * as React from "react"
import { Card } from "../ui/card"
import { Typography } from "../ui/typography"
import { cn } from "@/lib/utils"
import type { TripCardProps } from "./types"

const TripCard = React.forwardRef<
  HTMLDivElement,
  TripCardProps & React.HTMLAttributes<HTMLDivElement>
>(({ className, trip, variant = 'gradient', size = 'md', onViewDetails, ...props }, ref) => {
  
  const handleClick = () => {
    if (onViewDetails) {
      onViewDetails(trip.id)
    }
  }
  
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick()
    }
  }
  
  return (
    <Card
      ref={ref}
      className={cn("ds-trip-card", className)}
      variant={variant}
      size={size}
      interactive={true}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...props}
    >
      <div className="space-y-ds-sm">
        {/* Trip Title */}
        <Typography 
          variant="h3" 
          className="ds-trip-title"
        >
          {trip.title}
        </Typography>
        
        {/* Trip Location/Destination */}
        <Typography 
          variant="body" 
          color="muted"
          className="ds-trip-location"
        >
          {trip.destination}
        </Typography>
        
        {/* Trip Dates */}
        <div className="flex flex-col space-y-ds-xs">
          <Typography 
            variant="caption" 
            color="accent"
            className="ds-trip-dates font-medium"
          >
            {trip.startDate} - {trip.endDate}
          </Typography>
          
          {/* Duration and Place Count */}
          <div className="flex justify-between items-center">
            <Typography 
              variant="caption" 
              color="muted"
              className="ds-trip-duration"
            >
              {trip.duration}
            </Typography>
            
            <Typography 
              variant="caption" 
              color="muted"
              className="ds-trip-duration"
            >
              {trip.placeCount} {trip.placeCount === 1 ? 'place' : 'places'}
            </Typography>
          </div>
        </div>
      </div>
    </Card>
  )
})

TripCard.displayName = "TripCard"

export { TripCard }