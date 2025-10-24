export interface Trip {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  home_location?: string;
  notes?: string;
  updated_at: string;
  flights?: Flight[];
  hotels?: Hotel[];
  activities?: DailyActivity[];
  restaurants?: RestaurantRecommendation[];
}

export interface TripIndex {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  updated_at: string;
}

export interface TripIndexFile {
  trips: TripIndex[];
}

export interface Flight {
  id: string;
  trip_id: string;
  updated_at: string;
  airline?: string;
  flight_number?: string;
  departure_time?: string; // ISO 8601 UTC format: "2025-11-03T12:30:00Z"
  departure_timezone?: string; // IANA timezone: "Asia/Bangkok"
  arrival_time?: string; // ISO 8601 UTC format: "2025-11-03T13:55:00Z"
  arrival_timezone?: string; // IANA timezone: "Asia/Bangkok"
  departure_location?: string;
  arrival_location?: string;
  confirmation_number?: string;
  notes?: string;
  legs?: FlightLeg[];
}

export interface FlightLeg {
  id: string;
  flight_id: string;
  leg_number: number;
  airline?: string;
  flight_number?: string;
  departure_time?: string;
  arrival_time?: string;
  departure_location?: string;
  arrival_location?: string;
  duration_minutes?: number;
}

export interface Hotel {
  id: string;
  trip_id: string;
  updated_at: string;
  name?: string;
  address?: string;
  city?: string;
  plus_code?: string;
  google_maps_url?: string;
  latitude?: number;
  longitude?: number;
  check_in_time?: string; // ISO 8601 UTC format: "2025-10-31T08:00:00Z"
  check_in_timezone?: string; // IANA timezone: "Asia/Bangkok"
  check_out_time?: string; // ISO 8601 UTC format: "2025-11-01T04:00:00Z"
  check_out_timezone?: string; // IANA timezone: "Asia/Bangkok"
  confirmation_number?: string;
  phone?: string;
  notes?: string;
}

export interface DailyActivity {
  id: string;
  trip_id: string;
  updated_at: string;
  name: string;
  date: string;
  order_index: number;
  description?: string;
  generative_summary?: string;
  city?: string;
  plus_code?: string;
  google_maps_url?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  image_url?: string;
  notes?: string;
}

export interface RestaurantRecommendation {
  id: string;
  trip_id: string;
  updated_at: string;
  name: string;
  city?: string;
  cuisine_type?: string;
  address?: string;
  plus_code?: string;
  google_maps_url?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  website?: string;
  notes?: string;
}

export type TimelineItem = Flight | Hotel | DailyActivity;

export type TimelineItemType = 'flight' | 'hotel' | 'activity';

export function isFlight(item: TimelineItem): item is Flight {
  return 'airline' in item || 'flight_number' in item;
}

export function isHotel(item: TimelineItem): item is Hotel {
  return 'check_in_time' in item || 'check_out_time' in item;
}

export function isActivity(item: TimelineItem): item is DailyActivity {
  return 'order_index' in item && 'date' in item;
}

export function getItemTimestamp(item: TimelineItem): Date | null {
  if (isFlight(item) && item.departure_time) {
    return new Date(item.departure_time);
  }
  if (isHotel(item) && item.check_in_time) {
    return new Date(item.check_in_time);
  }
  if (isActivity(item) && item.date) {
    return new Date(item.date);
  }
  return null;
}

export function getItemType(item: TimelineItem): TimelineItemType {
  if (isFlight(item)) return 'flight';
  if (isHotel(item)) return 'hotel';
  return 'activity';
}