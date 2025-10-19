/**
 * TripTimeline component - displays chronological timeline grouped by days
 * Feature: Enhanced Trip Data Model & Itinerary Management
 */

'use client'

import { useMemo, useState } from 'react';
import type { Trip, TimelineItem, Flight, Hotel, DailyActivity } from '@/types';
import { isFlight, isHotel, isActivity } from '@/types';
import { sortChronologically, getItemDate } from '@/lib/utils';
import { formatDayButton } from '@/lib/dateTime';
import { usePagination } from '@/hooks/usePagination';
import { FlightCard } from './FlightCard';
import { HotelCard } from './HotelCard';
import { ActivityCard } from './ActivityCard';
import { Hotel as HotelIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface TripTimelineProps {
  trip: Trip;
}

interface DayGroup {
  date: string;
  dayNumber: number;
  items: TimelineItem[];
  hotelStay?: Hotel; // Hotel that spans this day
  isCheckInDay?: boolean; // First day of hotel stay
  color: {
    bg: string;
    bgInactive: string;
    border: string;
    text: string;
    textInactive: string;
    dot: string;
  };
}

// Color palette for day groups - optimized for dark themes
const DAY_COLORS = [
  { bg: 'bg-blue-700', bgInactive: 'bg-blue-900/10', border: 'border-blue-500', text: 'text-white', textInactive: 'text-gray-500', dot: 'bg-blue-500' },
  { bg: 'bg-red-700', bgInactive: 'bg-red-900/10', border: 'border-red-500', text: 'text-white', textInactive: 'text-gray-500', dot: 'bg-red-500' },
  { bg: 'bg-emerald-700', bgInactive: 'bg-emerald-900/10', border: 'border-emerald-500', text: 'text-white', textInactive: 'text-gray-500', dot: 'bg-emerald-500' },
  { bg: 'bg-gray-700', bgInactive: 'bg-gray-900/10', border: 'border-gray-500', text: 'text-white', textInactive: 'text-gray-500', dot: 'bg-gray-500' },
  { bg: 'bg-teal-700', bgInactive: 'bg-teal-900/10', border: 'border-teal-500', text: 'text-white', textInactive: 'text-gray-500', dot: 'bg-teal-500' },
  { bg: 'bg-rose-700', bgInactive: 'bg-rose-900/10', border: 'border-rose-500', text: 'text-white', textInactive: 'text-gray-500', dot: 'bg-rose-500' },

];

function getDaysBetween(start: string, end: string): string[] {
  const dates: string[] = [];
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

/**
 * TimelineDot - Small colored dot indicator for timeline items
 */
const TimelineDot = ({ color }: { color: string }) => (
  <div className={`absolute -left-[26px] md:-left-[34px] top-4 w-4 h-4 rounded-full ${color} shadow-sm`} />
);

export function TripTimeline({ trip }: TripTimelineProps) {
  // Track active day for navigation highlighting
  const [activeDay, setActiveDay] = useState<number>(1);

  const dayGroups = useMemo(() => {
    // Combine all timeline items
    const timelineItems: TimelineItem[] = [
      ...(trip.flights || []),
      ...(trip.hotels || []),
      ...(trip.activities || []),
    ];
    
    if (timelineItems.length === 0) return [];
    
    // Sort chronologically
    const sortedItems = sortChronologically(timelineItems);
    
    // Group by date
    const groups = new Map<string, TimelineItem[]>();
    
    sortedItems.forEach((item) => {
      const date = getItemDate(item);
      if (date) {
        if (!groups.has(date)) {
          groups.set(date, []);
        }
        groups.get(date)!.push(item);
      }
    });
    
    // Add all hotel stay dates to ensure every day of the trip has an entry
    const allDates = new Set(groups.keys());
    (trip.hotels || []).forEach((hotel) => {
      if (hotel.check_in_time && hotel.check_out_time) {
        const checkInDate = hotel.check_in_time.split('T')[0];
        const checkOutDate = hotel.check_out_time.split('T')[0];
        const stayDates = getDaysBetween(checkInDate, checkOutDate);
        
        // Add each hotel stay date to the groups if not already present
        stayDates.forEach(date => {
          if (!allDates.has(date)) {
            allDates.add(date);
            groups.set(date, []); // Create empty group for hotel-only days
          }
        });
      }
    });
    
    // Create day groups array from all dates (including hotel-only days)
    const dates = Array.from(allDates).sort();
    const dayGroupsArray: DayGroup[] = dates.map((date, index) => ({
      date,
      dayNumber: index + 1,
      items: groups.get(date) || [],
      color: DAY_COLORS[index % DAY_COLORS.length],
    }));
    
    // Add hotel stay information to each day
    (trip.hotels || []).forEach((hotel) => {
      if (hotel.check_in_time && hotel.check_out_time) {
        const checkInDate = hotel.check_in_time.split('T')[0];
        const checkOutDate = hotel.check_out_time.split('T')[0];
        const stayDates = getDaysBetween(checkInDate, checkOutDate);
        
        stayDates.forEach((stayDate, idx) => {
          const dayGroup = dayGroupsArray.find(g => g.date === stayDate);
          if (dayGroup) {
            dayGroup.hotelStay = hotel;
            dayGroup.isCheckInDay = idx === 0;
          }
        });
      }
    });
    
    return dayGroupsArray;
  }, [trip]);

  // Pagination for day navigation carousel
  const {
    visibleItems: visibleDays,
    canGoPrev,
    canGoNext,
    handlePrev,
    handleNext,
  } = usePagination(dayGroups, 3);

  if (dayGroups.length === 0) {
    return (
      <div className="text-center py-8 text-base-content/60">
        No itinerary items yet
      </div>
    );
  }

  const scrollToDay = (dayNumber: number) => {
    const element = document.getElementById(`day-${dayNumber}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveDay(dayNumber);
    }
  };

  return (
    <div>
      {/* Day Navigation with Carousel */}
      <div className="sticky top-0 z-10 bg-base-200 py-2 mb-6 border-b border-base-300">
        <div className="flex items-center gap-2 px-2">
          {/* Previous button */}
          <button
            onClick={handlePrev}
            disabled={!canGoPrev}
            className={`btn btn-circle ${!canGoPrev ? 'btn-disabled opacity-30' : 'btn-ghost'}`}
            aria-label="Previous days"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          {/* Visible day buttons */}
          <div className="flex gap-2 flex-1 justify-center">
            {visibleDays.map((day) => (
              <button
                key={day.dayNumber}
                onClick={() => scrollToDay(day.dayNumber)}
                className={`btn whitespace-nowrap transition-all ${
                  activeDay === day.dayNumber
                    ? `${day.color.bg} ${day.color.border} ${day.color.text} border-2 font-semibold hover:${day.color.bg}`
                    : `${day.color.bgInactive} ${day.color.textInactive} border border-transparent hover:border-${day.color.border.replace('border-', '')}`
                }`}
              >
                {day.dayNumber}. {formatDayButton(day.date)}
              </button>
            ))}
          </div>
          
          {/* Next button */}
          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className={`btn btn-circle ${!canGoNext ? 'btn-disabled opacity-30' : 'btn-ghost'}`}
            aria-label="Next days"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {dayGroups.map((day) => (
          <div key={day.dayNumber} id={`day-${day.dayNumber}`} className="scroll-mt-32">
            {/* Day Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full ${day.color.bg} ${day.color.border} border-2`}>
                <span className={`text-lg font-bold ${day.color.text}`}>
                  {day.dayNumber}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  Day {day.dayNumber}
                </h3>
                <p className="text-sm text-base-content/60">
                  {new Date(day.date).toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Timeline Items */}
            <div className="relative pl-6 md:pl-8 min-h-[80px]">
              {/* Vertical timeline line connector */}
              <div className="absolute left-0 md:left-2 top-0 bottom-0 w-0.5 bg-base-300" />
              <div className="space-y-4 pb-4">
                {/* Hotel check-in or continuation */}
                {day.hotelStay && (
                  day.isCheckInDay ? (
                    <div className="relative">
                      <TimelineDot color={day.color.dot} />
                      <HotelCard hotel={day.hotelStay} />
                    </div>
                  ) : (
                    <div className="relative">
                      <TimelineDot color={day.color.dot} />
                      <div className="card bg-base-100/50 shadow-lg border border-secondary/30">
                        <div className="card-body p-3 sm:p-4">
                          <div className="flex items-center gap-3">
                            <HotelIcon className="w-5 h-5 text-secondary" />
                            <span className="text-sm">
                              Staying at <span className="font-semibold">{day.hotelStay.name}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}

                {/* Day's activities and flights */}
                {day.items
                  .filter(item => {
                    // Filter out hotels that are already shown as hotelStay to avoid duplicate dots
                    if (isHotel(item) && day.hotelStay && item.id === day.hotelStay.id) {
                      return false;
                    }
                    return true;
                  })
                  .map((item) => (
                  <div key={item.id} className="relative">
                    <TimelineDot color={day.color.dot} />
                    {isFlight(item) && <FlightCard flight={item} />}
                    {isHotel(item) && <HotelCard hotel={item} />}
                    {isActivity(item) && <ActivityCard activity={item} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
