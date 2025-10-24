# Timezone Format Migration Guide

## Overview

This guide explains how to migrate seed data from the old offset-based format to the new UTC + IANA timezone format.

## Changes

### Old Format (Offset-based)
```json
{
  "departure_time": "2025-11-03T19:30:00+07:00",
  "arrival_time": "2025-11-03T20:55:00+07:00"
}
```

### New Format (UTC + IANA Timezone)
```json
{
  "departure_time": "2025-11-03T12:30:00.000Z",
  "departure_timezone": "Asia/Bangkok",
  "arrival_time": "2025-11-03T13:55:00.000Z",
  "arrival_timezone": "Asia/Bangkok"
}
```

## Migration Script Usage

### 1. Configure Timezone Mappings

Edit `migrate-timezone-format.js` and add your offset → IANA timezone mappings:

```javascript
const TIMEZONE_MAPPING = {
  '+07:00': 'Asia/Bangkok',     // Bangkok, Jakarta
  '+08:00': 'Asia/Singapore',   // Singapore, Hong Kong
  '+09:00': 'Asia/Tokyo',       // Tokyo, Seoul
  // Add more mappings as needed
};
```

### 2. Run Migration

```bash
cd seed
node migrate-timezone-format.js <input-file> <output-file>
```

Example:
```bash
node migrate-timezone-format.js \
  test-data/bangkok-trip-2025.json \
  test-data/bangkok-trip-2025-migrated.json
```

### 3. Verify Output

The script will:
- Convert all flight and hotel times to UTC
- Add timezone fields with IANA names
- Print a migration summary

Example output:
```
📋 Starting timezone migration...
   Input:  test-data/bangkok-trip-2025.json
   Output: test-data/bangkok-trip-2025-migrated.json

✅ Migration complete!

📊 Migration Summary:
   Flights migrated: 2
   Hotels migrated:  1

💡 Timezone Mappings Used:
   +07:00 → Asia/Bangkok
```

### 4. Database Reset & Reseed

After migration, reset the database and load the new data:

```bash
# In browser console or app
await resetDatabase();
await seedDatabase();
```

## Common Timezone Mappings

| Offset | IANA Timezone | Cities |
|--------|---------------|--------|
| +07:00 | Asia/Bangkok | Bangkok, Jakarta, Ho Chi Minh |
| +08:00 | Asia/Singapore | Singapore, Hong Kong, Manila |
| +09:00 | Asia/Tokyo | Tokyo, Seoul |
| +05:30 | Asia/Kolkata | Mumbai, Delhi |
| +04:00 | Asia/Dubai | Dubai |
| +01:00 | Europe/Paris | Paris, Berlin, Rome |
| +00:00 | Europe/London | London |
| -05:00 | America/New_York | New York |
| -08:00 | America/Los_Angeles | Los Angeles |

## Affected Fields

### Flights
- `departure_time` → UTC string
- `departure_timezone` → IANA timezone (new)
- `arrival_time` → UTC string
- `arrival_timezone` → IANA timezone (new)

### Hotels
- `check_in_time` → UTC string
- `check_in_timezone` → IANA timezone (new)
- `check_out_time` → UTC string
- `check_out_timezone` → IANA timezone (new)

### Not Affected
- Activities (only use dates, no times)
- Restaurants (no time fields)
- Trips (dates only)

## Troubleshooting

### "No timezone mapping for offset"
Add the missing offset to `TIMEZONE_MAPPING` in the script.

### "Error converting to UTC"
Check that your input datetime strings are valid ISO 8601 format.

### Time displays incorrectly
Verify:
1. UTC conversion is correct (check script output)
2. Timezone field matches the original location
3. Browser timezone doesn't affect display (times should show in destination timezone)

## Manual Migration (Alternative)

If you prefer to manually edit JSON:

1. Convert each time to UTC using an online converter
2. Add the timezone field with IANA name
3. Example: `2025-11-03T19:30:00+07:00` becomes:
   - `"departure_time": "2025-11-03T12:30:00.000Z"`
   - `"departure_timezone": "Asia/Bangkok"`
