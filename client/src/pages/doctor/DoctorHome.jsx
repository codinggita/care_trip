import { useState, useEffect } from 'react';
import { Activity, Star, Calendar, CheckCircle, AlertTriangle, Clock, TrendingUp } from 'lucide-react';
import { getDoctorDashProfile } from '../../services/api';

export default function DoctorHome({ doctor, onNavigate }) {
  const statusConfig = {
    unverified: { label: 'Not Verified', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: AlertTriangle, iconColor: 'text-slate-500' },
    pending: { label: 'Pending Review', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock, iconColor: 'text-amber-500' },
    verified: { label: 'Verified', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle, iconColor: 'text-emerald-500' },
    rejected: { label: 'Rejected', color: 'bg-red-50 text-red-700 border-red-200', icon: AlertTriangle, iconColor: 'text-red-500' },
  };

  const status = statusConfig[doctor?.verificationStatus] || statusConfig.unverified;
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Verification Banner */}
      {doctor?.verificationStatus !== 'verified' && (
        <div className={`flex items-center gap-4 p-5 rounded-2xl border ${status.color} transition-all`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            doctor?.verificationStatus === 'pending' ? 'bg-amber-100' :
            doctor?.verificationStatus === 'rejected' ? 'bg-red-100' : 'bg-slate-200'
          }`}>
            <StatusIcon size={24} className={status.iconColor} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">
              {doctor?.verificationStatus === 'pending'
                ? 'Verification Under Review'
                : doctor?.verificationStatus === 'rejected'
                ? 'Verification Was Rejected'
                : 'Complete Your Verification'}
            </h3>
            <p className="text-xs mt-0.5 opacity-80">
              {doctor?.verificationStatus === 'pending'
                ? 'Your credentials are being reviewed by our admin team.'
                : doctor?.verificationStatus === 'rejected'
                ? 'Please contact support or re-submit your registration details.'
                : 'Verify your NMC registration to start receiving patient bookings.'}
            </p>
          </div>
          {doctor?.verificationStatus !== 'pending' && (
            <button
              onClick={() => onNavigate('verification')}
              className="btn-primary text-sm whitespace-nowrap"
            >
              {doctor?.verificationStatus === 'rejected' ? 'Re-verify' : 'Verify Now'}
            </button>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Verification',
            value: status.label,
            icon: CheckCircle,
            gradient: 'from-teal-500 to-emerald-600',
          },
          {
            label: 'Rating',
            value: doctor?.rating ? `${doctor.rating.toFixed(1)}★` : 'N/A',
            icon: Star,
            gradient: 'from-amber-500 to-orange-600',
          },
          {
            label: 'Reviews',
            value: doctor?.reviews || 0,
            icon: TrendingUp,
            gradient: 'from-blue-500 to-indigo-600',
          },
          {
            label: 'Consultation Fee',
            value: doctor?.fee ? `₹${doctor.fee}` : 'Not set',
            icon: Activity,
            gradient: 'from-violet-500 to-purple-600',
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="card p-5 group hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg shadow-${stat.gradient.split(' ')[0]}/20`}>
                  <Icon size={18} className="text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => onNavigate('clinic')}
            className="flex items-center gap-3 p-4 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-primary-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary-900">Manage Clinic</p>
              <p className="text-xs text-primary-600">Update your clinic details</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('verification')}
            className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900">Verification</p>
              <p className="text-xs text-amber-600">Check verification status</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate('appointments')}
            className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900">Appointments</p>
              <p className="text-xs text-blue-600">View patient bookings</p>
            </div>
          </button>
        </div>
      </div>

      {/* Profile Completeness */}
      {doctor && (
        <div className="card p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Profile Completeness</h2>
          {(() => {
            const fields = [
              { label: 'Specialty', done: !!doctor.specialty && doctor.specialty !== 'General Physician' },
              { label: 'Clinic Name', done: !!doctor.clinicName },
              { label: 'Clinic Address', done: !!doctor.clinicAddress },
              { label: 'Location', done: !!doctor.location?.coordinates?.length },
              { label: 'Consultation Fee', done: !!doctor.fee && doctor.fee !== 500 },
              { label: 'Bio', done: !!doctor.bio },
              { label: 'Qualifications', done: !!doctor.qualifications },
              { label: 'Time Slots', done: !!(doctor.timeSlots?.morning?.length || doctor.timeSlots?.afternoon?.length || doctor.timeSlots?.evening?.length) },
            ];
            const completed = fields.filter((f) => f.done).length;
            const percent = Math.round((completed / fields.length) * 100);

            return (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600">{completed}/{fields.length} completed</span>
                  <span className="text-sm font-bold text-primary-700">{percent}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-primary-700 h-full rounded-full transition-all duration-700"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                  {fields.map((f, i) => (
                    <div key={i} className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${f.done ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400'}`}>
                      {f.done ? <CheckCircle size={14} /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-current" />}
                      {f.label}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
