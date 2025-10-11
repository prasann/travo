/**
 * Core TypeScript interfaces for Travo
 */

export interface Trip {
  id: string
  name: string
  description?: string
  start_date: string
  end_date: string
  updated_at: string
  places: Place[]
}

export interface Place {
  id: string
  trip_id: string
  name: string
  plus_code: string
  notes?: string
  order_index: number
  updated_at: string
}