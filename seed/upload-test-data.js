#!/usr/bin/env node

/**
 * Upload Test Data to Firestore
 * 
 * This script uploads the Tokyo trip test data to Firestore.
 * Requires Firebase Admin SDK and service account credentials.
 * 
 * Usage:
 *   npm install firebase-admin --save-dev
 *   node scripts/upload-test-data.js YOUR_EMAIL@example.com
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Get user email from command line
const userEmail = process.argv[2];

if (!userEmail) {
  console.error('❌ Error: Please provide your email address');
  console.log('Usage: node scripts/upload-test-data.js YOUR_EMAIL@example.com');
  process.exit(1);
}

console.log('🚀 Starting Firestore data upload...');
console.log(`📧 User email: ${userEmail}`);

// Initialize Firebase Admin
try {
  // Check if already initialized
  if (!admin.apps.length) {
    // Try to use GOOGLE_APPLICATION_CREDENTIALS environment variable
    admin.initializeApp({
      projectId: 'travo-32ec12'
    });
  }
  console.log('✅ Firebase Admin initialized');
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
  console.log('\n💡 Make sure you have set up Application Default Credentials:');
  console.log('   gcloud auth application-default login');
  console.log('\n   Or set GOOGLE_APPLICATION_CREDENTIALS environment variable:');
  console.log('   export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account-key.json"');
  process.exit(1);
}

const db = admin.firestore();

// Read test data
const testDataPath = path.join(__dirname, 'test-data/123e4567-e89b-12d3-a456-426614174000.json');
const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));

console.log(`📖 Loaded test data: ${testData.name}`);

// Transform to Firestore format
function transformToFirestoreFormat(trip, userEmail) {
  const now = new Date().toISOString();
  
  // Transform trip
  const firestoreTrip = {
    id: trip.id,
    name: trip.name,
    destination: trip.description || 'Tokyo', // Firestore uses destination instead of description
    start_date: trip.start_date,
    end_date: trip.end_date,
    user_access: [userEmail], // Add user to access list
    updated_by: userEmail,
    updated_at: now,
    created_at: now
  };
  
  // Transform flights (simplified schema)
  const firestoreFlights = trip.flights.map((flight, index) => ({
    id: flight.id,
    trip_id: trip.id,
    direction: index === 0 ? 'outbound' : 'return',
    updated_by: userEmail,
    updated_at: now
  }));
  
  // Transform hotels
  const firestoreHotels = trip.hotels.map(hotel => ({
    id: hotel.id,
    trip_id: trip.id,
    name: hotel.name,
    address: hotel.address,
    city: hotel.city,
    plus_code: hotel.plus_code,
    check_in_date: hotel.check_in_time?.split('T')[0], // Extract date from timestamp
    check_out_date: hotel.check_out_time?.split('T')[0],
    updated_by: userEmail,
    updated_at: now
  }));
  
  // Transform activities
  const firestoreActivities = trip.activities.map(activity => {
    // Determine time of day from start_time
    let timeOfDay = 'morning';
    if (activity.start_time) {
      const hour = new Date(activity.start_time).getHours();
      if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
      else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
      else if (hour >= 21 || hour < 6) timeOfDay = 'night';
    }
    
    return {
      id: activity.id,
      trip_id: trip.id,
      name: activity.name,
      date: activity.date,
      time_of_day: timeOfDay,
      city: activity.city,
      plus_code: activity.plus_code,
      address: activity.address,
      notes: activity.notes,
      order_index: activity.order_index,
      updated_by: userEmail,
      updated_at: now
    };
  });
  
  // Transform restaurants
  const firestoreRestaurants = trip.restaurants.map(restaurant => ({
    id: restaurant.id,
    trip_id: trip.id,
    name: restaurant.name,
    city: restaurant.city,
    cuisine_type: restaurant.cuisine_type,
    address: restaurant.address,
    plus_code: restaurant.plus_code,
    notes: restaurant.notes,
    updated_by: userEmail,
    updated_at: now
  }));
  
  return {
    trip: firestoreTrip,
    flights: firestoreFlights,
    hotels: firestoreHotels,
    activities: firestoreActivities,
    restaurants: firestoreRestaurants
  };
}

// Upload to Firestore
async function uploadData() {
  try {
    console.log('\n📤 Transforming data for Firestore...');
    const transformed = transformToFirestoreFormat(testData, userEmail);
    
    console.log('📝 Data summary:');
    console.log(`   - Trip: ${transformed.trip.name}`);
    console.log(`   - Flights: ${transformed.flights.length}`);
    console.log(`   - Hotels: ${transformed.hotels.length}`);
    console.log(`   - Activities: ${transformed.activities.length}`);
    console.log(`   - Restaurants: ${transformed.restaurants.length}`);
    
    // Create trip document
    console.log('\n⬆️  Uploading trip document...');
    await db.collection('trips').doc(transformed.trip.id).set(transformed.trip);
    console.log('✅ Trip uploaded');
    
    // Upload flights
    console.log('⬆️  Uploading flights...');
    const flightPromises = transformed.flights.map(flight =>
      db.collection('trips').doc(transformed.trip.id)
        .collection('flights').doc(flight.id).set(flight)
    );
    await Promise.all(flightPromises);
    console.log(`✅ ${transformed.flights.length} flights uploaded`);
    
    // Upload hotels
    console.log('⬆️  Uploading hotels...');
    const hotelPromises = transformed.hotels.map(hotel =>
      db.collection('trips').doc(transformed.trip.id)
        .collection('hotels').doc(hotel.id).set(hotel)
    );
    await Promise.all(hotelPromises);
    console.log(`✅ ${transformed.hotels.length} hotels uploaded`);
    
    // Upload activities
    console.log('⬆️  Uploading activities...');
    const activityPromises = transformed.activities.map(activity =>
      db.collection('trips').doc(transformed.trip.id)
        .collection('activities').doc(activity.id).set(activity)
    );
    await Promise.all(activityPromises);
    console.log(`✅ ${transformed.activities.length} activities uploaded`);
    
    // Upload restaurants
    console.log('⬆️  Uploading restaurants...');
    const restaurantPromises = transformed.restaurants.map(restaurant =>
      db.collection('trips').doc(transformed.trip.id)
        .collection('restaurants').doc(restaurant.id).set(restaurant)
    );
    await Promise.all(restaurantPromises);
    console.log(`✅ ${transformed.restaurants.length} restaurants uploaded`);
    
    console.log('\n🎉 All data uploaded successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Open your app and log in');
    console.log('   2. Clear IndexedDB in browser DevTools (Application > IndexedDB > Delete)');
    console.log('   3. Refresh the page to trigger sync');
    console.log('   4. Check console logs to verify sync');
    console.log(`   5. You should see: "${transformed.trip.name}" trip appear!`);
    
  } catch (error) {
    console.error('\n❌ Upload failed:', error);
    throw error;
  }
}

// Run the upload
uploadData()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
