// =====================================================
// MOCK DATA — MediTravel Assist
// =====================================================

// Helper to get logged-in user from localStorage
export function getLoggedInUser() {
  try {
    const stored = localStorage.getItem('caretrip_user');
    if (stored) {
      const user = JSON.parse(stored);
      const nameParts = (user.name || '').trim().split(' ');
      const initials = nameParts.length >= 2
        ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
        : (user.name || 'U').substring(0, 2).toUpperCase();
      return {
        name: user.name || 'User',
        email: user.email || '',
        phone: user.phone || '+91 98765 43210',
        initials,
        ...user,
      };
    }
  } catch (e) {
    // ignore parse errors
  }
  return {
    name: 'Guest User',
    email: 'guest@meditravel.com',
    phone: '+91 98765 43210',
    initials: 'GU',
  };
}

export const doctors = [
  {
    id: 1,
    name: 'Dr. Priya Mehta',
    specialty: 'General Physician',
    languages: ['English', 'Hindi'],
    rating: 4.8,
    reviews: 142,
    fee: 600,
    verified: true,
    available: 'Available Today',
    initials: 'PM',
    color: 'bg-primary-700',
    bio: '10+ years experience. Fluent in English and Hindi. Specializes in travel-related illnesses, vaccinations, and general health check-ups for international travelers.',
    estimatedTreatment: '₹600–₹1,500',
    timeSlots: {
      morning: ['9:00 AM', '10:00 AM', '11:00 AM'],
      afternoon: ['2:00 PM', '3:30 PM'],
      evening: ['6:00 PM', '7:00 PM'],
    },
    reviewsList: [
      { text: 'Very helpful, spoke excellent English. Diagnosed quickly.', author: 'Raj M.', type: 'Tourist', rating: 5 },
      { text: 'Transparent about costs, no surprise bills.', author: 'Lisa K.', type: 'Business Traveler', rating: 4 },
    ],
  },
  {
    id: 2,
    name: 'Dr. Arjun Sharma',
    specialty: 'Cardiologist',
    languages: ['English'],
    rating: 4.6,
    reviews: 98,
    fee: 1200,
    verified: true,
    available: 'Available Today',
    initials: 'AS',
    color: 'bg-secondary-700',
    bio: '15+ years in cardiology. Known for patient-friendly consultations. Experienced with expat and traveler health concerns.',
    estimatedTreatment: '₹1,200–₹3,000',
    timeSlots: {
      morning: ['9:00 AM', '10:30 AM'],
      afternoon: ['1:00 PM', '2:30 PM', '4:00 PM'],
      evening: ['5:30 PM'],
    },
    reviewsList: [
      { text: 'Very thorough examination, explained everything clearly.', author: 'Mike S.', type: 'Tourist', rating: 5 },
      { text: 'Good experience overall, slightly pricey.', author: 'Deepak R.', type: 'Business Traveler', rating: 4 },
    ],
  },
  {
    id: 3,
    name: 'Dr. Kavya Nair',
    specialty: 'Dermatologist',
    languages: ['English', 'Tamil'],
    rating: 4.9,
    reviews: 210,
    fee: 800,
    verified: true,
    available: 'Available Today',
    initials: 'KN',
    color: 'bg-teal-600',
    bio: '12+ years in dermatology. Expert in tropical skin conditions, sun damage, and allergic reactions common among travelers.',
    estimatedTreatment: '₹800–₹2,000',
    timeSlots: {
      morning: ['8:30 AM', '10:00 AM', '11:30 AM'],
      afternoon: ['2:00 PM', '3:00 PM'],
      evening: ['6:00 PM', '7:30 PM'],
    },
    reviewsList: [
      { text: 'Amazing doctor! Treated my sun rash in one visit.', author: 'Sarah L.', type: 'Tourist', rating: 5 },
      { text: 'Very knowledgeable about tropical skin issues.', author: 'Anita P.', type: 'Domestic Traveler', rating: 5 },
    ],
  },
  {
    id: 4,
    name: 'Dr. Rahul Desai',
    specialty: 'Orthopedic',
    languages: ['English', 'Hindi'],
    rating: 4.5,
    reviews: 87,
    fee: 900,
    verified: true,
    available: 'Tomorrow',
    initials: 'RD',
    color: 'bg-cyan-700',
    bio: '8+ years in orthopedics. Handles sports injuries, fractures, and mobility issues frequently seen in adventure travelers.',
    estimatedTreatment: '₹900–₹2,500',
    timeSlots: {
      morning: ['9:00 AM', '10:00 AM'],
      afternoon: ['1:30 PM', '3:00 PM', '4:30 PM'],
      evening: ['6:30 PM'],
    },
    reviewsList: [
      { text: 'Fixed my sprained ankle quickly, great care.', author: 'Tom B.', type: 'Adventure Traveler', rating: 5 },
      { text: 'Professional and efficient.', author: 'Neha D.', type: 'Tourist', rating: 4 },
    ],
  },
  {
    id: 5,
    name: 'Dr. Fatima Sheikh',
    specialty: 'Pediatrician',
    languages: ['English', 'Kannada'],
    rating: 4.7,
    reviews: 165,
    fee: 500,
    verified: true,
    available: 'Available Today',
    initials: 'FS',
    color: 'bg-emerald-700',
    bio: '9+ years in pediatrics. Gentle and patient-friendly. Experienced with children\'s travel sickness and vaccinations.',
    estimatedTreatment: '₹500–₹1,200',
    timeSlots: {
      morning: ['9:30 AM', '10:30 AM', '11:30 AM'],
      afternoon: ['2:00 PM', '3:30 PM'],
      evening: ['5:00 PM', '6:30 PM'],
    },
    reviewsList: [
      { text: 'So gentle with my 3-year-old. Highly recommend!', author: 'Maria G.', type: 'Family Traveler', rating: 5 },
      { text: 'Very patient and thorough examination.', author: 'Arun K.', type: 'Tourist', rating: 4 },
    ],
  },
  {
    id: 6,
    name: 'Dr. Ankit Bose',
    specialty: 'General Physician',
    languages: ['English', 'Bengali'],
    rating: 4.3,
    reviews: 64,
    fee: 400,
    verified: true,
    available: 'Available Today',
    initials: 'AB',
    color: 'bg-sky-700',
    bio: '7+ years in general medicine. Affordable consultations with a focus on travel health, food-related illness, and common infections.',
    estimatedTreatment: '₹400–₹1,000',
    timeSlots: {
      morning: ['9:00 AM', '10:00 AM', '11:00 AM'],
      afternoon: ['1:00 PM', '2:30 PM', '4:00 PM'],
      evening: ['6:00 PM', '7:00 PM', '8:00 PM'],
    },
    reviewsList: [
      { text: 'Great doctor, very affordable.', author: 'John D.', type: 'Budget Traveler', rating: 4 },
      { text: 'Quick diagnosis, good advice on food safety.', author: 'Priti S.', type: 'Tourist', rating: 4 },
    ],
  },
];

