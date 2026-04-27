import { useState, useEffect } from 'react';
import { Phone, MapPin, CheckCircle, Navigation, AlertTriangle, IdCard, Pill, Smartphone, Send, MessageCircle, Star, Clock, ExternalLink, Loader2, Search } from 'lucide-react';
import { safetyTips } from '../data/mockData';
import MapplsMap from '../components/MapplsMap';
import api from '../services/api';

// Map iconType strings to Lucide components
const tipIcons = {
  'id-card': IdCard,
  'pill': Pill,
  'smartphone': Smartphone,
};

export default function EmergencyHelp() {
  const [userLocation, setUserLocation] = useState(null);
  const [sendingSOS, setSendingSOS] = useState(false);
  const [sosStatus, setSosStatus] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);

  const [locationText, setLocationText] = useState('Detecting location...');

  const getCurrentLocation = () => {
    setLocationText('Detecting location...');
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(loc);
          setLocationText('Current Location');
        },
        (error) => {
          console.error('Geolocation error:', error);
          setUserLocation({ lat: 23.2156, lng: 72.6369 });
          setLocationText('Gandhinagar, India');
        }
      );
    } else {
      setLocationText('Geolocation not supported');
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const handleLocationSearch = async (e) => {
    if (e.key !== 'Enter' || !locationText.trim()) return;
    
    if (locationText.toLowerCase() === 'current location') {
      getCurrentLocation();
      return;
    }

    setLoadingHospitals(true);
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
    } finally {
      setLoadingHospitals(false);
    }
  };

  // Fetch real nearby hospitals from Mappls API
  useEffect(() => {
    if (!userLocation) return;

    const fetchHospitals = async () => {
      setLoadingHospitals(true);
      try {
        const { data } = await api.get('/places/nearby-hospitals', {
          params: { lat: userLocation.lat, lng: userLocation.lng, radius: 10000 }
        });
        setHospitals(data.data || []);
      } catch (error) {
        console.error('Failed to fetch hospitals:', error);
        setHospitals([]);
      } finally {
        setLoadingHospitals(false);
      }
    };

    fetchHospitals();
  }, [userLocation]);

  const handleEmailSOS = async () => {
    setSendingSOS(true);
    setSosStatus(null);
    try {
      const locationStr = userLocation ? `${userLocation.lat}, ${userLocation.lng}` : 'Unknown';
      await api.post('/emergency/email', {
        location: locationStr,
        message: 'I am in an emergency and need immediate assistance. This is my last known location.'
      });
      setSosStatus('success');
      setTimeout(() => setSosStatus(null), 5000);
    } catch (error) {
      console.error('SOS Email failed:', error);
      setSosStatus('error');
    } finally {
      setSendingSOS(false);
    }
  };

  const handleWhatsAppSOS = async () => {
    try {
      const locationStr = userLocation ? `${userLocation.lat}, ${userLocation.lng}` : 'Unknown';
      const { data } = await api.get('/emergency/whatsapp-link', { params: { location: locationStr } });
      window.open(data.data, '_blank');
    } catch (error) {
      alert('Failed to generate WhatsApp link. Please ensure your emergency contact is set in your profile.');
    }
  };

  const openGoogleMapsDirections = (hospital) => {
    const dest = `${hospital.lat},${hospital.lng}`;
    const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : '';
    const url = origin
      ? `https://www.google.com/maps/dir/${origin}/${dest}`
      : `https://www.google.com/maps/search/?api=1&query=${dest}`;
    window.open(url, '_blank');
  };

  // Convert hospitals to map markers format
  const hospitalMarkers = hospitals.map(h => ({
    _id: h.id,
    name: h.name,
    specialty: 'Hospital',
    initials: '🏥',
    color: 'bg-red-600',
    location: { coordinates: [h.lng, h.lat] }
  }));

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Hero Section with Location Search */}
      <div className="card p-6 mb-8 bg-gradient-to-r from-red-50 to-white border-red-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="text-red-600" /> Emergency Medical Help
            </h1>
            <p className="text-slate-600">Find the nearest hospitals and get immediate assistance.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:max-w-md">
            <div className="relative flex-1">
              <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                onKeyDown={handleLocationSearch}
                placeholder="Enter location or 'Current Location'"
                className="input-field pl-10 pr-10"
              />
              <button 
                onClick={getCurrentLocation}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-red-600 transition-colors"
                title="Use current location"
              >
                <Navigation size={16} />
              </button>
            </div>
            <button 
              onClick={() => handleLocationSearch({ key: 'Enter' })}
              className="btn-primary bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
            >
              <Search size={18} /> Search
            </button>
          </div>
        </div>
      </div>

      {/* SOS Alert Section */}
      <div className="grid sm:grid-cols-2 gap-4">
        <button 
          onClick={handleEmailSOS}
          disabled={sendingSOS}
          className="relative overflow-hidden group flex items-center justify-between p-6 rounded-2xl bg-white border-2 border-red-100 hover:border-red-500 transition-all duration-300 shadow-sm"
        >
          <div className="flex flex-col items-start text-left">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-3 group-hover:bg-red-600 group-hover:text-white transition-colors">
              {sendingSOS ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Send size={24} />}
            </div>
            <h3 className="font-bold text-slate-900">Email Emergency SOS</h3>
            <p className="text-xs text-slate-500 mt-1">Alerts your emergency contact via email</p>
          </div>
          <div className="text-red-500 group-hover:translate-x-1 transition-transform">
            <Navigation size={24} />
          </div>
        </button>

        <button 
          onClick={handleWhatsAppSOS}
          className="relative overflow-hidden group flex items-center justify-between p-6 rounded-2xl bg-white border-2 border-emerald-100 hover:border-emerald-500 transition-all duration-300 shadow-sm"
        >
          <div className="flex flex-col items-start text-left">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <MessageCircle size={24} />
            </div>
            <h3 className="font-bold text-slate-900">WhatsApp Emergency SOS</h3>
            <p className="text-xs text-slate-500 mt-1">Direct alert with your live location link</p>
          </div>
          <div className="text-emerald-500 group-hover:translate-x-1 transition-transform">
            <Navigation size={24} />
          </div>
        </button>
      </div>

      {sosStatus === 'success' && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700 animate-slide-up">
          <CheckCircle size={18} />
          <p className="text-sm font-medium">SOS Alert Sent Successfully to your emergency contact.</p>
        </div>
      )}

      {/* Emergency Helpline Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 to-red-700 p-6 sm:p-8 text-white shadow-xl shadow-red-200/50">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/4 translate-x-1/4" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={28} className="text-red-200" />
              <h1 className="text-2xl font-bold uppercase tracking-tight">Immediate Medical Help?</h1>
            </div>
            <p className="text-red-100 text-sm opacity-90 max-w-md">
              Speak with a medical professional immediately. Multilingual support available 24/7 for international travelers.
            </p>
          </div>
          <a
            href="tel:1800-MED-HELP"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-red-600 rounded-2xl font-bold text-xl
                       hover:scale-105 active:scale-95 transition-all duration-200 shadow-xl shadow-black/10"
          >
            <Phone size={24} /> 1800-MED-HELP
          </a>
        </div>
      </div>

      {/* Live Map + Hospital List */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MapPin size={20} className="text-primary-700" /> Nearest Hospitals & Clinics
            {loadingHospitals && <Loader2 size={16} className="animate-spin text-slate-400" />}
          </h2>
          <div className="card h-[450px] overflow-hidden border-2 border-white shadow-xl">
            <MapplsMap 
              doctors={hospitalMarkers}
              userLocation={userLocation}
              onMarkerClick={(h) => {
                const hospital = hospitals.find(hosp => hosp.id === h._id);
                if (hospital) openGoogleMapsDirections(hospital);
              }}
            />
          </div>
        </div>

        {/* Hospital List Side Panel — Real Data */}
        <div className="space-y-3 h-[520px] overflow-y-auto pr-1">
          <h2 className="text-lg font-bold text-slate-900 sticky top-0 bg-slate-50 py-2 z-10">
            {loadingHospitals ? 'Finding hospitals...' : `${hospitals.length} Hospitals Found`}
          </h2>

          {loadingHospitals ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="card p-4 animate-pulse bg-slate-50">
                  <div className="h-4 w-3/4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 w-full bg-slate-200 rounded mb-3"></div>
                  <div className="h-8 w-full bg-slate-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : hospitals.length === 0 ? (
            <div className="card p-8 text-center">
              <MapPin size={32} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm text-slate-500">No hospitals found nearby. Try refreshing or allowing location access.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {hospitals.map((hospital) => (
                <div key={hospital.id} className="card p-4 card-hover bg-white border border-slate-100 group">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-slate-900 text-sm leading-tight pr-2">
                      {hospital.name}
                    </h3>
                    {hospital.rating && (
                      <span className="flex-shrink-0 flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                        <Star size={10} fill="currentColor" /> {hospital.rating}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-slate-500 mb-2 line-clamp-2">{hospital.address}</p>

                  <div className="flex items-center gap-3 mb-3">
                    {hospital.openNow !== null && (
                      <span className={`flex items-center gap-1 text-[11px] font-bold ${hospital.openNow ? 'text-emerald-600' : 'text-red-500'}`}>
                        <Clock size={12} />
                        {hospital.openNow ? 'Open Now' : 'Closed'}
                      </span>
                    )}
                    {hospital.totalRatings > 0 && (
                      <span className="text-[11px] text-slate-400">
                        {hospital.totalRatings.toLocaleString()} reviews
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => openGoogleMapsDirections(hospital)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold
                               border-2 border-primary-100 text-primary-700 
                               hover:bg-primary-50 group-hover:border-primary-300 transition-all duration-200"
                  >
                    <Navigation size={14} /> Get Directions
                    <ExternalLink size={12} className="ml-auto opacity-50" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Safety Tips */}
      <div className="pt-4">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Travel Safety Protocols</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {safetyTips.map((tip, i) => {
            const TipIcon = tipIcons[tip.iconType] || IdCard;
            return (
              <div key={i} className="card p-6 card-hover group border-b-4 border-b-primary-50 hover:border-b-primary-700 transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center mb-4 group-hover:rotate-6 transition-all">
                  <TipIcon size={24} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{tip.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{tip.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
