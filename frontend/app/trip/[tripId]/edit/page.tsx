/**
 * Trip Edit Mode Page
 * 
 * Feature: 006-edit-mode-for
 * Route: /trip/[tripId]/edit
 * 
 * Server Component that loads trip data and passes to client component
 */

import { notFound } from 'next/navigation';
import { getTripWithRelations } from '@/lib/db/operations/trips';
import EditModeLayout from '@/components/edit/EditModeLayout';

interface EditTripPageProps {
  params: Promise<{
    tripId: string;
  }>;
}

export default async function EditTripPage({ params }: EditTripPageProps) {
  // Await params (Next.js 15 async params)
  const { tripId } = await params;
  
  // Load trip data from IndexedDB
  // Note: This runs on the server, but IndexedDB operations are client-side
  // In practice, we'll need to handle this in the client component
  // For now, pass the tripId and let the client component load the data
  
  return <EditModeLayout tripId={tripId} />;
}
