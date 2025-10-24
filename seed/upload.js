#!/usr/bin/env node

/**
 * Upload Test Data to Firestore
 * 
 * This script uploads test trip data to Firestore using Firebase Admin SDK.
 * It requires authentication via service account credentials.
 * 
 * Setup:
 *   1. Download service account key from Firebase Console:
 *      https://console.firebase.google.com/project/YOUR_PROJECT/settings/serviceaccounts/adminsdk
 *   2. Click "Generate new private key"
 *   3. Save as service-account.dev.json or service-account.prod.json in this directory (gitignored)
 *   4. Run: npm run upload:dev YOUR_EMAIL@example.com
 * 
 * Usage:
 *   npm run upload:dev YOUR_EMAIL@example.com [TRIP_FILE]
 *   npm run upload:prod YOUR_EMAIL@example.com [TRIP_FILE]
 *   
 *   Or with custom service account:
 *   node upload.js --env=dev --service-account=path/to/key.json YOUR_EMAIL@example.com
 *   
 *   Examples:
 *     npm run upload:dev user@example.com
 *     npm run upload:prod user@example.com 456def78-9abc-def0-1234-567890abcdef.json
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
let environment = 'dev'; // default
let customServiceAccount = null;
let userEmail = null;
let tripFile = null;

const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg.startsWith('--env=')) {
    environment = arg.split('=')[1];
  } else if (arg.startsWith('--service-account=')) {
    customServiceAccount = arg.split('=')[1];
  } else if (!userEmail) {
    userEmail = arg;
  } else if (!tripFile) {
    tripFile = arg;
  }
}

if (!userEmail) {
  console.error('❌ Error: Please provide your email address');
  console.log('\nUsage:');
  console.log('  npm run upload:dev YOUR_EMAIL@example.com [TRIP_FILE]');
  console.log('  npm run upload:prod YOUR_EMAIL@example.com [TRIP_FILE]');
  console.log('\nOr with custom service account:');
  console.log('  node upload.js --env=dev --service-account=path/to/key.json YOUR_EMAIL@example.com');
  console.log('\nExamples:');
  console.log('  npm run upload:dev user@example.com');
  console.log('  npm run upload:prod user@example.com 456def78-9abc-def0-1234-567890abcdef.json\n');
  process.exit(1);
}

console.log('🚀 Firebase Test Data Upload Script');
console.log('=====================================\n');
console.log(`🌍 Environment: ${environment}`);
console.log(`📧 User email: ${userEmail}`);

// Determine service account file path
let serviceAccountPath;
if (customServiceAccount) {
  serviceAccountPath = path.resolve(customServiceAccount);
} else {
  serviceAccountPath = path.join(__dirname, `service-account.${environment}.json`);
}

console.log(`🔑 Service account: ${path.basename(serviceAccountPath)}\n`);

if (!fs.existsSync(serviceAccountPath)) {
  console.error('\n❌ Service account file not found!');
  console.log(`\n📝 Looking for: ${serviceAccountPath}`);
  console.log('\n📝 Setup Instructions:');
  console.log('   1. Go to Firebase Console:');
  console.log('      https://console.firebase.google.com/project/YOUR_PROJECT/settings/serviceaccounts/adminsdk');
  console.log('   2. Click "Generate new private key"');
  console.log(`   3. Save the downloaded file as: seed/service-account.${environment}.json`);
  console.log('   4. Run this script again\n');
  console.log('⚠️  Note: service-account.*.json files are gitignored for security\n');
  process.exit(1);
}

// Initialize Firebase Admin
try {
  const serviceAccount = require(serviceAccountPath);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
  });
  
  console.log('✅ Firebase Admin initialized');
  console.log(`📦 Project: ${serviceAccount.project_id}`);
  console.log(`🌐 Database: ${serviceAccount.project_id} (default)\n`);
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
    flights: (trip.flights || []).map(flight => cleanObject({
      id: flight.id,
      trip_id: trip.id,
      airline: flight.airline,
      flight_number: flight.flight_number,
      departure_time: flight.departure_time,
      departure_timezone: flight.departure_timezone,
      arrival_time: flight.arrival_time,
      arrival_timezone: flight.arrival_timezone,
      departure_location: flight.departure_location,
      arrival_location: flight.arrival_location,
      confirmation_number: flight.confirmation_number,
      notes: flight.notes,
      updated_by: userEmail,
      updated_at: now
    })),
    hotels: (trip.hotels || []).map(hotel => cleanObject({
      id: hotel.id,
      trip_id: trip.id,
      name: hotel.name,
      address: hotel.address,
      city: hotel.city,
      plus_code: hotel.plus_code,
      google_maps_url: hotel.google_maps_url,
      latitude: hotel.latitude,
      longitude: hotel.longitude,
      check_in_time: hotel.check_in_time,
      check_in_timezone: hotel.check_in_timezone,
      check_out_time: hotel.check_out_time,
      check_out_timezone: hotel.check_out_timezone,
      confirmation_number: hotel.confirmation_number,
      phone: hotel.phone,
      notes: hotel.notes,
      updated_by: userEmail,
      updated_at: now
    })),
    activities: (trip.activities || []).map(activity => {
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
        google_maps_url: activity.google_maps_url,
        latitude: activity.latitude,
        longitude: activity.longitude,
        notes: activity.notes,
        order_index: activity.order_index,
        updated_by: userEmail,
        updated_at: now
      });
    }),
    restaurants: (trip.restaurants || []).map(restaurant => cleanObject({
      id: restaurant.id,
      trip_id: trip.id,
      name: restaurant.name,
      city: restaurant.city,
      cuisine_type: restaurant.cuisine_type,
      address: restaurant.address,
      plus_code: restaurant.plus_code,
      google_maps_url: restaurant.google_maps_url,
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
      notes: restaurant.notes,
      updated_by: userEmail,
      updated_at: now
    }))
  };
}

// Upload to Firestore
async function uploadData() {
  try {
    console.log('� Checking Firestore connection...');
    // Test connection by trying to access a collection
    const testRef = db.collection('trips').limit(1);
    try {
      await testRef.get();
      console.log('✅ Firestore connection successful\n');
    } catch (connError) {
      console.error('❌ Cannot connect to Firestore!');
      console.log('\n🔧 Possible issues:');
      console.log('   1. Firestore database not created in Firebase Console');
      console.log('   2. Database might be in a different location');
      console.log('   3. Service account lacks permissions\n');
      console.log('📋 To fix:');
      console.log('   1. Go to: https://console.firebase.google.com/project/_/firestore');
      console.log('   2. Create a Firestore database if it doesn\'t exist');
      console.log('   3. Choose "Start in production mode" or "Start in test mode"');
      console.log('   4. Select a location (e.g., us-central1)');
      console.log('   5. Wait for database creation to complete');
      console.log('   6. Run this script again\n');
      throw connError;
    }
    
    console.log('�📤 Transforming data for Firestore...\n');
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
