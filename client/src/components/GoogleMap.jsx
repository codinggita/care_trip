import { useState, useEffect, useRef, useMemo } from 'react';
import { MapPin, Navigation, Star } from 'lucide-react';

const defaultCenter = {
  lat: 23.2156, // Gandhinagar
  lng: 72.6369
};

export default function CustomGoogleMap({ doctors = [], userLocation = null, onMarkerClick = null }) {
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);

  const center = useMemo(() => {
    if (userLocation) return userLocation;
    if (doctors.length > 0 && doctors[0].location?.coordinates) {
      return {
        lat: doctors[0].location.coordinates[1],
        lng: doctors[0].location.coordinates[0]
      };
    }
    return defaultCenter;
  }, [userLocation, doctors]);

  // Load Google Maps script directly (no third-party lib needed)
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    // If already loaded
    if (window.google?.maps) {
      setMapReady(true);
      return;
    }

    if (!apiKey) {
      setMapFailed(true);
      return;
    }

    // Check if script is already being loaded
    const existing = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existing) {
      existing.addEventListener('load', () => setMapReady(true));
      existing.addEventListener('error', () => setMapFailed(true));
      return;
    }

    const script = document.createElement('script');
    // Using a global callback is the safest way to ensure Map is fully instantiated
    window.initCareTripMap = () => setMapReady(true);
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initCareTripMap`;
    script.async = true;
    script.defer = true;
    script.onerror = () => setMapFailed(true);
    document.head.appendChild(script);
  }, []);

  // Initialize map once script is ready
  useEffect(() => {
    if (!mapReady || !mapRef.current || mapInstance) return;

    try {
      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 13,
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          { featureType: "poi", elementType: "all", stylers: [{ visibility: "off" }] },
          { featureType: "transit", elementType: "all", stylers: [{ visibility: "off" }] },
          { featureType: "water", elementType: "all", stylers: [{ color: "#c9e8fd" }] },
        ],
      });
      setMapInstance(map);
    } catch (e) {
      console.error('Map init failed:', e);
      setMapFailed(true);
    }
  }, [mapReady, center]);

  // Update markers when doctors or map changes
  useEffect(() => {
    if (!mapInstance) return;

    // User location marker
    if (userLocation) {
      new window.google.maps.Marker({
        position: userLocation,
        map: mapInstance,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#0058FD",
          fillOpacity: 1,
          strokeWeight: 3,
          strokeColor: "#ffffff",
        },
        title: "You",
      });
    }

    // Doctor markers
    doctors.forEach((doc) => {
      if (!doc.location?.coordinates) return;
      const pos = {
        lat: doc.location.coordinates[1],
        lng: doc.location.coordinates[0],
      };
      const marker = new window.google.maps.Marker({
        position: pos,
        map: mapInstance,
        title: doc.name,
      });
      marker.addListener('click', () => {
        setSelectedDoctor(doc);
        if (onMarkerClick) onMarkerClick(doc);
      });
    });
  }, [mapInstance, doctors, userLocation]);

  // Fallback UI when Google Maps isn't available
  if (mapFailed) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center mb-3">
          <MapPin size={28} />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">Doctors Near You</h3>
        <p className="text-xs text-slate-500 mb-4">{doctors.length} doctors found</p>
        {doctors.length > 0 && (
          <div className="w-full max-w-xs space-y-2 max-h-[280px] overflow-y-auto">
            {doctors.map((doc) => (
              <button
                key={doc._id || doc.id}
                onClick={() => onMarkerClick && onMarkerClick(doc)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 hover:border-primary-300 transition-all text-left shadow-sm"
              >
                <div className={`w-9 h-9 rounded-lg ${doc.color} text-white flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                  {doc.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{doc.name}</p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    {doc.specialty} · <Star size={10} className="text-amber-500" fill="currentColor" /> {doc.rating}
                  </p>
                </div>
                <Navigation size={14} className="text-slate-400 flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full relative rounded-3xl overflow-hidden">
      {!mapReady && (
        <div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 z-10">
          Loading Map...
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
