/**
 * TripTimeline component - displays chronological timeline grouped by days
 * Feature: Enhanced Trip Data Model & Itinerary Management
 */

'use client'

import { useMemo, useState, type ReactNode } from 'react';
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
// TimelineDot: smaller size for cleaner visual hierarchy where line is the primary connector
const TimelineDot = ({ color }: { color: string }) => (
  <div className={`w-3 h-3 rounded-full ${color} ring-2 ring-base-100`} />
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
              <div>
                <h3 className="text-xl font-bold">
                  {new Date(day.date).toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long', 
                    day: 'numeric'
                  })}
                </h3>
              </div>
            </div>

            {/* Timeline Items (Simple dots on left with connecting lines) */}
            <div className="relative pl-8 py-2 space-y-5">
              {(() => {
                const displayItems: { key: string; content: ReactNode }[] = [];

                if (day.hotelStay) {
                  if (day.isCheckInDay) {
                    displayItems.push({
                      key: `hotel-checkin-${day.hotelStay.id}`,
                      content: <HotelCard hotel={day.hotelStay} />,
                    });
                  } else {
                    displayItems.push({
                      key: `hotel-cont-${day.hotelStay.id}`,
                      content: (
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
                      ),
                    });
                  }
                }

                day.items.forEach(item => {
                  if (isHotel(item) && day.hotelStay && item.id === day.hotelStay.id) return;
                  displayItems.push({
                    key: item.id,
                    content: (
                      <>
                        {isFlight(item) && <FlightCard flight={item as Flight} />}
                        {isActivity(item) && <ActivityCard activity={item as DailyActivity} tripId={trip.id} />}
                        {isHotel(item) && <HotelCard hotel={item as Hotel} />}
                      </>
                    ),
                  });
                });

                return displayItems.map((block, idx) => {
                  const isLast = idx === displayItems.length - 1;
                  return (
                    <div key={block.key} className="relative">
                      {/* Simple dot at fixed position on left */}
                      <div className={`absolute -left-[26px] top-4 w-3 h-3 rounded-full ${day.color.dot} ring-2 ring-base-100`}></div>
                      
                      {/* Dashed connecting line from dot center to next dot center */}
                      {!isLast && displayItems.length > 1 && (
                        <div className={`absolute -left-[21px] top-[22px] w-px h-[calc(100%+1.25rem)] border-l-2 border-dashed ${day.color.border} opacity-50`}></div>
                      )}
                      
                      {/* Card content */}
                      {block.content}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
