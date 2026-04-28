import { useState, useEffect } from 'react';
import { X, Star, CheckCircle, Clock, Globe, BadgeCheck, Phone, MapPin, Loader2 } from 'lucide-react';
import api, { getDoctorReviews } from '../services/api';

export default function DoctorProfileModal({ doctor, onClose, onBook }) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!doctor) return;
      setLoadingReviews(true);
      try {
        const { data } = await getDoctorReviews(doctor._id || doctor.id);
        if (data.success) {
          setReviews(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch doctor reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [doctor]);

  if (!doctor) return null;

  const allSlots = doctor.timeSlots || {
    morning: ['9:00 AM', '10:00 AM', '11:00 AM'],
    afternoon: ['2:00 PM', '3:30 PM'],
    evening: ['6:00 PM', '7:00 PM'],
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-end">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl overflow-y-auto animate-slide-in"
           style={{ animationDirection: 'normal' }}>
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 transition-colors z-10"
          aria-label="Close"
        >
          <X size={20} className="text-slate-500" />
        </button>

        {/* Doctor Header */}
        <div className="p-6 pb-4 bg-gradient-to-b from-primary-50 to-white">
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 rounded-2xl ${doctor.color} text-white flex items-center justify-center text-xl font-bold shadow-lg`}>
              {doctor.initials}
            </div>
            <div className="flex-1 pt-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-slate-900">{doctor.name}</h2>
              </div>
              <p className="text-sm text-slate-500 mb-2">{doctor.specialty}</p>
              <div className="flex items-center gap-2">
                <span className="badge badge-green">
                  <BadgeCheck size={12} /> Verified
                </span>
                <span className="flex items-center gap-1 text-sm text-amber-600 font-medium">
                  <Star size={14} fill="currentColor" /> {doctor.rating}
                  <span className="text-slate-400 font-normal">({doctor.reviews})</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">About</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{doctor.bio || `Specialized ${doctor.specialty} providing comprehensive healthcare services at ${doctor.name}.`}</p>
        </div>

        {/* Contact Information (MOVED TO TOP & ENHANCED) */}
        <div className="px-6 py-5 bg-slate-50/50 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4 px-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Contact Details</h3>
            <span className="text-[10px] bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-bold">Verified Data</span>
          </div>
          <div className="px-6 space-y-3">
            {doctor.phones && doctor.phones.length > 0 ? (
              doctor.phones.map((ph, i) => (
                <a 
                  key={i} 
                  href={`tel:${ph}`} 
                  className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-primary-500 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{i === 0 ? 'Primary Number' : 'Alternative Number'}</p>
                      <p className="text-base font-bold text-slate-900 tracking-tight">{ph}</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-primary-600 group-hover:bg-primary-50">
                    <Phone size={14} fill="currentColor" />
                  </div>
                </a>
              ))
            ) : (
              <div className="p-4 rounded-2xl bg-white border border-dashed border-slate-300 text-center flex flex-col items-center gap-3">
                <p className="text-sm text-slate-500 italic">For the contact number and more details, please visit the location directly.</p>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(doctor.name + ', ' + (doctor.address || ''))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-xl text-sm font-bold hover:bg-primary-100 transition-colors"
                >
                  <MapPin size={16} />
                  See Location
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Image Gallery (NEW) */}
        {doctor.images && doctor.images.length > 0 && (
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Facility Photos</h3>
            <div className="grid grid-cols-2 gap-2">
              {doctor.images.map((img, idx) => (
                <div key={idx} className={`rounded-xl overflow-hidden border border-slate-100 shadow-sm ${idx === 0 && doctor.images.length === 3 ? 'row-span-2' : 'h-24'}`}>
                  <img 
                    src={img} 
                    alt={`${doctor.name} facility ${idx + 1}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Languages Spoken</h3>
          <div className="flex flex-wrap gap-2">
            {doctor.languages.map((lang) => (
              <span key={lang} className="pill">
                <Globe size={12} className="text-primary-600" /> {lang}
              </span>
            ))}
          </div>
        </div>

        {/* Fees */}
        {(doctor.fee || doctor.estimatedTreatment) && (
          <div className="px-6 py-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-700">Consultation Fee</h3>
                <p className="text-lg font-bold text-primary-700">{doctor.fee ? `₹${doctor.fee}` : 'Contact'}</p>
              </div>
              <div className="text-right">
                <h3 className="text-sm font-semibold text-slate-700">Est. Treatment Cost</h3>
                <p className="text-sm font-medium text-slate-600">{doctor.estimatedTreatment || 'Available on request'}</p>
              </div>
            </div>
          </div>
        )}



        {/* Opening Hours (NEW) */}
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <Clock size={16} className="text-primary-600" /> Opening Hours
          </h3>
          <div className="p-3 rounded-xl bg-primary-50/50 border border-primary-100">
            {doctor.openingHours ? (
              <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-line">
                {doctor.openingHours}
              </p>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-slate-500 italic">
                  For opening hours and time slots, please visit the location for more information.
                </p>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(doctor.name + ', ' + (doctor.address || ''))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-primary-700 border border-primary-100 rounded-xl text-sm font-bold hover:bg-primary-50 transition-colors"
                >
                  <MapPin size={16} />
                  See Location
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Time Slots */}
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Available Time Slots</h3>
          {Object.entries(allSlots).map(([period, slots]) => (
            <div key={period} className="mb-3">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Clock size={12} /> {period}
              </p>
              <div className="flex flex-wrap gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200
                      ${selectedSlot === slot
                        ? 'bg-primary-700 text-white border-primary-700'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-primary-400'
                      }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Reviews */}
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center justify-between">
            Traveler Reviews
            {loadingReviews && <Loader2 size={14} className="animate-spin text-primary-600" />}
          </h3>
          <div className="space-y-3">
            {!loadingReviews && reviews.length === 0 && (
              <p className="text-sm text-slate-500 italic">No reviews yet.</p>
            )}
            {reviews.map((review, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-sm text-slate-700 mb-2 italic">"{review.text}"</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    — {review.author}, <span className="text-primary-600">{review.type}</span>
                  </span>
                  <span className="flex items-center gap-0.5 text-amber-500 text-xs font-medium">
                    <Star size={12} fill="currentColor" /> {review.rating}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Book Appointment Button */}
        <div className="sticky bottom-0 p-4 bg-white border-t border-slate-200 shadow-lg">
          <button
            onClick={() => onBook(doctor)}
            className="w-full btn-primary py-3 rounded-xl text-base"
          >
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
}
