#!/usr/bin/env node

/**
 * Convert Google Maps URLs to Activities JSON
 * 
 * Usage:
 *   GOOGLE_MAPS_API_KEY=your_key node convert-activities.js [INPUT_FILE] [OUTPUT_FILE]
 * 
 * Input: activities-input.json
 * Output: activities-output.json (ready for upload.js)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

// Get command line arguments
const inputFile = process.argv[2] || 'activities-input.json';
const outputFile = process.argv[3] || 'activities-output.json';

// Get Google Maps API key from environment
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
  console.error('❌ Error: GOOGLE_MAPS_API_KEY environment variable not set');
  console.log('\nUsage: GOOGLE_MAPS_API_KEY=your_key node convert-activities.js [INPUT_FILE] [OUTPUT_FILE]');
  console.log('\nExample:');
  console.log('  GOOGLE_MAPS_API_KEY=AIza... node convert-activities.js activities-input.json activities-output.json\n');
  process.exit(1);
}

console.log('🚀 Convert Activities Script');
console.log('============================\n');
console.log(`📁 Input: ${inputFile}`);
console.log(`📁 Output: ${outputFile}\n`);

// Read input data
const inputPath = path.join(__dirname, inputFile);

if (!fs.existsSync(inputPath)) {
  console.error('❌ Input file not found:', inputPath);
  console.log('\n💡 Create activities-input.json with this format:');
  console.log(`{
  "2025-10-20": ["https://maps.app.goo.gl/xxx", ...],
  "2025-10-21": ["https://maps.app.goo.gl/yyy"]
}\n`);
  process.exit(1);
}

const activitiesByDate = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

// Helper: Make HTTPS request
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ data, finalUrl: res.responseUrl || url });
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

// Helper: Resolve short links
async function resolveShortLink(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0' },
      followAllRedirects: true
    }, (res) => {
      const finalUrl = res.responseUrl || url;
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(res.headers.location);
      } else {
        resolve(finalUrl);
      }
      res.on('data', () => {});
      res.on('end', () => {});
    }).on('error', reject);
  });
}

// Helper: Extract place name from URL
function extractPlaceName(url) {
  try {
    const urlObj = new URL(url);
    const placeMatch = urlObj.pathname.match(/\/place\/([^/@?#]+)/);
    if (placeMatch) {
      return decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
    }
    const searchMatch = urlObj.pathname.match(/\/maps\/search\/([^/]+)/);
    if (searchMatch) {
      return decodeURIComponent(searchMatch[1].replace(/\+/g, ' '));
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Helper: Look up place details
async function lookupPlaceDetails(mapsUrl) {
  try {
    console.log(`   🔍 ${mapsUrl}`);
    
    let resolvedUrl = mapsUrl;
    if (mapsUrl.includes('maps.app.goo.gl')) {
      resolvedUrl = await resolveShortLink(mapsUrl);
    }
    
    const placeName = extractPlaceName(resolvedUrl);
    if (!placeName) {
      throw new Error('Could not extract place name from URL');
    }
    
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(placeName)}&key=${GOOGLE_MAPS_API_KEY}`;
    const { data } = await httpsGet(searchUrl);
    const searchData = JSON.parse(data);
    
    if (searchData.status !== 'OK' || !searchData.results || searchData.results.length === 0) {
      throw new Error(`Places API error: ${searchData.status}`);
    }
    
    const place = searchData.results[0];
    let city;
    if (place.address_components) {
      const cityComponent = place.address_components.find(c => c.types.includes('locality'));
      if (cityComponent) {
        city = cityComponent.long_name;
      }
    }
    
    console.log(`      ✓ ${place.name}`);
    
    return {
      name: place.name,
      address: place.formatted_address,
      plus_code: place.plus_code?.global_code,
      city: city,
      google_maps_url: mapsUrl,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng
    };
    
  } catch (error) {
    console.error(`      ✗ Error: ${error.message}`);
    throw error;
  }
}

// Helper: Generate UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Main conversion function
async function convertActivities() {
  try {
    const allActivities = [];
    let totalProcessed = 0;
    let totalFailed = 0;
    
    for (const [date, urls] of Object.entries(activitiesByDate)) {
      console.log(`📅 ${date} (${urls.length} activities):\n`);
      
      let orderIndex = 0;
      
      for (const url of urls) {
        try {
          const placeDetails = await lookupPlaceDetails(url);
          
          const activity = {
            id: generateUUID(),
            date: date,
            ...placeDetails,
            order_index: orderIndex++,
            notes: ''
          };
          
          allActivities.push(activity);
          totalProcessed++;
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          console.error(`   ✗ Failed: ${url}\n`);
          totalFailed++;
        }
      }
      
      console.log('');
    }
    
    if (allActivities.length === 0) {
      console.log('❌ No activities to save\n');
      process.exit(1);
    }
    
    console.log(`📊 Summary:`);
    console.log(`   • Successfully processed: ${totalProcessed}`);
    console.log(`   • Failed: ${totalFailed}\n`);
    
    // Write output file
    const outputPath = path.join(__dirname, outputFile);
    fs.writeFileSync(outputPath, JSON.stringify(allActivities, null, 2));
    
    console.log(`✅ Saved to ${outputFile}\n`);
    console.log('📋 Next: Use upload.js to import this into Firestore\n');
    
  } catch (error) {
    console.error('\n❌ Conversion failed:', error);
    throw error;
  }
}

// Run the conversion
convertActivities()
  .then(() => {
    console.log('✅ Done!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Failed\n');
    process.exit(1);
  });
