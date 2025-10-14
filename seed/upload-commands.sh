🚀 Starting Firestore data upload...
📧 User email: YOUR_EMAIL
📖 Loaded test data: Tokyo Spring Adventure

📤 Transforming data for Firestore...
📝 Data summary:
   - Trip: Tokyo Spring Adventure
   - Flights: 2
   - Hotels: 1
   - Activities: 7
   - Restaurants: 3

📋 Generated Firebase CLI commands:

# Copy and paste these commands to upload the data:

# 1. Upload trip document
firebase firestore:write trips/123e4567-e89b-12d3-a456-426614174000 '{"id":"123e4567-e89b-12d3-a456-426614174000","name":"Tokyo Spring Adventure","destination":"7-day journey to experience cherry blossom season in Japan","start_date":"2025-04-01","end_date":"2025-04-07","user_access":["YOUR_EMAIL"],"updated_by":"YOUR_EMAIL","updated_at":"2025-10-14T07:20:52.430Z","created_at":"2025-10-14T07:20:52.430Z"}'

# 2. Upload flights (2 total)
firebase firestore:write trips/123e4567-e89b-12d3-a456-426614174000/flights/flight-001 '{"id":"flight-001","trip_id":"123e4567-e89b-12d3-a456-426614174000","direction":"outbound","updated_by":"YOUR_EMAIL","updated_at":"2025-10-14T07:20:52.430Z"}'
firebase firestore:write trips/123e4567-e89b-12d3-a456-426614174000/flights/flight-002 '{"id":"flight-002","trip_id":"123e4567-e89b-12d3-a456-426614174000","direction":"return","updated_by":"YOUR_EMAIL","updated_at":"2025-10-14T07:20:52.430Z"}'

# 3. Upload hotels (1 total)
firebase firestore:write trips/123e4567-e89b-12d3-a456-426614174000/hotels/hotel-001 '{"id":"hotel-001","trip_id":"123e4567-e89b-12d3-a456-426614174000","name":"Tokyo Grand Hotel","address":"1-2-3 Shinjuku, Shinjuku-ku, Tokyo 160-0022","city":"Tokyo","check_in_date":"2025-04-02","check_out_date":"2025-04-07","updated_by":"YOUR_EMAIL","updated_at":"2025-10-14T07:20:52.430Z"}'

