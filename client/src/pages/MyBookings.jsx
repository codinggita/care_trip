import { useState } from 'react';
import { MapPin, Calendar, Clock, RotateCcw, XCircle, Star, RefreshCw, CheckCircle, Ban, CalendarDays } from 'lucide-react';
import { upcomingBookings, pastBookings, cancelledBookings } from '../data/mockData';

const tabs = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past', label: 'Past' },
  { id: 'cancelled', label: 'Cancelled' },
];

export default function MyBookings() {
  const [activeTab, setActiveTab] = useState('upcoming');

  const getBookings = () => {
    switch (activeTab) {
      case 'upcoming':
        return upcomingBookings;
      case 'past':
        return pastBookings;
      case 'cancelled':
        return cancelledBookings;
      default:
        return [];
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
        {tabs.map((tab) => (
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
            {tab.id === 'upcoming' && (
              <span className="ml-1.5 w-5 h-5 inline-flex items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xs font-bold">
                {upcomingBookings.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Booking Cards */}
      <div className="space-y-4">
        {getBookings().map((booking) => (
          <div key={booking.id} className="card p-5 card-hover">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-slate-900">{booking.doctor}</h3>
                  {getStatusBadge(booking.status)}
                </div>
                <p className="text-sm text-slate-500 mb-3">{booking.specialty}</p>

                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-slate-400" />
                    {booking.date}
                  </span>
                  {booking.time && (
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} className="text-slate-400" />
                      {booking.time}
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
                    <button className="px-4 py-2 text-sm font-medium border-2 border-red-300 text-red-600 rounded-lg
                                       hover:bg-red-50 transition-all duration-200 flex items-center gap-1.5">
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
                    <button className="px-4 py-2 text-sm font-medium border-2 border-primary-700 text-primary-700 rounded-lg
                                       hover:bg-primary-50 transition-all duration-200 flex items-center gap-1.5">
                      <Star size={14} /> Leave a Review
                    </button>
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
        ))}
      </div>

      {getBookings().length === 0 && (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
            <CalendarDays size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-1">No bookings found</h3>
          <p className="text-sm text-slate-500">You don't have any {activeTab} bookings.</p>
        </div>
      )}
    </div>
  );
}
