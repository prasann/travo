import { TripList } from '@/components/TripList'
import { loadTripIndex } from '@/lib/tripLoader'

export default async function HomePage() {
  const tripIndex = await loadTripIndex()
  const trips = tripIndex.trips

  return (
    <main className="min-h-screen">
      <TripList trips={trips} />
    </main>
  )
}