# 4. Upload activities (7 total)
firebase firestore:write trips/123e4567-e89b-12d3-a456-426614174000/activities/activity-001 '{"id":"activity-001","trip_id":"123e4567-e89b-12d3-a456-426614174000","name":"Tokyo Skytree","date":"2025-04-02","time_of_day":"afternoon","city":"Tokyo","plus_code":"8Q7XQX4R+33","address":"1 Chome-1-2 Oshiage, Sumida City, Tokyo","notes":"Visit around sunset for best views. Buy tickets online to skip queue.","order_index":0,"updated_by":"YOUR_EMAIL","updated_at":"2025-10-14T07:20:52.430Z"}'
firebase firestore:write trips/123e4567-e89b-12d3-a456-426614174000/activities/activity-002 '{"id":"activity-002","trip_id":"123e4567-e89b-12d3-a456-426614174000","name":"Senso-ji Temple","date":"2025-04-03","time_of_day":"night","city":"Tokyo","plus_code":"8Q7XPM8F+33","address":"2 Chome-3-1 Asakusa, Taito City, Tokyo","notes":"Arrive early to avoid crowds. Check out Nakamise shopping street.","order_index":0,"updated_by":"YOUR_EMAIL","updated_at":"2025-10-14T07:20:52.430Z"}'
firebase firestore:write trips/123e4567-e89b-12d3-a456-426614174000/activities/activity-003 '{"id":"activity-003","trip_id":"123e4567-e89b-12d3-a456-426614174000","name":"Ueno Park Cherry Blossoms","date":"2025-04-03","time_of_day":"morning","city":"Tokyo","plus_code":"8Q7XPP6H+22","address":"Uenokoen, Taito City, Tokyo","notes":"Peak cherry blossom season. Bring picnic blanket for hanami.","order_index":1,"updated_by":"YOUR_EMAIL","updated_at":"2025-10-14T07:20:52.430Z"}'
firebase firestore:write trips/123e4567-e89b-12d3-a456-426614174000/activities/activity-004 '{"id":"activity-004","trip_id":"123e4567-e89b-12d3-a456-426614174000","name":"Meiji Shrine","date":"2025-04-04","time_of_day":"morning","city":"Tokyo","plus_code":"8Q7XPMHP+88","address":"1-1 Yoyogikamizonocho, Shibuya City, Tokyo","notes":"Peaceful shrine in forested area. Free admission.","order_index":0,"updated_by":"YOUR_EMAIL","updated_at":"2025-10-14T07:20:52.430Z"}'
firebase firestore:write trips/123e4567-e89b-12d3-a456-426614174000/activities/activity-005 '{"id":"activity-005","trip_id":"123e4567-e89b-12d3-a456-426614174000","name":"Shibuya Crossing","date":"2025-04-04","time_of_day":"afternoon","city":"Tokyo","plus_code":"8Q7XPM5F+44","address":"2 Chome-2-1 Dogenzaka, Shibuya City, Tokyo","notes":"Watch from Starbucks 2nd floor for best view. Most crowded around 6-7pm.","order_index":1,"updated_by":"YOUR_EMAIL","updated_at":"2025-10-14T07:20:52.430Z"}'
firebase firestore:write trips/123e4567-e89b-12d3-a456-426614174000/activities/activity-006 '{"id":"activity-006","trip_id":"123e4567-e89b-12d3-a456-426614174000","name":"TeamLab Borderless","date":"2025-04-05","time_of_day":"morning","city":"Tokyo","plus_code":"8Q7XPP3M+66","address":"1-3-8 Aomi, Koto City, Tokyo","notes":"Digital art museum. Book tickets in advance - sells out quickly!","order_index":0,"updated_by":"YOUR_EMAIL","updated_at":"2025-10-14T07:20:52.430Z"}'
firebase firestore:write trips/123e4567-e89b-12d3-a456-426614174000/activities/activity-007 '{"id":"activity-007","trip_id":"123e4567-e89b-12d3-a456-426614174000","name":"Tsukiji Outer Market","date":"2025-04-06","time_of_day":"night","city":"Tokyo","plus_code":"8Q7XPP4J+88","address":"4 Chome-16 Tsukiji, Chuo City, Tokyo","notes":"Fresh sushi breakfast. Arrive early for best selection.","order_index":0,"updated_by":"YOUR_EMAIL","updated_at":"2025-10-14T07:20:52.430Z"}'

# 5. Upload restaurants (3 total)
firebase firestore:write trips/123e4567-e89b-12d3-a456-426614174000/restaurants/restaurant-001 '{"id":"restaurant-001","trip_id":"123e4567-e89b-12d3-a456-426614174000","name":"Ichiran Ramen","city":"Tokyo","cuisine_type":"Japanese (Ramen)","address":"1-22-7 Jinnan, Shibuya City, Tokyo","plus_code":"8Q7XPM5F+11","notes":"Famous tonkotsu ramen chain. Open 24 hours, no reservation needed. Try the extra-rich broth!","updated_by":"YOUR_EMAIL","updated_at":"2025-10-14T07:20:52.430Z"}'
firebase firestore:write trips/123e4567-e89b-12d3-a456-426614174000/restaurants/restaurant-002 '{"id":"restaurant-002","trip_id":"123e4567-e89b-12d3-a456-426614174000","name":"Sushi Dai","city":"Tokyo","cuisine_type":"Japanese (Sushi)","address":"5 Chome-2-1 Tsukiji, Chuo City, Tokyo","notes":"Legendary sushi spot. Expect 2-3 hour wait. Opens at 5am. Cash only.","updated_by":"YOUR_EMAIL","updated_at":"2025-10-14T07:20:52.430Z"}'
firebase firestore:write trips/123e4567-e89b-12d3-a456-426614174000/restaurants/restaurant-003 '{"id":"restaurant-003","trip_id":"123e4567-e89b-12d3-a456-426614174000","name":"Gonpachi Nishi-Azabu","city":"Tokyo","cuisine_type":"Japanese (Izakaya)","address":"1-13-11 Nishi-Azabu, Minato City, Tokyo","notes":"Featured in Kill Bill movie. Reservations recommended for dinner.","updated_by":"YOUR_EMAIL","updated_at":"2025-10-14T07:20:52.430Z"}'

💡 Or save these to a file and execute:
   node upload-test-data-cli.js YOUR_EMAIL > upload-commands.sh
   chmod +x upload-commands.sh
   ./upload-commands.sh

