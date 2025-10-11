import { notFound } from 'next/navigation'
import { TripDetails } from '@/components/TripDetails'
import tripsData from '@/data/trips.json'

interface TripPageProps {
  params: Promise<{
    tripId: string
  }>
}

// Generate static paths for all trips at build time
export async function generateStaticParams() {
  return tripsData.trips.map((trip) => ({
    tripId: trip.id,
  }))
}

export default async function TripPage({ params }: TripPageProps) {
  const { tripId } = await params
  const trip = tripsData.trips.find(t => t.id === tripId)

  if (!trip) {
    notFound()
  }

  return (
    <main className="min-h-screen">
      <TripDetails trip={trip} />
    </main>
  )
}
