import { useState, useEffect } from 'react';
import { X, CheckCircle, ChevronRight, ChevronLeft, Clock, Check, Loader2 } from 'lucide-react';
import api, { getBookedSlots } from '../services/api';

export default function BookingModal({ doctor, onClose, user, onNavigate }) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [formData, setFormData] = useState({
    name: user?.name || 'Guest',
    phone: user?.phone || 'Not set in profile',
    reason: '',
    language: 'English',
  });
  const [isBooking, setIsBooking] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Generate next 7 days
  const getNextDays = () => {
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push({
        day: dayNames[d.getDay()],
        date: d.getDate(),
        month: monthNames[d.getMonth()],
        full: `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]}`,
      });
    }
    return days;
  };

  const days = getNextDays();

  const allSlots = doctor?.timeSlots || {
    morning: ['9:00 AM', '10:00 AM', '11:00 AM'],
    afternoon: ['2:00 PM', '3:30 PM'],
    evening: ['6:00 PM', '7:00 PM'],
  };

  useEffect(() => {
    const fetchSlots = async () => {
      setLoadingSlots(true);
      setSelectedSlot(null); // Reset selection
      try {
        const dateStr = days[selectedDate].full;
        const { data } = await getBookedSlots(doctor._id || doctor.id, dateStr);
        if (data.success) {
          setBookedSlots(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch booked slots', error);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchSlots();
  }, [selectedDate, doctor]);

  const isSlotAvailable = (slot) => {
    if (bookedSlots.includes(slot)) return false;

    // Check if it's a past time slot for today
    if (selectedDate === 0) { // Today
      const [time, period] = slot.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      const now = new Date();
      const slotTime = new Date();
      slotTime.setHours(hours, minutes, 0, 0);
      
      if (slotTime < now) return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleConfirm = async () => {
    if (!selectedSlot) {
      alert('Please select a time slot');
      return;
    }

    setIsBooking(true);
    try {
      const bookingData = {
        doctorId: doctor._id || doctor.id,
        doctorName: doctor.name,
        doctorSpecialty: doctor.specialty,
        date: days[selectedDate].full,
        timeSlot: selectedSlot,
        reason: formData.reason,
        languagePreference: formData.language
      };

      await api.post('/bookings', bookingData);
      setStep(3); // Show confirmation step
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Booking failed. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 transition-colors z-10"
          aria-label="Close"
        >
          <X size={20} className="text-slate-500" />
        </button>

        {/* Progress Steps */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                    ${step >= s ? 'bg-primary-700 text-white' : 'bg-slate-100 text-slate-400'}`}
                >
                  {step > s ? <Check size={14} /> : s}
                </div>
                {s < 3 && (
                  <div className={`w-12 h-0.5 rounded-full transition-all duration-300 ${step > s ? 'bg-primary-700' : 'bg-slate-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1 — Select Slot */}
        {step === 1 && (
          <div className="px-6 pb-6 animate-fade-in">
            {/* Doctor Summary */}
            <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className={`w-12 h-12 rounded-full ${doctor?.color || 'bg-primary-700'} text-white flex items-center justify-center font-semibold`}>
                {doctor?.initials || 'DR'}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{doctor?.name || 'Doctor'}</h3>
                <p className="text-sm text-slate-500">{doctor?.specialty} • ₹{doctor?.fee}</p>
              </div>
            </div>

            {/* Date Selector */}
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Select Date</h4>
            <div className="flex gap-2 overflow-x-auto pb-3 mb-5">
              {days.map((d, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedDate(i)}
                  className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-4 py-2.5 rounded-xl border-2 text-sm
                             transition-all duration-200
                             ${selectedDate === i
                      ? 'border-primary-700 bg-primary-50 text-primary-700'
                      : 'border-slate-200 hover:border-primary-300 text-slate-600'}`}
                >
                  <span className="text-xs font-medium">{d.day}</span>
                  <span className="text-lg font-bold">{d.date}</span>
                  <span className="text-[10px]">{d.month}</span>
                </button>
              ))}
            </div>

            {/* Time Slots */}
            <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center justify-between">
              Select Time
              {loadingSlots && <Loader2 size={14} className="animate-spin text-primary-600" />}
            </h4>
            
            {!loadingSlots && Object.entries(allSlots).every(([_, slots]) => slots.filter(isSlotAvailable).length === 0) && (
              <div className="p-4 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-sm font-medium text-center mb-4">
                No available time slots for this date. Please select another date.
              </div>
            )}

            {!loadingSlots && Object.entries(allSlots).map(([period, slots]) => {
              const availableSlots = slots.filter(isSlotAvailable);
              if (availableSlots.length === 0) return null;

              return (
                <div key={period} className="mb-4">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Clock size={12} />
                    {period}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200
                          ${selectedSlot === slot
                            ? 'bg-primary-700 text-white border-primary-700 shadow-md'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-primary-400 hover:text-primary-700'
                          }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={!selectedSlot}
              className={`w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all duration-200
                ${selectedSlot && (user?.phone)
                  ? 'btn-primary'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
            >
              Next <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Step 2 — Your Details */}
        {step === 2 && (
          <div className="px-6 pb-6 animate-fade-in">
            <h3 className="text-lg font-semibold text-slate-900 mb-5">Your Details</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number (from Profile)</label>
                <input
                  type="tel"
                  value={formData.phone}
                  readOnly
                  className="input-field bg-slate-50 text-slate-500 cursor-not-allowed"
                />
                {!user?.phone && (
                  <p className="text-[10px] text-red-500 mt-1">Please update your phone number in Profile settings.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Visit</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Describe your symptoms..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Language Preference</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="input-field"
                >
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Bengali</option>
                  <option>Tamil</option>
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleBack}
                className="flex-1 flex items-center justify-center gap-1 py-3 rounded-xl font-semibold
                           border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all duration-200"
              >
                <ChevronLeft size={18} /> Back
              </button>
              <button 
                onClick={handleConfirm} 
                disabled={isBooking}
                className="flex-1 btn-primary py-3 rounded-xl flex items-center justify-center gap-2"
              >
                {isBooking ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Processing...
                  </>
                ) : 'Confirm Booking'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Confirmation */}
        {step === 3 && (
          <div className="px-6 pb-6 text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle size={44} className="text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Booking Confirmed!</h3>
            <p className="text-sm text-slate-500 mb-6">Your appointment has been successfully booked.</p>

            {/* Summary Card */}
            <div className="bg-slate-50 rounded-xl p-4 text-left border border-slate-100 mb-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Doctor</span>
                  <span className="font-medium text-slate-900">{doctor?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date</span>
                  <span className="font-medium text-slate-900">{days[selectedDate]?.full}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Time</span>
                  <span className="font-medium text-slate-900">{selectedSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fee</span>
                  <span className="font-medium text-slate-900">₹{doctor?.fee}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between">
                  <span className="text-slate-500">Ref Number</span>
                  <span className="font-mono text-xs font-semibold text-primary-700">#MTB-20260428-001</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 btn-secondary py-3 rounded-xl">
                Back to Home
              </button>
              <button 
                onClick={() => {
                  if (onNavigate) onNavigate('bookings');
                  onClose();
                }} 
                className="flex-1 btn-primary py-3 rounded-xl"
              >
                View My Bookings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
