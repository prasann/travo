/**
 * TripTimeline component - displays chronological timeline grouped by days
 * Feature: Enhanced Trip Data Model & Itinerary Management
 */

'use client'

import { useMemo, useState } from 'react';
import type { Trip, TimelineItem, Flight, Hotel, DailyActivity } from '@/types';
import { isFlight, isHotel, isActivity } from '@/types';
import { sortChronologically } from '@/lib/utils';
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
    border: string;
    text: string;
    dot: string;
  };
}

// Color palette for day groups
const DAY_COLORS = [
  { bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-600', dot: 'bg-blue-400' },
  { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-600', dot: 'bg-green-400' },
  { bg: 'bg-purple-50', border: 'border-purple-400', text: 'text-purple-600', dot: 'bg-purple-400' },
  { bg: 'bg-orange-50', border: 'border-orange-400', text: 'text-orange-600', dot: 'bg-orange-400' },
  { bg: 'bg-pink-50', border: 'border-pink-400', text: 'text-pink-600', dot: 'bg-pink-400' },
  { bg: 'bg-indigo-50', border: 'border-indigo-400', text: 'text-indigo-600', dot: 'bg-indigo-400' },
  { bg: 'bg-teal-50', border: 'border-teal-400', text: 'text-teal-600', dot: 'bg-teal-400' },
  { bg: 'bg-rose-50', border: 'border-rose-400', text: 'text-rose-600', dot: 'bg-rose-400' },
];

function getItemDate(item: TimelineItem): string | null {
  if ('departure_time' in item && item.departure_time) {
    return item.departure_time.split('T')[0];
  }
  if ('check_in_time' in item && item.check_in_time) {
    return item.check_in_time.split('T')[0];
  }
  if ('date' in item && item.date) {
    return item.date;
  }
  return null;
}

function getDaysBetween(start: string, end: string): string[] {
  const dates: string[] = [];
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

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
    
    // Create day groups array
    const dates = Array.from(groups.keys()).sort();
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

  // Carousel state for day navigation (must come after dayGroups)
  const [currentPage, setCurrentPage] = useState<number>(0);
  const daysPerPage = 3; // Show 3 days at a time
  const totalPages = Math.ceil(dayGroups.length / daysPerPage);
  
  const visibleDays = useMemo(() => {
    const start = currentPage * daysPerPage;
    const end = start + daysPerPage;
    return dayGroups.slice(start, end);
  }, [dayGroups, currentPage]);
  
  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

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
      <div className="sticky top-0 z-10 bg-base-100 py-2 mb-6 border-b border-base-300">
        <div className="flex items-center gap-2 px-2">
          {/* Previous button */}
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className={`btn btn-sm btn-circle ${currentPage === 0 ? 'btn-disabled opacity-30' : 'btn-ghost'}`}
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
                className={`btn btn-sm whitespace-nowrap transition-all ${
                  activeDay === day.dayNumber
                    ? `${day.color.bg} ${day.color.border} ${day.color.text} border-2 font-semibold`
                    : `btn-ghost ${day.color.text} opacity-70 hover:opacity-100`
                }`}
              >
                {day.dayNumber}. {new Date(day.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </button>
            ))}
          </div>
          
          {/* Next button */}
          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages - 1}
            className={`btn btn-sm btn-circle ${currentPage >= totalPages - 1 ? 'btn-disabled opacity-30' : 'btn-ghost'}`}
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
            <div className="relative pl-6 md:pl-8">
              <div className="space-y-4">
                {/* Hotel check-in or continuation */}
                {day.hotelStay && (
                  day.isCheckInDay ? (
                    <div className="relative">
                      {/* Color dot indicator */}
                      <div className={`absolute -left-[26px] md:-left-[34px] top-4 w-3 h-3 rounded-full ${day.color.dot} shadow-sm`} />
                      <HotelCard hotel={day.hotelStay} />
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Color dot indicator */}
                      <div className={`absolute -left-[26px] md:-left-[34px] top-4 w-3 h-3 rounded-full ${day.color.dot} shadow-sm`} />
                      <div className="card bg-base-100/50 shadow-sm border border-base-300">
                        <div className="card-body p-3 sm:p-4">
                          <div className="flex items-center gap-3 opacity-60">
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
                {day.items.map((item) => (
                  <div key={item.id} className="relative">
                    {/* Color dot indicator */}
                    <div className={`absolute -left-[26px] md:-left-[34px] top-4 w-3 h-3 rounded-full ${day.color.dot} shadow-sm`} />
                    {isFlight(item) && <FlightCard flight={item} />}
                    {isHotel(item) && !day.hotelStay && <HotelCard hotel={item} />}
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
