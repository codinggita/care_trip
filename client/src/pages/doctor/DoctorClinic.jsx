import { useState, useEffect } from 'react';
import { Building2, MapPin, Save, Clock, Languages, DollarSign, Stethoscope, GraduationCap, Plus, X } from 'lucide-react';
import { updateDoctorDashProfile } from '../../services/api';

const SPECIALTIES = ['General Physician','Cardiologist','Dermatologist','ENT Specialist','Gastroenterologist','Gynecologist','Neurologist','Oncologist','Ophthalmologist','Orthopedic','Pediatrician','Psychiatrist','Pulmonologist','Urologist','Dentist'];
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const DEFAULT_MORNING = ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM'];
const DEFAULT_AFTERNOON = ['12:00 PM','12:30 PM','01:00 PM','01:30 PM','02:00 PM','02:30 PM','03:00 PM'];
const DEFAULT_EVENING = ['04:00 PM','04:30 PM','05:00 PM','05:30 PM','06:00 PM','06:30 PM'];

export default function DoctorClinic({ doctor, onDoctorUpdate }) {
  const [form, setForm] = useState({
    clinicName: '', clinicAddress: '', clinicPhone: '', specialty: 'General Physician',
    fee: 500, bio: '', qualifications: '', experience: '', languages: ['English'],
    availableDays: ['Mon','Tue','Wed','Thu','Fri'],
    timeSlots: { morning: [...DEFAULT_MORNING], afternoon: [...DEFAULT_AFTERNOON], evening: [...DEFAULT_EVENING] },
    latitude: '', longitude: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [langInput, setLangInput] = useState('');

  useEffect(() => {
    if (doctor) {
      setForm({
        clinicName: doctor.clinicName || '',
        clinicAddress: doctor.clinicAddress || '',
        clinicPhone: doctor.clinicPhone || '',
        specialty: doctor.specialty || 'General Physician',
        fee: doctor.fee || 500,
        bio: doctor.bio || '',
        qualifications: doctor.qualifications || '',
        experience: doctor.experience || '',
        languages: doctor.languages?.length ? doctor.languages : ['English'],
        availableDays: doctor.availableDays?.length ? doctor.availableDays : ['Mon','Tue','Wed','Thu','Fri'],
        timeSlots: {
          morning: doctor.timeSlots?.morning?.length ? doctor.timeSlots.morning : [...DEFAULT_MORNING],
          afternoon: doctor.timeSlots?.afternoon?.length ? doctor.timeSlots.afternoon : [...DEFAULT_AFTERNOON],
          evening: doctor.timeSlots?.evening?.length ? doctor.timeSlots.evening : [...DEFAULT_EVENING],
        },
        latitude: doctor.location?.coordinates?.[1] || '',
        longitude: doctor.location?.coordinates?.[0] || '',
      });
    }
  }, [doctor]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setSaved(false); setErrorMsg(null);
    try {
      const payload = {
        clinicName: form.clinicName, clinicAddress: form.clinicAddress, clinicPhone: form.clinicPhone,
        specialty: form.specialty, fee: form.fee ? Number(form.fee) : 0, bio: form.bio,
        qualifications: form.qualifications, experience: form.experience ? Number(form.experience) : undefined,
        languages: form.languages, availableDays: form.availableDays, timeSlots: form.timeSlots,
      };
      if (form.latitude && form.longitude && !isNaN(parseFloat(form.latitude)) && !isNaN(parseFloat(form.longitude))) {
        payload.location = { type: 'Point', coordinates: [parseFloat(form.longitude), parseFloat(form.latitude)] };
      }
      const { data } = await updateDoctorDashProfile(payload);
      if (onDoctorUpdate) onDoctorUpdate(data.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { 
      console.error('Save error:', err);
      setErrorMsg(err.response?.data?.message || 'An error occurred while saving. Please check your inputs.');
    }
    finally { setSaving(false); }
  };

  const toggleDay = (d) => {
    setForm(f => ({ ...f, availableDays: f.availableDays.includes(d) ? f.availableDays.filter(x => x !== d) : [...f.availableDays, d] }));
  };

  const addLanguage = () => {
    if (langInput.trim() && !form.languages.includes(langInput.trim())) {
      setForm(f => ({ ...f, languages: [...f.languages, langInput.trim()] }));
      setLangInput('');
    }
  };

  const removeLanguage = (lang) => {
    setForm(f => ({ ...f, languages: f.languages.filter(l => l !== lang) }));
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">My Clinic</h2>
        <p className="text-slate-500 mt-1">Manage your clinic details and availability</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Clinic Info */}
        <div className="card p-6">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2"><Building2 size={18} className="text-primary-600" />Clinic Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-600 mb-1">Clinic Name</label><input type="text" value={form.clinicName} onChange={e => setForm({...form, clinicName: e.target.value})} className="input-field" placeholder="My Health Clinic" /></div>
            <div><label className="block text-sm font-medium text-slate-600 mb-1">Phone</label><input type="tel" value={form.clinicPhone} onChange={e => setForm({...form, clinicPhone: e.target.value})} className="input-field" placeholder="+91 98765 43210" /></div>
            <div className="sm:col-span-2"><label className="block text-sm font-medium text-slate-600 mb-1">Address</label><input type="text" value={form.clinicAddress} onChange={e => setForm({...form, clinicAddress: e.target.value})} className="input-field" placeholder="123, Health Street, City" /></div>
          </div>
        </div>

        {/* Location */}
        <div className="card p-6">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2"><MapPin size={18} className="text-primary-600" />Location Coordinates</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-600 mb-1">Latitude</label><input type="number" step="any" value={form.latitude} onChange={e => setForm({...form, latitude: e.target.value})} className="input-field" placeholder="23.0225" /></div>
            <div><label className="block text-sm font-medium text-slate-600 mb-1">Longitude</label><input type="number" step="any" value={form.longitude} onChange={e => setForm({...form, longitude: e.target.value})} className="input-field" placeholder="72.5714" /></div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Enter your clinic coordinates so travelers can find you on the map.</p>
        </div>

        {/* Professional */}
        <div className="card p-6">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2"><Stethoscope size={18} className="text-primary-600" />Professional Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-600 mb-1">Specialty</label>
              <select value={form.specialty} onChange={e => setForm({...form, specialty: e.target.value})} className="input-field">
                {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium text-slate-600 mb-1">Fee (₹)</label><input type="number" value={form.fee} onChange={e => setForm({...form, fee: e.target.value})} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-slate-600 mb-1">Qualifications</label><input type="text" value={form.qualifications} onChange={e => setForm({...form, qualifications: e.target.value})} className="input-field" placeholder="MBBS, MD" /></div>
            <div><label className="block text-sm font-medium text-slate-600 mb-1">Experience (years)</label><input type="number" value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} className="input-field" placeholder="5" /></div>
            <div className="sm:col-span-2"><label className="block text-sm font-medium text-slate-600 mb-1">Bio</label><textarea rows={3} value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} className="input-field" placeholder="Brief description about your practice..." /></div>
          </div>
        </div>

        {/* Languages */}
        <div className="card p-6">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2"><Languages size={18} className="text-primary-600" />Languages</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {form.languages.map(l => (
              <span key={l} className="badge badge-blue flex items-center gap-1">{l}<button type="button" onClick={() => removeLanguage(l)}><X size={12} /></button></span>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={langInput} onChange={e => setLangInput(e.target.value)} className="input-field flex-1" placeholder="Add language" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLanguage())} />
            <button type="button" onClick={addLanguage} className="btn-secondary px-3"><Plus size={18} /></button>
          </div>
        </div>

        {/* Available Days */}
        <div className="card p-6">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2"><Clock size={18} className="text-primary-600" />Available Days</h3>
          <div className="flex flex-wrap gap-2">
            {DAYS.map(d => (
              <button key={d} type="button" onClick={() => toggleDay(d)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${form.availableDays.includes(d) ? 'bg-primary-700 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{d}</button>
            ))}
          </div>
        </div>

        {/* Save */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center font-medium">
            {errorMsg}
          </div>
        )}
        <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base">
          {saving ? (<><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Saving...</>) : saved ? (<><Save size={18} />Saved!</>) : (<><Save size={18} />Save Changes</>)}
        </button>
      </form>
    </div>
  );
}
