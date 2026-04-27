import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Doctor from './src/models/Doctor.js';

dotenv.config();

const AHMEDABAD = { lat: 23.0225, lng: 72.5714 };
const GANDHINAGAR = { lat: 23.2156, lng: 72.6369 };

const indianFirstNames = ['Rahul', 'Priya', 'Amit', 'Neha', 'Vikram', 'Sneha', 'Arjun', 'Kavya', 'Rohan', 'Fatima', 'Ankit', 'Pooja', 'Sanjay', 'Ritu'];
const indianLastNames = ['Patel', 'Shah', 'Desai', 'Mehta', 'Trivedi', 'Sharma', 'Joshi', 'Bose', 'Sheikh', 'Nair'];
const specialtiesList = ['General Physician', 'Cardiologist', 'Dermatologist', 'Orthopedic', 'Pediatrician', 'ENT Specialist', 'Dentist', 'Physiotherapist'];
const languagesList = ['English', 'Hindi', 'Gujarati', 'Bengali', 'Tamil', 'Kannada'];

const generateRandomDoctor = (place) => {
  const firstName = indianFirstNames[Math.floor(Math.random() * indianFirstNames.length)];
  const lastName = indianLastNames[Math.floor(Math.random() * indianLastNames.length)];
  const name = `Dr. ${firstName} ${lastName}`;
  const specialty = specialtiesList[Math.floor(Math.random() * specialtiesList.length)];

  const numLangs = Math.floor(Math.random() * 3) + 1;
  const shuffledLangs = [...languagesList].sort(() => 0.5 - Math.random());

  // Create realistic fee rounded to nearest 100
  const fee = Math.round((Math.floor(Math.random() * (1500 - 400 + 1)) + 400) / 100) * 100;

  return {
    name,
    specialty,
    languages: shuffledLangs.slice(0, numLangs),
    rating: place.rating || Number((Math.random() * (5.0 - 3.8) + 3.8).toFixed(1)),
    reviews: place.user_ratings_total || Math.floor(Math.random() * 300) + 10,
    fee,
    initials: `${firstName[0]}${lastName[0]}`,
    color: ['bg-primary-700', 'bg-teal-600', 'bg-emerald-700', 'bg-cyan-700', 'bg-sky-700', 'bg-amber-700', 'bg-violet-700'][Math.floor(Math.random() * 7)],
    bio: `Consulting at ${place.name}. Highly experienced ${specialty} dedicated to providing excellent patient care. Address: ${place.vicinity}`,
    estimatedTreatment: `₹${fee}–₹${fee + 1500}`,
    timeSlots: {
      morning: ['9:00 AM', '10:00 AM', '11:30 AM'],
      afternoon: ['2:00 PM', '3:30 PM'],
      evening: ['6:00 PM', '7:00 PM', '8:00 PM'],
    },
    location: { type: 'Point', coordinates: [place.geometry.location.lng, place.geometry.location.lat] },
    verified: true
  };
};

const fetchAndSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected.');

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      console.error('❌ Missing GOOGLE_PLACES_API_KEY in .env');
      process.exit(1);
    }

    console.log('📡 Fetching real clinics in Ahmedabad...');
    const urlAhm = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${AHMEDABAD.lat},${AHMEDABAD.lng}&radius=15000&type=doctor&key=${apiKey}`;
    const resAhm = await fetch(urlAhm);
    const dataAhm = await resAhm.json();

    console.log('📡 Fetching real clinics in Gandhinagar...');
    const urlGnd = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${GANDHINAGAR.lat},${GANDHINAGAR.lng}&radius=10000&type=doctor&key=${apiKey}`;
    const resGnd = await fetch(urlGnd);
    const dataGnd = await resGnd.json();

    if (dataAhm.status !== 'OK' && dataAhm.status !== 'ZERO_RESULTS') {
      console.error('Google API Error (Ahmedabad):', dataAhm.status, dataAhm.error_message);
      process.exit(1);
    }

    const allPlaces = [...(dataAhm.results || []), ...(dataGnd.results || [])];

    // Remove duplicates based on place_id
    const uniquePlaces = Array.from(new Map(allPlaces.map(item => [item.place_id, item])).values());
    console.log(`✅ Found ${uniquePlaces.length} unique real-world clinics/hospitals.`);

    if (uniquePlaces.length === 0) {
      console.log('No places found. Exiting.');
      process.exit(0);
    }

    const newDoctors = uniquePlaces.map(generateRandomDoctor);

    // Clear old doctors
    await Doctor.deleteMany();
    console.log('🗑️ Cleared old mock doctors from database.');

    // Insert new generated doctors
    await Doctor.insertMany(newDoctors);
    console.log(`🎉 Successfully generated and seeded ${newDoctors.length} realistic doctors into MongoDB!`);

    process.exit();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fetchAndSeed();
