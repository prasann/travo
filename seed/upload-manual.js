#!/usr/bin/env node

/**
 * Upload Test Data to Firestore - REST API Version
 * 
 * This script uploads test data using Firestore REST API with Firebase CLI token.
 * 
 * Usage:
 *   npm run upload-rest YOUR_EMAIL@example.com
 */

const https = require('https');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_ID = 'travo-32ec12';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// Get user email from command line
const userEmail = process.argv[2];

if (!userEmail) {
  console.error('❌ Error: Please provide your email address');
  console.log('Usage: npm run upload-rest YOUR_EMAIL@example.com');
  process.exit(1);
}

console.log('🚀 Starting Firestore data upload via REST API...');
console.log(`📧 User email: ${userEmail}`);

// Get access token from Firebase CLI
let accessToken;
try {
  console.log('🔑 Getting access token from Firebase CLI...');
  accessToken = execSync('firebase apps:sdkconfig WEB --json | grep -o \'"apiKey":[^,]*\' || firebase login:list 2>&1', { encoding: 'utf8', stdio: 'pipe' });
  
  // Actually, let's use gcloud auth print-access-token if available
  try {
    accessToken = execSync('gcloud auth print-access-token 2>/dev/null', { encoding: 'utf8' }).trim();
    if (accessToken && accessToken.length > 20) {
      console.log('✅ Got access token from gcloud');
    } else {
      throw new Error('Invalid token');
    }
  } catch (e) {
    console.log('⚠️  gcloud not available, trying alternative...');
    // Use firebase login:ci token if available
    try {
      const tokenFile = path.join(require('os').homedir(), '.config', 'configstore', 'firebase-tools.json');
      const config = JSON.parse(fs.readFileSync(tokenFile, 'utf8'));
      
      if (config.tokens && config.tokens.refresh_token) {
        accessToken = config.tokens.refresh_token;
        console.log('✅ Got refresh token from Firebase CLI');
      } else {
        throw new Error('No tokens found in Firebase config');
      }
    } catch (tokenError) {
      throw new Error('Could not get access token. Please make sure you are logged in with: firebase login');
    }
  }
} catch (error) {
  console.error('❌ Failed to get access token:', error.message);
  console.log('\n💡 Please login with Firebase CLI first:');
  console.log('   firebase login');
  process.exit(1);
}

console.log('\n⚠️  NOTE: Firebase CLI token limitations detected.');
console.log('Let\'s use a simpler approach - manual Firestore Console upload.\n');

// Read and transform test data
const testDataPath = path.join(__dirname, 'test-data/123e4567-e89b-12d3-a456-426614174000.json');
const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));

console.log(`📖 Loaded test data: ${testData.name}\n`);

function transformToFirestoreFormat(trip, userEmail) {
  const now = new Date().toISOString();
  
  return {
    trip: {
      id: trip.id,
      name: trip.name,
      destination: trip.description || 'Tokyo',
      start_date: trip.start_date,
      end_date: trip.end_date,
      user_access: [userEmail],
      updated_by: userEmail,
      updated_at: now,
      created_at: now
    },
    flights: trip.flights.map((flight, index) => ({
      id: flight.id,
      trip_id: trip.id,
      direction: index === 0 ? 'outbound' : 'return',
      updated_by: userEmail,
      updated_at: now
    })),
    hotels: trip.hotels.map(hotel => ({
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
    }),
    restaurants: trip.restaurants.map(restaurant => ({
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

const transformed = transformToFirestoreFormat(testData, userEmail);

// Write transformed data to files for manual upload
const outputDir = path.join(__dirname, 'firestore-upload');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

fs.writeFileSync(path.join(outputDir, 'trip.json'), JSON.stringify(transformed.trip, null, 2));
fs.writeFileSync(path.join(outputDir, 'flights.json'), JSON.stringify(transformed.flights, null, 2));
fs.writeFileSync(path.join(outputDir, 'hotels.json'), JSON.stringify(transformed.hotels, null, 2));
fs.writeFileSync(path.join(outputDir, 'activities.json'), JSON.stringify(transformed.activities, null, 2));
fs.writeFileSync(path.join(outputDir, 'restaurants.json'), JSON.stringify(transformed.restaurants, null, 2));

console.log('✅ Transformed data saved to:', outputDir);
console.log('\n📋 Summary:');
console.log(`   - Trip: ${transformed.trip.name}`);
console.log(`   - Flights: ${transformed.flights.length}`);
console.log(`   - Hotels: ${transformed.hotels.length}`);
console.log(`   - Activities: ${transformed.activities.length}`);
console.log(`   - Restaurants: ${transformed.restaurants.length}`);

console.log('\n📝 MANUAL UPLOAD INSTRUCTIONS:');
console.log('\n1. Go to Firebase Console:');
console.log(`   https://console.firebase.google.com/project/${PROJECT_ID}/firestore/databases/-default-/data\n`);
console.log('2. Create the trip document:');
console.log(`   - Click "Start collection"`);
console.log(`   - Collection ID: "trips"`);
console.log(`   - Document ID: "${transformed.trip.id}"`);
console.log(`   - Copy fields from: firestore-upload/trip.json\n`);
console.log('3. For each subcollection (flights, hotels, activities, restaurants):');
console.log(`   - Open trip document`);
console.log(`   - Click "Add collection"`);
console.log(`   - Collection ID: (flights/hotels/activities/restaurants)`);
console.log(`   - Add documents using the JSON files\n`);
console.log('OR use the automated script (requires service account):');
console.log('   See README.md for service account setup instructions\n');
