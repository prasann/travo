#!/usr/bin/env node

/**
 * Upload Test Data to Firestore - Client SDK Version
 * 
 * This script uses the Firebase client SDK (same as the app) to upload data.
 * It uses your existing Firebase CLI authentication.
 * 
 * Usage:
 *   npm run upload YOUR_EMAIL@example.com
 */

const fs = require('fs');
const path = require('path');

// Get user email from command line
const userEmail = process.argv[2];

if (!userEmail) {
  console.error('❌ Error: Please provide your email address');
  console.log('Usage: npm run upload YOUR_EMAIL@example.com');
  process.exit(1);
}

console.log('🚀 Starting Firestore data upload...');
console.log(`📧 User email: ${userEmail}`);

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
    destination: trip.description || 'Tokyo',
    start_date: trip.start_date,
    end_date: trip.end_date,
    user_access: [userEmail],
    updated_by: userEmail,
    updated_at: now,
    created_at: now
  };
  
  // Transform flights
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
    check_in_date: hotel.check_in_time?.split('T')[0],
    check_out_date: hotel.check_out_time?.split('T')[0],
    updated_by: userEmail,
    updated_at: now
  }));
  
  // Transform activities
  const firestoreActivities = trip.activities.map(activity => {
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

console.log('\n📤 Transforming data for Firestore...');
const transformed = transformToFirestoreFormat(testData, userEmail);

console.log('📝 Data summary:');
console.log(`   - Trip: ${transformed.trip.name}`);
console.log(`   - Flights: ${transformed.flights.length}`);
console.log(`   - Hotels: ${transformed.hotels.length}`);
console.log(`   - Activities: ${transformed.activities.length}`);
console.log(`   - Restaurants: ${transformed.restaurants.length}`);

// Generate Firebase CLI commands
console.log('\n📋 Generated Firebase CLI commands:\n');
console.log('# Copy and paste these commands to upload the data:\n');

// Trip
console.log(`# 1. Upload trip document`);
console.log(`firebase firestore:write trips/${transformed.trip.id} '${JSON.stringify(transformed.trip)}'\n`);

// Flights
console.log(`# 2. Upload flights (${transformed.flights.length} total)`);
transformed.flights.forEach((flight, i) => {
  console.log(`firebase firestore:write trips/${transformed.trip.id}/flights/${flight.id} '${JSON.stringify(flight)}'`);
});
console.log('');

// Hotels
console.log(`# 3. Upload hotels (${transformed.hotels.length} total)`);
transformed.hotels.forEach((hotel, i) => {
  console.log(`firebase firestore:write trips/${transformed.trip.id}/hotels/${hotel.id} '${JSON.stringify(hotel)}'`);
});
console.log('');

// Activities
console.log(`# 4. Upload activities (${transformed.activities.length} total)`);
transformed.activities.forEach((activity, i) => {
  console.log(`firebase firestore:write trips/${transformed.trip.id}/activities/${activity.id} '${JSON.stringify(activity)}'`);
});
console.log('');

// Restaurants
console.log(`# 5. Upload restaurants (${transformed.restaurants.length} total)`);
transformed.restaurants.forEach((restaurant, i) => {
  console.log(`firebase firestore:write trips/${transformed.trip.id}/restaurants/${restaurant.id} '${JSON.stringify(restaurant)}'`);
});

console.log('\n💡 Or save these to a file and execute:');
console.log('   node upload-test-data-cli.js YOUR_EMAIL > upload-commands.sh');
console.log('   chmod +x upload-commands.sh');
console.log('   ./upload-commands.sh\n');
