/**
 * Seed Data Timezone Migration Script
 * 
 * Converts existing seed data from offset format to UTC + IANA timezone format
 * 
 * Old format: "2025-11-03T19:30:00+07:00"
 * New format: "2025-11-03T12:30:00Z" + timezone: "Asia/Bangkok"
 * 
 * Usage:
 *   node migrate-timezone-format.js <input-file> <output-file>
 * 
 * Example:
 *   node migrate-timezone-format.js test-data/bangkok-trip-2025.json test-data/bangkok-trip-2025-migrated.json
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURABLE TIMEZONE MAPPING
// Add your offset → IANA timezone mappings here
// ============================================================================

const TIMEZONE_MAPPING = {
  '+07:00': 'Asia/Bangkok',     // Bangkok, Jakarta, Ho Chi Minh
  '+08:00': 'Asia/Singapore',   // Singapore, Hong Kong, Manila
  '+09:00': 'Asia/Tokyo',       // Tokyo, Seoul
  '+05:30': 'Asia/Kolkata',     // Mumbai, Delhi
  '+04:00': 'Asia/Dubai',       // Dubai
  '+01:00': 'Europe/Paris',     // Paris, Berlin, Rome
  '+00:00': 'Europe/London',    // London
  '-05:00': 'America/New_York', // New York
  '-07:00': 'America/Denver', //Denver
  '-08:00': 'America/Los_Angeles', // Los Angeles
  // Add more mappings as needed
};

/**
 * Extract timezone offset from ISO string
 */
function extractOffset(isoString) {
  const match = isoString.match(/([+-]\d{2}:\d{2})$/);
  return match ? match[1] : null;
}

/**
 * Convert ISO string with offset to UTC
 */
function convertToUTC(isoString) {
  if (!isoString) return null;
  
  try {
    const date = new Date(isoString);
    return date.toISOString();
  } catch (error) {
    console.error(`Error converting "${isoString}" to UTC:`, error.message);
    return null;
  }
}

/**
 * Get IANA timezone from offset
 */
function getTimezoneFromOffset(offset) {
  return TIMEZONE_MAPPING[offset] || null;
}

/**
 * Migrate a single datetime field
 */
function migrateDateTime(isoString) {
  if (!isoString) return { utc: null, timezone: null };
  
  const offset = extractOffset(isoString);
  if (!offset) {
    console.warn(`No offset found in "${isoString}", assuming already UTC`);
    return { utc: isoString, timezone: null };
  }
  
  const timezone = getTimezoneFromOffset(offset);
  if (!timezone) {
    console.warn(`No timezone mapping for offset "${offset}", skipping conversion`);
    return { utc: null, timezone: null };
  }
  
  const utc = convertToUTC(isoString);
  return { utc, timezone };
}

/**
 * Migrate flight data
 */
function migrateFlight(flight) {
  const departureMigrated = migrateDateTime(flight.departure_time);
  const arrivalMigrated = migrateDateTime(flight.arrival_time);
  
  return {
    ...flight,
    departure_time: departureMigrated.utc,
    departure_timezone: departureMigrated.timezone,
    arrival_time: arrivalMigrated.utc,
    arrival_timezone: arrivalMigrated.timezone,
  };
}

/**
 * Migrate hotel data
 */
function migrateHotel(hotel) {
  const checkInMigrated = migrateDateTime(hotel.check_in_time);
  const checkOutMigrated = migrateDateTime(hotel.check_out_time);
  
  return {
    ...hotel,
    check_in_time: checkInMigrated.utc,
    check_in_timezone: checkInMigrated.timezone,
    check_out_time: checkOutMigrated.utc,
    check_out_timezone: checkOutMigrated.timezone,
  };
}

/**
 * Migrate entire trip data
 */
function migrateTrip(trip) {
  const migratedTrip = { ...trip };
  
  // Migrate flights
  if (trip.flights && Array.isArray(trip.flights)) {
    migratedTrip.flights = trip.flights.map(migrateFlight);
  }
  
  // Migrate hotels
  if (trip.hotels && Array.isArray(trip.hotels)) {
    migratedTrip.hotels = trip.hotels.map(migrateHotel);
  }
  
  // Activities and restaurants don't have timezone fields
  
  return migratedTrip;
}

/**
 * Main migration function
 */
function migrateFile(inputPath, outputPath) {
  console.log(`\n📋 Starting timezone migration...`);
  console.log(`   Input:  ${inputPath}`);
  console.log(`   Output: ${outputPath}\n`);
  
  // Read input file
  let data;
  try {
    const fileContent = fs.readFileSync(inputPath, 'utf8');
    data = JSON.parse(fileContent);
  } catch (error) {
    console.error(`❌ Error reading input file: ${error.message}`);
    process.exit(1);
  }
  
  // Migrate data
  const migratedData = migrateTrip(data);
  
  // Write output file
  try {
    fs.writeFileSync(outputPath, JSON.stringify(migratedData, null, 2), 'utf8');
    console.log(`✅ Migration complete!`);
    console.log(`   Migrated file saved to: ${outputPath}\n`);
  } catch (error) {
    console.error(`❌ Error writing output file: ${error.message}`);
    process.exit(1);
  }
  
  // Print summary
  const flightsCount = migratedData.flights?.length || 0;
  const hotelsCount = migratedData.hotels?.length || 0;
  
  console.log(`📊 Migration Summary:`);
  console.log(`   Flights migrated: ${flightsCount}`);
  console.log(`   Hotels migrated:  ${hotelsCount}`);
  console.log(``);
  console.log(`💡 Timezone Mappings Used:`);
  Object.entries(TIMEZONE_MAPPING).forEach(([offset, tz]) => {
    console.log(`   ${offset} → ${tz}`);
  });
  console.log(``);
}

// ============================================================================
// CLI Interface
// ============================================================================

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log(`
Usage: node migrate-timezone-format.js <input-file> <output-file>

Example:
  node migrate-timezone-format.js test-data/bangkok-trip-2025.json test-data/bangkok-trip-2025-migrated.json

Configure timezone mappings in the TIMEZONE_MAPPING object at the top of this script.
`);
  process.exit(1);
}

const [inputFile, outputFile] = args;
const inputPath = path.resolve(inputFile);
const outputPath = path.resolve(outputFile);

// Check if input file exists
if (!fs.existsSync(inputPath)) {
  console.error(`❌ Input file not found: ${inputPath}`);
  process.exit(1);
}

// Run migration
migrateFile(inputPath, outputPath);
