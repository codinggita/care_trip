import { useOutletContext } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Star, BadgeCheck, Navigation, X, Loader2, Phone, Award } from 'lucide-react';
import { specialties } from '../data/mockData';
import MapplsMap from '../components/MapplsMap';
import api, { reverseGeocode, searchDoctors } from '../services/api';
import Avatar from '../components/Avatar';
import SEO from '../components/SEO';

export default function FindDoctors() {
  const { onViewProfile, onBookDoctor } = useOutletContext();
  const [searchText, setSearchText] = useState('');
  const [locationText, setLocationText] = useState('Detecting location...');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Function to get user's current location
  // Reverse geocode to get real city name from coordinates
  const fetchCityName = async (lat, lng) => {
    try {
      const { data } = await reverseGeocode(lat, lng);
      if (data.success && data.data.formattedAddress) {
        setLocationText(data.data.formattedAddress);
      } else {
        setLocationText('Current Location');
      }
    } catch (error) {
      console.error('Reverse geocode error:', error);
      setLocationText('Current Location');
    }
  };

  const getCurrentLocation = () => {
    setLocationText('Detecting location...');
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(newLoc);
          // Get real city name instead of just "Current Location"
          fetchCityName(newLoc.lat, newLoc.lng);
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Don't hardcode Gandhinagar — ask user to enter their location
          setLocationText('Enter your location');
          setUserLocation(null);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setLocationText('Geolocation not supported');
    }
  };

  // Initial location detection
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Handle manual location search
  const handleLocationSearch = async (e) => {
    if (e.key !== 'Enter' || !locationText.trim()) return;
    
    // If user types "Current Location", just re-trigger geolocation
    if (locationText.toLowerCase() === 'current location') {
      getCurrentLocation();
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.get('/places/geocode', {
        params: { address: locationText }
      });
      
      if (data.success) {
        setUserLocation({ lat: data.data.lat, lng: data.data.lng });
        setLocationText(data.data.formattedAddress);
      }
    } catch (error) {
      console.error('Manual geocoding error:', error);
      // Fallback or show error
    } finally {
      setLoading(false);
    }
  };

  // Fetch live doctors from Mappls when location or specialty changes
  useEffect(() => {
    if (!userLocation) return;

    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const keyword = selectedSpecialty ? selectedSpecialty.toLowerCase() : '';
        const { data } = await api.get('/places/nearby-doctors', {
          params: {
            lat: userLocation.lat,
            lng: userLocation.lng,
            radius: 10000,
            ...(keyword && { keyword })
          }
        });
        setDoctors(data.data || []);
      } catch (error) {
        console.error('Fetch doctors error:', error);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [userLocation, selectedSpecialty]);

  // Server-side search by hospital name, area, etc.
  const handleDoctorSearch = useCallback(async () => {
    if (!searchText.trim()) {
      // If search is cleared, go back to nearby results
      if (isSearchMode) {
        setIsSearchMode(false);
        // Re-trigger nearby fetch
        setUserLocation(prev => prev ? { ...prev } : prev);
      }
      return;
    }

    setSearchLoading(true);
    setIsSearchMode(true);
    try {
      const { data } = await searchDoctors(
        searchText,
        userLocation?.lat,
        userLocation?.lng
      );
      setDoctors(data.data || []);
    } catch (error) {
      console.error('Search doctors error:', error);
    } finally {
      setSearchLoading(false);
    }
  }, [searchText, userLocation, isSearchMode]);

  // Client-side filtering (applied on top of whatever results are loaded)
  const filteredDoctors = doctors.filter((doc) => {
    // Registered CareTrip doctors are always shown
    if (doc.isRegisteredDoctor) return true;

    // Only show places that are clinics/hospitals (not tyre shops, retail, etc.)
    const name = (doc.name || '').toLowerCase();
    const specialty = (doc.specialty || '').toLowerCase();
    const type = (doc.type || '').toLowerCase();

    const isMedicalPlace =
      type.includes('hospital') ||
      type.includes('clinic') ||
      type.includes('doctor') ||
      type.includes('medical') ||
      type.includes('health') ||
      type.includes('pharmacy') ||
      type.includes('diagnostic') ||
      type.includes('pathology') ||
      specialty.includes('hospital') ||
      specialty.includes('clinic') ||
      name.includes('hospital') ||
      name.includes('clinic') ||
      name.includes('doctor') ||
      name.includes('medical') ||
      name.includes('health') ||
      name.includes('clinic') ||
      name.includes('diagnostic') ||
      name.includes('pathology') ||
      name.includes('pharma');

    if (!isMedicalPlace) return false;

    // If in search mode, don't filter by text again (server already did)
    if (!isSearchMode && searchText &&
        !doc.name.toLowerCase().includes(searchText.toLowerCase()) &&
        !doc.specialty.toLowerCase().includes(searchText.toLowerCase()) &&
        !(doc.address || '').toLowerCase().includes(searchText.toLowerCase())) {
      return false;
    }
    if (minRating > 0 && (doc.rating || 0) < minRating) {
      return false;
    }
    return true;
  });

  return (
    <div className="animate-fade-in" role="main" aria-labelledby="find-doctors-title">
      <SEO 
        title="Find Doctors" 
        description="Search for world-class verified doctors, clinics, and hospitals. Filter by specialty, rating, and location."
        ogType="profile"
      />
      {/* Hidden H1 for accessibility */}
      <h1 id="find-doctors-title" className="sr-only">Find Doctors and Hospitals</h1>

      {/* Search Bar */}
      <div className="card p-4 mb-5" role="search">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                // If cleared, exit search mode
                if (!e.target.value.trim() && isSearchMode) {
                  setIsSearchMode(false);
                  setUserLocation(prev => prev ? { ...prev } : prev);
                }
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleDoctorSearch(); }}
              placeholder="Search hospital, clinic, area name..."
              className="input-field pl-9 text-sm"
            />
          </div>
          <div className="relative sm:max-w-[250px] flex-1">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              onKeyDown={handleLocationSearch}
              placeholder="Enter location or 'Current Location'"
              className="input-field pl-9 pr-10 text-sm"
              title="Type a location and press Enter"
            />
            <button 
              onClick={getCurrentLocation}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-primary-600 transition-colors"
              title="Use current location"
            >
              <Navigation size={14} />
            </button>
          </div>
          <button 
            onClick={() => {
              if (searchText.trim()) {
                handleDoctorSearch();
              } else {
                handleLocationSearch({ key: 'Enter' });
              }
            }}
            disabled={searchLoading}
            className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
          >
            {searchLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} Search
          </button>
        </div>
      </div>

      {/* Horizontal Filter Bar */}
      <div className="card p-4 mb-5">
        <div className="flex flex-wrap items-center gap-3">
          {/* Specialty Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Specialty:</span>
            <button
              onClick={() => setSelectedSpecialty('')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200
                ${!selectedSpecialty
                  ? 'bg-primary-700 text-white border-primary-700 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-primary-400'
                }`}
            >
              All
            </button>
            {specialties.map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(selectedSpecialty === spec ? '' : spec)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200
                  ${selectedSpecialty === spec
                    ? 'bg-primary-700 text-white border-primary-700 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-primary-400'
                  }`}
              >
                {spec}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-slate-200" />

          {/* Rating Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rating:</span>
            {[0, 3, 4, 4.5].map((r) => (
              <button
                key={r}
                onClick={() => setMinRating(r)}
                className={`px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200
                  ${minRating === r
                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-amber-400'
                  }`}
              >
                {r === 0 ? 'All' : `${r}★+`}
              </button>
            ))}
          </div>

          {/* Active filter count + reset */}
          {(selectedSpecialty || minRating > 0 || searchText) && (
            <>
              <div className="hidden sm:block w-px h-6 bg-slate-200" />
              <button
                onClick={() => { setSelectedSpecialty(''); setMinRating(0); setSearchText(''); }}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
              >
                <X size={12} /> Clear All
              </button>
            </>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-4" aria-live="polite">
        <p className="text-sm text-slate-500">
          Showing <span className="font-bold text-slate-900">{filteredDoctors.length}</span> results {isSearchMode ? `for "${searchText}"` : 'nearby'}
        </p>
        {(loading || searchLoading) && <Loader2 size={16} className="animate-spin text-primary-600" />}
      </div>

      {/* Main Grid: Cards + Map */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Doctor Cards - takes 2 columns */}
        <div className="xl:col-span-2">
          {loading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="card p-5 animate-pulse bg-slate-50 h-[240px]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-200"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
                      <div className="h-3 w-1/2 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                  <div className="h-12 w-full bg-slate-200 rounded mt-3"></div>
                  <div className="h-9 w-full bg-slate-200 rounded mt-auto"></div>
                </div>
              ))}
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-4xl mb-3">🔍</p>
              <h3 className="text-lg font-semibold text-slate-700 mb-1">No doctors found</h3>
              <p className="text-sm text-slate-500">Try adjusting your filters or search terms.</p>
              <button
                onClick={() => { setSelectedSpecialty(''); setMinRating(0); setSearchText(''); }}
                className="btn-secondary mt-4"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredDoctors.map((doc) => (
                <div key={doc._id || doc.id} className="card p-5 card-hover group flex flex-col justify-between">
                  {/* Header with Logo */}
                  <div className="flex items-start gap-3 mb-2">
                    <Avatar doc={doc} className="w-11 h-11 text-sm group-hover:scale-105 transition-transform duration-300" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold text-slate-900 text-sm truncate">{doc.name}</h3>
                        {doc.isRegisteredDoctor && (
                          <span className="flex-shrink-0 p-0.5 rounded bg-emerald-100" title="Registered on CareTrip">
                            <Award size={12} className="text-emerald-700" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{doc.specialty}</p>
                    </div>
                    {doc.distance && (
                      <span className="text-[10px] font-bold text-primary-700 bg-primary-50 px-2 py-1 rounded-md flex-shrink-0">
                        {doc.distance}
                      </span>
                    )}
                  </div>

                  {/* Address */}
                  {doc.address && (
                    <p className="text-[11px] text-slate-500 mb-2 line-clamp-1 flex items-center gap-1">
                      <MapPin size={10} className="text-slate-400 flex-shrink-0" />
                      {doc.address}
                    </p>
                  )}

                  {/* Phone number */}
                  {doc.phone && (
                    <a
                      href={`tel:${doc.phone}`}
                      className="text-[11px] text-primary-700 font-medium mb-2 flex items-center gap-1 hover:text-primary-900 transition-colors w-fit"
                    >
                      <Phone size={10} className="flex-shrink-0" />
                      {doc.phone}
                    </a>
                  )}

                  {/* Rating row */}
                  <div className="flex items-center flex-wrap gap-2 mb-3">
                    <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                      <Star size={12} fill="currentColor" /> {doc.rating}
                      <span className="text-slate-400 font-normal">({doc.reviews})</span>
                    </span>
                    {doc.verified && (
                      <span className="badge badge-green text-[9px] px-1.5 py-0.5">
                        <BadgeCheck size={9} /> Verified
                      </span>
                    )}
                    {doc.openNow !== null && doc.openNow !== undefined && (
                      <span className={`text-[10px] font-bold ${doc.openNow ? 'text-emerald-600' : 'text-red-500'}`}>
                        {doc.openNow ? '● Open' : '● Closed'}
                      </span>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 pt-2 border-t border-slate-100 mt-auto">
                    <button
                      onClick={() => onViewProfile(doc)}
                      className="flex-1 px-2 py-2 text-xs font-medium border-2 border-primary-700 text-primary-700 rounded-lg
                                 hover:bg-primary-50 transition-all duration-200"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => onBookDoctor(doc)}
                      className="flex-1 px-2 py-2 text-xs font-medium bg-primary-700 text-white rounded-lg
                                 hover:bg-primary-800 transition-all duration-200 shadow-sm"
                    >
                      Book Now
                    </button>
                    {doc.phone && (
                      <a
                        href={`tel:${doc.phone}`}
                        className="px-2 py-2 text-xs font-medium border-2 border-emerald-200 text-emerald-600 rounded-lg
                                   hover:bg-emerald-50 transition-all duration-200 flex items-center"
                        title="Call Now"
                      >
                        <Phone size={14} />
                      </a>
                    )}
                    <button
                      onClick={() => {
                        const destination = encodeURIComponent(doc.name + ', ' + (doc.address || ''));
                        const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : '';
                        const url = origin
                          ? `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`
                          : `https://www.google.com/maps/search/?api=1&query=${destination}`;
                        window.open(url, '_blank');
                      }}
                      className="px-2 py-2 text-xs font-medium border-2 border-slate-200 text-slate-600 rounded-lg
                                 hover:bg-slate-50 transition-all duration-200"
                      title="Get Directions"
                    >
                      <Navigation size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map Panel - takes 1 column */}
        <div className="hidden xl:block">
          <div className="sticky top-24 h-[calc(100vh-140px)] rounded-2xl overflow-hidden border-2 border-white shadow-xl">
            <MapplsMap 
              doctors={filteredDoctors}
              userLocation={userLocation}
              onMarkerClick={(doc) => onViewProfile(doc)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
