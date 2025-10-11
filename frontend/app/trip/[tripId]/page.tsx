import { notFound } from 'next/navigation'
import { TripTimeline } from '@/components/TripTimeline'
import { loadTrip, loadTripIndex } from '@/lib/tripLoader'
import { formatDate } from '@/lib/dateTime'

interface TripPageProps {
  params: Promise<{
    tripId: string
  }>
}

// Generate static paths for all trips at build time
export async function generateStaticParams() {
  const tripIndex = await loadTripIndex()
  return tripIndex.trips.map((trip) => ({
    tripId: trip.id,
  }))
}

export default async function TripPage({ params }: TripPageProps) {
  const { tripId } = await params
  
  let trip
  try {
    trip = await loadTrip(tripId)
  } catch (error) {
    notFound()
  }

  return (
    <main className="min-h-screen p-8">
      <div className="container mx-auto max-w-4xl">
        {/* Trip Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{trip.name}</h1>
          <p className="text-base-content/60 text-lg">
            {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
          </p>
          {trip.description && (
            <p className="mt-4 text-lg">{trip.description}</p>
          )}
          {trip.home_location && (
            <p className="text-sm text-base-content/60 mt-2">
              Starting from: {trip.home_location}
            </p>
          )}
        </div>

        {/* Timeline */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Timeline</h2>
          <TripTimeline trip={trip} />
        </div>
      </div>
    </main>
  )
}
