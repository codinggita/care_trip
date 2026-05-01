import { useOutletContext } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, RotateCcw, XCircle, Star, RefreshCw, CheckCircle, Ban, CalendarDays, Loader2, X } from 'lucide-react';
import api, { submitReview } from '../services/api';

const tabs = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past', label: 'Past' },
  { id: 'cancelled', label: 'Cancelled' },
];

export default function MyBookings() {
  const { onNavigate } = useOutletContext();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewBookingId, setReviewBookingId] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/bookings');
        setBookings(data.data);
      } catch (error) {
        console.error('Fetch bookings error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const getFilteredBookings = () => {
    switch (activeTab) {
      case 'upcoming':
        return bookings.filter(b => b.status === 'Confirmed');
      case 'past':
        return bookings.filter(b => b.status === 'Completed');
      case 'cancelled':
        return bookings.filter(b => b.status === 'Cancelled');
      default:
        return [];
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      await api.patch(`/bookings/${id}/cancel`);
      // Update local state
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'Cancelled' } : b));
    } catch (error) {
      alert('Failed to cancel booking');
    }
  };

  const handleOpenReview = (bookingId) => {
    setReviewBookingId(bookingId);
    setReviewModalOpen(true);
    setReviewText('');
    setReviewRating(5);
  };

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) return alert('Please enter a review');
    setSubmittingReview(true);
    try {
      await submitReview(reviewBookingId, { rating: reviewRating, text: reviewText });
      setBookings(prev => prev.map(b => b._id === reviewBookingId || b.id === reviewBookingId ? { ...b, reviewed: true } : b));
      setReviewModalOpen(false);
    } catch (error) {
      console.error('Review error:', error);
      alert(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return (
          <span className="badge badge-green">
            <CheckCircle size={12} /> Confirmed
          </span>
        );
      case 'Completed':
        return (
          <span className="badge badge-gray">
            <CheckCircle size={12} /> Completed
          </span>
        );
      case 'Cancelled':
        return (
          <span className="badge badge-red">
            <Ban size={12} /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-xl font-bold text-slate-900 mb-6">My Bookings</h1>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-slate-100 mb-6 w-fit">
        {tabs.map((tab) => {
          const count = tab.id === 'upcoming' 
            ? bookings.filter(b => b.status === 'Confirmed').length 
            : tab.id === 'past' 
              ? bookings.filter(b => b.status === 'Completed').length 
              : bookings.filter(b => b.status === 'Cancelled').length;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTab === tab.id
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              {tab.label}
              <span className={`ml-1.5 w-5 h-5 inline-flex items-center justify-center rounded-full text-xs font-bold ${
                activeTab === tab.id ? 'bg-primary-100 text-primary-700' : 'bg-slate-200 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Booking Cards */}
      <div className="space-y-4">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="card p-5 animate-pulse bg-slate-50 h-[140px]">
              <div className="flex justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-1/3 bg-slate-200 rounded"></div>
                  <div className="h-4 w-1/4 bg-slate-200 rounded"></div>
                </div>
                <div className="h-6 w-20 bg-slate-200 rounded"></div>
              </div>
              <div className="flex gap-4 mt-4">
                <div className="h-4 w-24 bg-slate-200 rounded"></div>
                <div className="h-4 w-24 bg-slate-200 rounded"></div>
              </div>
            </div>
          ))
        ) : getFilteredBookings().length > 0 ? (
          getFilteredBookings().map((booking) => (
            <div key={booking._id || booking.id} className="card p-5 card-hover">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-slate-900">{booking.doctorName || booking.doctorId?.name || booking.doctor}</h3>
                    {getStatusBadge(booking.status)}
                  </div>
                  <p className="text-sm text-slate-500 mb-3">{booking.doctorSpecialty || booking.doctorId?.specialty || booking.specialty}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-400" />
                      {booking.date}
                    </span>
                    {(booking.timeSlot || booking.time) && (
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} className="text-slate-400" />
                        {booking.timeSlot || booking.time}
                      </span>
                    )}
                    {booking.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-slate-400" />
                        {booking.location}
                      </span>
                    )}
                  </div>
                </div>

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                {activeTab === 'upcoming' && (
                  <>
                    <button className="px-4 py-2 text-sm font-medium border-2 border-slate-300 text-slate-600 rounded-lg
                                       hover:bg-slate-50 transition-all duration-200 flex items-center gap-1.5">
                      <RotateCcw size={14} /> Reschedule
                    </button>
                    <button 
                      onClick={() => handleCancelBooking(booking._id || booking.id)}
                      className="px-4 py-2 text-sm font-medium border-2 border-red-300 text-red-600 rounded-lg
                                 hover:bg-red-50 transition-all duration-200 flex items-center gap-1.5"
                    >
                      <XCircle size={14} /> Cancel
                    </button>
                  </>
                )}
                {activeTab === 'past' && (
                  <>
                    <button className="px-4 py-2 text-sm font-medium bg-primary-700 text-white rounded-lg
                                       hover:bg-primary-800 transition-all duration-200 flex items-center gap-1.5">
                      <RefreshCw size={14} /> Book Again
                    </button>
                    {booking.reviewed ? (
                      <span className="px-4 py-2 text-sm font-medium border-2 border-slate-200 text-slate-500 rounded-lg flex items-center gap-1.5 cursor-not-allowed bg-slate-50">
                        <CheckCircle size={14} className="text-emerald-500" /> Reviewed
                      </span>
                    ) : (
                      <button onClick={() => handleOpenReview(booking._id || booking.id)} className="px-4 py-2 text-sm font-medium border-2 border-primary-700 text-primary-700 rounded-lg
                                         hover:bg-primary-50 transition-all duration-200 flex items-center gap-1.5">
                        <Star size={14} /> Leave Review
                      </button>
                    )}
                  </>
                )}
                {activeTab === 'cancelled' && (
                  <button className="px-4 py-2 text-sm font-medium bg-primary-700 text-white rounded-lg
                                     hover:bg-primary-800 transition-all duration-200 flex items-center gap-1.5">
                    <RefreshCw size={14} /> Rebook
                  </button>
                )}
              </div>
            </div>
          </div>
        )) ) : null}
      </div>

      {!loading && getFilteredBookings().length === 0 && (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
            <CalendarDays size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-1">No bookings found</h3>
          <p className="text-sm text-slate-500">You don't have any {activeTab} bookings.</p>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !submittingReview && setReviewModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-scale-in">
            <button
              onClick={() => !submittingReview && setReviewModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 transition-colors z-10"
              disabled={submittingReview}
            >
              <X size={20} className="text-slate-500" />
            </button>
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Rate your experience</h3>
              
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className={`transition-colors ${star <= reviewRating ? 'text-amber-400' : 'text-slate-200 hover:text-amber-200'}`}
                  >
                    <Star size={32} fill="currentColor" />
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Write a review</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="How was your consultation?"
                  rows={4}
                  className="input-field resize-none"
                />
              </div>

              <button
                onClick={handleSubmitReview}
                disabled={submittingReview || !reviewText.trim()}
                className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2"
              >
                {submittingReview ? (
                  <><Loader2 size={18} className="animate-spin" /> Submitting...</>
                ) : (
                  'Submit Review'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
