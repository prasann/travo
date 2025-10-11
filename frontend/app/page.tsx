import { TripList } from '@/components/TripList'
import tripsData from '@/data/trips.json'

export default function HomePage() {
  const trips = tripsData.trips

  return (
    <main className="min-h-screen">
      <TripList trips={trips} />
    </main>
  )
}
