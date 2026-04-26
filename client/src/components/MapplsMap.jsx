import { useState, useEffect, useRef, useMemo } from 'react';
import { MapPin, Navigation, Star, Loader2 } from 'lucide-react';

const defaultCenter = {
  lat: 23.2156,
  lng: 72.6369
};

export default function MapplsMap({ doctors = [], userLocation = null, onMarkerClick = null }) {
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);
  const markersRef = useRef([]);
  const loadAttempted = useRef(false);

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

  // Load Mappls SDK with timeout fallback
  useEffect(() => {
    if (loadAttempted.current) return;
    loadAttempted.current = true;

    const accessToken = import.meta.env.VITE_MAPPLS_ACCESS_TOKEN;
    
    if (window.mappls && window.mappls.Map) {
      setMapReady(true);
      return;
    }

    if (!accessToken) {
      console.error('Mappls Access Token missing');
      setMapFailed(true);
      return;
    }

    // Remove any existing script to avoid conflicts
    const existing = document.querySelector('script[src*="apis.mappls.com"]');
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.src = `https://apis.mappls.com/advancedmaps/api/${accessToken}/map_sdk?v=3.0&layer=vector`;
    script.async = true;

    // Timeout: if SDK doesn't load in 8 seconds, show fallback
    const timeout = setTimeout(() => {
      if (!mapReady) {
        console.warn('Mappls SDK load timeout — showing fallback');
        setMapFailed(true);
      }
    }, 8000);

    script.onload = () => {
      clearTimeout(timeout);
      // Wait a tick for the SDK to initialize its globals
      setTimeout(() => {
        if (window.mappls && window.mappls.Map) {
          setMapReady(true);
        } else {
          console.error('Mappls SDK loaded but window.mappls.Map not found');
          setMapFailed(true);
        }
      }, 500);
    };

    script.onerror = () => {
      clearTimeout(timeout);
      console.error('Mappls SDK script failed to load');
      setMapFailed(true);
    };

    document.head.appendChild(script);

    return () => clearTimeout(timeout);
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapReady || !mapRef.current || mapInstance) return;

    try {
      const map = new window.mappls.Map(mapRef.current, {
        center: [center.lat, center.lng],
        zoom: 12,
        zoomControl: true,
      });
      setMapInstance(map);
    } catch (e) {
      console.error('Mappls Map init failed:', e);
      setMapFailed(true);
    }
  }, [mapReady, center, mapInstance]);

  // Update Markers
  useEffect(() => {
    if (!mapInstance || !window.mappls) return;

    markersRef.current.forEach(m => {
      try { if (m && typeof m.remove === 'function') m.remove(); } catch(e) {}
    });
    markersRef.current = [];

    if (userLocation) {
      try {
        const userMarker = new window.mappls.Marker({
          map: mapInstance,
          position: { lat: userLocation.lat, lng: userLocation.lng },
          icon_url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          width: 30,
          height: 30,
        });
        markersRef.current.push(userMarker);
      } catch (err) {
        console.error('Error adding user marker:', err);
      }
    }

    doctors.forEach((doc) => {
      if (!doc.location?.coordinates) return;
      try {
        const marker = new window.mappls.Marker({
          map: mapInstance,
          position: { lat: doc.location.coordinates[1], lng: doc.location.coordinates[0] },
          title: doc.name,
        });
        marker.addListener('click', () => {
          if (onMarkerClick) onMarkerClick(doc);
        });
        markersRef.current.push(marker);
      } catch (err) {
        console.error('Error adding doctor marker:', err);
      }
    });
  }, [mapInstance, doctors, userLocation, onMarkerClick]);

  // Fallback UI — shown immediately if map fails or takes too long
  if (mapFailed) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-primary-50 to-slate-50 rounded-2xl flex flex-col items-center justify-center p-5 text-center">
        <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center mb-3">
          <MapPin size={24} />
        </div>
        <h3 className="text-sm font-bold text-slate-800 mb-1">Doctors Near You</h3>
        <p className="text-xs text-slate-500 mb-3">{doctors.length} found nearby</p>
        {doctors.length > 0 && (
          <div className="w-full space-y-1.5 max-h-[300px] overflow-y-auto">
            {doctors.slice(0, 10).map((doc) => (
              <button
                key={doc._id || doc.id}
                onClick={() => onMarkerClick && onMarkerClick(doc)}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-lg bg-white border border-slate-100 hover:border-primary-300 transition-all text-left shadow-sm"
              >
                <div className={`w-8 h-8 rounded-lg ${doc.color || 'bg-primary-700'} text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0`}>
                  {doc.initials || 'DR'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">{doc.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {doc.specialty} {doc.distance && `· ${doc.distance}`}
                  </p>
                </div>
                <Navigation size={12} className="text-slate-400 flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden">
      {!mapReady && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center text-slate-400 z-10 gap-2">
          <Loader2 size={24} className="animate-spin text-primary-600" />
          <span className="text-xs font-medium">Loading Map...</span>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
