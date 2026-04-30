import { useState } from 'react';
import { ShieldCheck, Search, CheckCircle, XCircle, Clock, ChevronRight } from 'lucide-react';
import { verifyDoctorRegistration, requestDoctorApproval } from '../../services/api';

const STATE_COUNCILS = [
  'Andhra Pradesh Medical Council','Assam Medical Council','Bihar Medical Council',
  'Delhi Medical Council','Goa Medical Council','Gujarat Medical Council',
  'Haryana Medical Council','Himachal Pradesh Medical Council','Karnataka Medical Council',
  'Kerala Medical Council','Madhya Pradesh Medical Council','Maharashtra Medical Council',
  'Odisha Medical Council','Punjab Medical Council','Rajasthan Medical Council',
  'Tamil Nadu Medical Council','Telangana Medical Council','Uttar Pradesh Medical Council',
  'Uttarakhand Medical Council','West Bengal Medical Council','Medical Council of India (MCI/NMC)','Other'
];

export default function DoctorVerification({ doctor, onDoctorUpdate }) {
  const [regNumber, setRegNumber] = useState(doctor?.registrationNumber || '');
  const [stateCouncil, setStateCouncil] = useState(doctor?.stateMedicalCouncil || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const currentStatus = doctor?.verificationStatus || 'unverified';



  const handleRequestApproval = async (e) => {
    e.preventDefault();
    if (!regNumber.trim()) return;
    setIsVerifying(true); setError(null); setResult(null);
    try {
      const { data } = await requestDoctorApproval({ registrationNumber: regNumber.trim(), stateMedicalCouncil: stateCouncil });
      setResult(data);
      if (onDoctorUpdate) onDoctorUpdate(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed.');
    } finally { setIsVerifying(false); }
  };

  if (currentStatus === 'verified' && !result) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="card p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={40} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">You're Verified!</h2>
          <p className="text-slate-500">Reg No: <span className="font-semibold text-slate-700">{doctor.registrationNumber}</span></p>
          {doctor.stateMedicalCouncil && <p className="text-slate-500">Council: <span className="font-semibold text-slate-700">{doctor.stateMedicalCouncil}</span></p>}
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-200">
            <ShieldCheck size={16} /> Verified by CareTrip
          </div>
        </div>
      </div>
    );
  }

  if (currentStatus === 'pending' && !result) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="card p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <Clock size={40} className="text-amber-600 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Pending Admin Review</h2>
          <p className="text-slate-500">Reg No: <span className="font-semibold text-slate-700">{doctor.registrationNumber}</span></p>
          <p className="text-sm text-slate-400 mt-4">Our admin team is reviewing your credentials.</p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-700 text-sm font-semibold border border-amber-200">
            <Clock size={16} /> Under Review
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-700/25">
          <ShieldCheck size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Verify Your Credentials</h2>
        <p className="text-slate-500 mt-2">Enter your NMC / State Medical Council registration number.</p>
      </div>
      <div className="card p-6 sm:p-8">
        <form onSubmit={handleRequestApproval} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Registration Number <span className="text-red-500">*</span></label>
            <input type="text" required value={regNumber} onChange={(e) => setRegNumber(e.target.value)} className="input-field" placeholder="e.g. 12345" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">State Medical Council</label>
            <select value={stateCouncil} onChange={(e) => setStateCouncil(e.target.value)} className="input-field">
              <option value="">Select Council (optional)</option>
              {STATE_COUNCILS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {error && <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm"><XCircle size={18} />{error}</div>}
          {result && (
            <div className={`flex items-center gap-3 p-4 rounded-xl text-sm border ${result.verified ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
              {result.verified ? <CheckCircle size={18} /> : <Clock size={18} />}{result.message}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <button type="submit" disabled={isVerifying || !regNumber.trim()} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
              {isVerifying ? (<><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Requesting...</>) : (<><ShieldCheck size={18} />Request Manual Approval</>)}
            </button>
          </div>
        </form>
        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <h4 className="text-sm font-semibold text-slate-700 mb-2">How verification works</h4>
          <div className="space-y-2">
            {['Submit your registration details','Your profile is sent for admin review','Admin verifies your credentials','Once approved, your profile becomes visible to travelers'].map((s,i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-500"><ChevronRight size={14} className="text-primary-500 mt-0.5 shrink-0" />{s}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