export const hospitals = [
  {
    id: 1,
    name: 'Kokilaben Dhirubhai Ambani Hospital',
    distance: '1.2 km',
    emergency: true,
    phone: '+91-22-4269-6969',
  },
  {
    id: 2,
    name: 'Lilavati Hospital',
    distance: '3.5 km',
    emergency: true,
    phone: '+91-22-2675-1000',
  },
  {
    id: 3,
    name: 'Hinduja Hospital',
    distance: '5.1 km',
    emergency: true,
    phone: '+91-22-2445-1515',
  },
  {
    id: 4,
    name: 'Breach Candy Hospital',
    distance: '6.8 km',
    emergency: true,
    phone: '+91-22-2366-7788',
  },
];

export const upcomingBookings = [
  {
    id: 1,
    doctor: 'Dr. Sneha Joshi',
    specialty: 'Dermatologist',
    date: 'Mon, 28 April 2026',
    time: '10:30 AM',
    location: 'Skin Care Clinic, Bandra, Mumbai',
    status: 'Confirmed',
  },
  {
    id: 2,
    doctor: 'Dr. Priya Mehta',
    specialty: 'General Physician',
    date: 'Wed, 30 April 2026',
    time: '3:00 PM',
    location: 'City Medical Center, Andheri, Mumbai',
    status: 'Confirmed',
  },
];

export const pastBookings = [
  {
    id: 3,
    doctor: 'Dr. Rohan Kapoor',
    specialty: 'General Physician',
    date: '20 April 2026',
    time: '11:00 AM',
    location: 'HealthFirst Clinic, Juhu, Mumbai',
    status: 'Completed',
  },
];

export const cancelledBookings = [
  {
    id: 4,
    doctor: 'Dr. Arjun Sharma',
    specialty: 'Cardiologist',
    date: '15 April 2026',
    time: '2:00 PM',
    location: 'Heart Care Center, Worli, Mumbai',
    status: 'Cancelled',
  },
];

export const recentAppointments = [
  {
    doctor: 'Dr. Rohan Kapoor',
    specialty: 'General Physician',
    date: '20 April 2026',
    status: 'Completed',
  },
  {
    doctor: 'Dr. Sneha Joshi',
    specialty: 'Dermatologist',
    date: '28 April 2026',
    status: 'Upcoming',
  },
];

export const userProfile = {
  name: 'Aryan Shah',
  initials: 'AS',
  email: 'aryan.shah@email.com',
  phone: '+91 98765 43210',
  dob: '12 March 1995',
  nationality: 'Indian',
  preferredLanguage: 'English',
  gender: 'Male',
  currentCity: 'Mumbai, India',
  homeCountry: 'India',
  travelPurpose: 'Tourism',
  tripDuration: '15 April – 5 May 2026',
  allergies: 'None',
  chronicConditions: 'None',
  bloodGroup: 'B+',
  emergencyContact: '+91 98765 00000 (Father)',
};

export const safetyTips = [
  {
    iconType: 'id-card',
    title: 'Carry ID & Insurance',
    description: 'Carry your ID and insurance card at all times',
  },
  {
    iconType: 'pill',
    title: 'Know Your Medications',
    description: 'Know your current medications and dosages',
  },
  {
    iconType: 'smartphone',
    title: 'Save Contacts Offline',
    description: 'Save emergency contacts offline on your phone',
  },
];

export const specialties = [
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  'Orthopedic',
  'Pediatrician',
];

export const languageOptions = [
  'English',
  'Hindi',
  'Bengali',
  'Tamil',
  'Kannada',
];

export const quickStats = [
  { iconType: 'stethoscope', label: 'Verified Doctors Nearby', value: '24' },
  { iconType: 'globe', label: 'Languages Supported', value: '12' },
  { iconType: 'star', label: 'Average Rating', value: '4.7' },
  { iconType: 'map-pin', label: 'Your Location', value: 'Mumbai' },
];
