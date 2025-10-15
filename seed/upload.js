#!/usr/bin/env node

/**
 * Upload Test Data to Firestore
 * 
 * This script uploads test trip data to Firestore using Firebase Admin SDK.
 * It requires authentication via service account credentials.
 * 
 * Setup:
 *   1. Download service account key from Firebase Console:
 *      https://console.firebase.google.com/project/travo-32ec12/settings/serviceaccounts/adminsdk
 *   2. Click "Generate new private key"
 *   3. Save as service-account.json in this directory (gitignored)
 *   4. Run: npm run upload YOUR_EMAIL@example.com
 * 
 * Usage:
 *   npm run upload YOUR_EMAIL@example.com
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Get user email and optional trip file from command line
const userEmail = process.argv[2];
const tripFile = process.argv[3]; // Optional: specific trip file to upload

if (!userEmail) {
  console.error('❌ Error: Please provide your email address');
  console.log('\nUsage: npm run upload YOUR_EMAIL@example.com [TRIP_FILE]');
  console.log('\nExamples:');
  console.log('  npm run upload user@example.com');
  console.log('  npm run upload user@example.com 456def78-9abc-def0-1234-567890abcdef.json');
  console.log('  npm run upload user@example.com my-new-trip.json\n');
  process.exit(1);
}

console.log('🚀 Firebase Test Data Upload Script');
console.log('=====================================\n');
console.log(`📧 User email: ${userEmail}`);

// Check for service account file
const serviceAccountPath = path.join(__dirname, 'service-account.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('\n❌ Service account file not found!');
  console.log('\n📝 Setup Instructions:');
  console.log('   1. Go to Firebase Console:');
  console.log('      https://console.firebase.google.com/project/travo-32ec12/settings/serviceaccounts/adminsdk');
  console.log('   2. Click "Generate new private key"');
  console.log('   3. Save the downloaded file as: seed/service-account.json');
  console.log('   4. Run this script again\n');
  console.log('⚠️  Note: service-account.json is gitignored for security\n');
  process.exit(1);
}

// Initialize Firebase Admin
try {
  const serviceAccount = require(serviceAccountPath);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'travo-32ec12'
  });
  
  console.log('✅ Firebase Admin initialized\n');
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
  console.log('\n💡 Make sure service-account.json is valid JSON from Firebase Console\n');
  process.exit(1);
}

const db = admin.firestore();

// Read test data
const defaultTripFile = '123e4567-e89b-12d3-a456-426614174000.json'; // Tokyo trip
const selectedTripFile = tripFile || defaultTripFile;
const testDataPath = path.join(__dirname, 'test-data', selectedTripFile);

if (!fs.existsSync(testDataPath)) {
  console.error('❌ Test data file not found:', testDataPath);
  console.log('\n💡 Available trip files:');
  const testDataDir = path.join(__dirname, 'test-data');
  if (fs.existsSync(testDataDir)) {
    const files = fs.readdirSync(testDataDir).filter(f => f.endsWith('.json'));
    files.forEach(file => console.log(`   - ${file}`));
  }
  console.log('');
  process.exit(1);
}

const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
console.log(`📖 Loaded test data: ${testData.name} (${selectedTripFile})\n`);

// Helper function to remove undefined fields (Firestore doesn't accept undefined)
function cleanObject(obj) {
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

// Transform data to Firestore format
function transformToFirestoreFormat(trip, userEmail) {
  const now = new Date().toISOString();
  
  return {
    trip: cleanObject({
      id: trip.id,
      name: trip.name,
      destination: trip.description || 'Tokyo',
      start_date: trip.start_date,
      end_date: trip.end_date,
      user_access: [userEmail],
      updated_by: userEmail,
      updated_at: now,
      created_at: now
    }),
    flights: trip.flights.map((flight, index) => cleanObject({
      id: flight.id,
      trip_id: trip.id,
      direction: index === 0 ? 'outbound' : 'return',
      updated_by: userEmail,
      updated_at: now
    })),
    hotels: trip.hotels.map(hotel => cleanObject({
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
    })),
    activities: trip.activities.map(activity => {
      let timeOfDay = 'morning';
      if (activity.start_time) {
        const hour = new Date(activity.start_time).getHours();
        if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
        else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
        else if (hour >= 21 || hour < 6) timeOfDay = 'night';
      }
      
      return cleanObject({
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
      });
    }),
    restaurants: trip.restaurants.map(restaurant => cleanObject({
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
    }))
  };
}

// Upload to Firestore
async function uploadData() {
  try {
    console.log('📤 Transforming data for Firestore...\n');
    const transformed = transformToFirestoreFormat(testData, userEmail);
    
    console.log('📝 Data summary:');
    console.log(`   • Trip: ${transformed.trip.name}`);
    console.log(`   • Flights: ${transformed.flights.length}`);
    console.log(`   • Hotels: ${transformed.hotels.length}`);
    console.log(`   • Activities: ${transformed.activities.length}`);
    console.log(`   • Restaurants: ${transformed.restaurants.length}\n`);
    
    // Upload trip document
    console.log('⬆️  Uploading trip document...');
    await db.collection('trips').doc(transformed.trip.id).set(transformed.trip);
    console.log('   ✓ Trip uploaded');
    
    // Upload flights
    console.log('⬆️  Uploading flights...');
    const flightPromises = transformed.flights.map(flight =>
      db.collection('trips').doc(transformed.trip.id)
        .collection('flights').doc(flight.id).set(flight)
    );
    await Promise.all(flightPromises);
    console.log(`   ✓ ${transformed.flights.length} flights uploaded`);
    
    // Upload hotels
    console.log('⬆️  Uploading hotels...');
    const hotelPromises = transformed.hotels.map(hotel =>
      db.collection('trips').doc(transformed.trip.id)
        .collection('hotels').doc(hotel.id).set(hotel)
    );
    await Promise.all(hotelPromises);
    console.log(`   ✓ ${transformed.hotels.length} hotel(s) uploaded`);
    
    // Upload activities
    console.log('⬆️  Uploading activities...');
    const activityPromises = transformed.activities.map(activity =>
      db.collection('trips').doc(transformed.trip.id)
        .collection('activities').doc(activity.id).set(activity)
    );
    await Promise.all(activityPromises);
    console.log(`   ✓ ${transformed.activities.length} activities uploaded`);
    
    // Upload restaurants
    console.log('⬆️  Uploading restaurants...');
    const restaurantPromises = transformed.restaurants.map(restaurant =>
      db.collection('trips').doc(transformed.trip.id)
        .collection('restaurants').doc(restaurant.id).set(restaurant)
    );
    await Promise.all(restaurantPromises);
    console.log(`   ✓ ${transformed.restaurants.length} restaurants uploaded`);
    
    console.log('\n🎉 All data uploaded successfully!\n');
    console.log('📋 Next steps:');
    console.log('   1. Open your app and log in with', userEmail);
    console.log('   2. Open DevTools (F12) → Application → IndexedDB');
    console.log('   3. Delete "TravoLocalDB" database');
    console.log('   4. Refresh the page to trigger sync');
    console.log('   5. Check console logs - you should see sync messages');
    console.log(`   6. The trip "${transformed.trip.name}" should appear!\n`);
    
  } catch (error) {
    console.error('\n❌ Upload failed:', error);
    throw error;
  }
}

// Run the upload
uploadData()
  .then(() => {
    console.log('✅ Script completed successfully\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed\n');
    process.exit(1);
  });
