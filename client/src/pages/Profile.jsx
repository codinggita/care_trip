import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Edit, LogOut, Bell, Mail, MapPin, Globe, User, Plane, Heart, Settings, Save, X, Check, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { updateUser, logout } from '../store';

// Default empty profile — no dummy data
const emptyProfile = {
  phone: '',
  dob: '',
  nationality: '',
  preferredLanguage: '',
  gender: '',
  currentCity: '',
  homeCountry: '',
  travelPurpose: '',
  tripStart: '',
  tripEnd: '',
  allergies: '',
  chronicConditions: '',
  bloodGroup: '',
  emergencyWhatsApp: '',
  emergencyEmail: '',
};

const PROFILE_STORAGE_KEY = 'caretrip_profile';

function loadSavedProfile() {
  try {
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (_) { /* ignore */ }
  return null;
}

function saveProfile(data) {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(data));
}

// Reusable toggle
const Toggle = ({ enabled, onToggle }) => (
  <button
    onClick={onToggle}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
               transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
               ${enabled ? 'bg-primary-700' : 'bg-slate-300'}`}
  >
    <span
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                  transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
    />
  </button>
);

export default function Profile() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Load saved profile or start empty
  const [profile, setProfile] = useState(() => {
    // If user has profile data, use it, otherwise check localStorage
    if (user?.phone || user?.dob) return user;
    const saved = loadSavedProfile();
    return saved || { ...emptyProfile };
  });

  const [editing, setEditing] = useState(null); // which card is being edited: 'personal' | 'travel' | 'medical' | null
  const [draft, setDraft] = useState({});
  const [saveMessage, setSaveMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [appSettings, setAppSettings] = useState(() => {
    try {
      const s = localStorage.getItem('caretrip_settings');
      return s ? JSON.parse(s) : { pushNotifications: true, emailAlerts: true, locationAccess: true, language: 'English' };
    } catch (_) {
      return { pushNotifications: true, emailAlerts: true, locationAccess: true, language: 'English' };
    }
  });

  // Persist settings
  useEffect(() => {
    localStorage.setItem('caretrip_settings', JSON.stringify(appSettings));
  }, [appSettings]);

  const toggleSetting = (key) => {
    setAppSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // User info from login
  const displayName = user?.name || 'Guest User';
  const displayEmail = user?.email || '';
  const displayInitials = user?.initials || 'GU';

  // Check if profile is mostly empty (first-time user)
  const isProfileIncomplete = !profile.dob && !profile.gender && !profile.nationality;

  // ---- Edit helpers ----
  const startEdit = (section) => {
    let fields = {};
    if (section === 'personal') {
      fields = { phone: profile.phone, dob: profile.dob, nationality: profile.nationality, preferredLanguage: profile.preferredLanguage, gender: profile.gender };
    } else if (section === 'travel') {
      fields = { currentCity: profile.currentCity, homeCountry: profile.homeCountry, travelPurpose: profile.travelPurpose, tripStart: profile.tripStart, tripEnd: profile.tripEnd };
    } else if (section === 'medical') {
      fields = {
        allergies: profile.allergies,
        chronicConditions: profile.chronicConditions,
        bloodGroup: profile.bloodGroup,
        emergencyWhatsApp: profile.emergencyWhatsApp,
        emergencyEmail: profile.emergencyEmail
      };
    }
    setDraft(fields);
    setEditing(section);
  };

  const cancelEdit = () => {
    setEditing(null);
    setDraft({});
  };

  const saveEdit = async () => {
    setIsSaving(true);
    try {
      const updated = { ...profile, ...draft };
      const { data } = await api.put('/profile', updated);
      
      setProfile(data.data);
      dispatch(updateUser(data.data));
      
      setEditing(null);
      setDraft({});
      setSaveMessage('Profile updated successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDraftChange = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  // Display value or placeholder
  const displayVal = (val, placeholder = 'Not set') =>
    val ? val : <span className="text-slate-400 italic text-xs">{placeholder}</span>;

  // ---- Render helpers ----
  const renderViewRow = (label, value) => (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900 text-right max-w-[55%]">
        {displayVal(value)}
      </span>
    </div>
  );

  const renderInput = (label, key, type = 'text', options = null) => (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-slate-600">{label}</label>
      {options ? (
        <select
          value={draft[key] || ''}
          onChange={(e) => handleDraftChange(key, e.target.value)}
          className="input-field text-sm py-2"
        >
          <option value="">Select {label.toLowerCase()}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : type === 'date' ? (
        <input
          type="date"
          value={draft[key] || ''}
          onChange={(e) => handleDraftChange(key, e.target.value)}
          className="input-field text-sm py-2"
        />
      ) : (
        <input
          type={type}
          value={draft[key] || ''}
          onChange={(e) => handleDraftChange(key, e.target.value)}
          placeholder={`Enter ${label.toLowerCase()}`}
          className="input-field text-sm py-2"
        />
      )}
    </div>
  );

  const renderCardHeader = (icon, title, section) => (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
        {icon} {title}
      </h2>
      {editing !== section ? (
        <button
          onClick={() => startEdit(section)}
          className="text-sm font-semibold text-primary-700 hover:bg-primary-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
        >
          <Edit size={14} /> Edit
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={cancelEdit}
            className="text-sm font-semibold text-slate-500 hover:bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
          >
            <X size={14} /> Cancel
          </button>
          <button
            onClick={saveEdit}
            className="text-sm font-semibold text-white bg-primary-700 hover:bg-primary-800 px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Save size={14} /> Save
          </button>
        </div>
      )}
    </div>
  );

  // Format trip duration display
  const tripDuration = profile.tripStart && profile.tripEnd
    ? `${profile.tripStart} — ${profile.tripEnd}`
    : profile.tripStart || profile.tripEnd || '';

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Success Message */}
      {saveMessage && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium animate-slide-up">
          <Check size={16} /> {saveMessage}
        </div>
      )}

      {/* Incomplete Profile Banner */}
      {isProfileIncomplete && (
        <div className="flex items-start gap-3 px-5 py-4 rounded-xl bg-amber-50 border border-amber-200">
          <AlertCircle size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Complete your profile</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Add your personal, travel, and medical details so doctors can serve you better.
            </p>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-primary-700 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-primary-700/25">
            {displayInitials}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-xl font-bold text-slate-900">{displayName}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{displayEmail || <span className="italic text-slate-400">No email set</span>}</p>
            <p className="text-sm text-slate-500">{profile.phone || <span className="italic text-slate-400">No phone set</span>}</p>
          </div>
          <button
            onClick={() => startEdit('personal')}
            className="btn-secondary px-5 py-2.5 flex items-center gap-2.5 text-sm font-bold shadow-sm"
          >
            <Edit size={18} /> Edit Profile
          </button>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid sm:grid-cols-2 gap-4">

        {/* ====== Personal Info ====== */}
        <div className="card p-5">
          {renderCardHeader(<User size={18} className="text-primary-700" />, 'Personal Information', 'personal')}

          {editing === 'personal' ? (
            <div className="space-y-3">
              {renderInput('Phone Number', 'phone', 'tel')}
              {renderInput('Date of Birth', 'dob', 'date')}
              {renderInput('Nationality', 'nationality', 'text')}
              {renderInput('Preferred Language', 'preferredLanguage', 'text', ['English', 'Hindi', 'Bengali', 'Tamil', 'Kannada', 'Other'])}
              {renderInput('Gender', 'gender', 'text', ['Male', 'Female', 'Non-binary', 'Prefer not to say'])}
            </div>
          ) : (
            <div className="space-y-2">
              {renderViewRow('Full Name', displayName)}
              {renderViewRow('Phone', profile.phone)}
              {renderViewRow('Date of Birth', profile.dob)}
              {renderViewRow('Nationality', profile.nationality)}
              {renderViewRow('Preferred Language', profile.preferredLanguage)}
              {renderViewRow('Gender', profile.gender)}
            </div>
          )}
        </div>

        {/* ====== Travel Info ====== */}
        <div className="card p-5">
          {renderCardHeader(<Plane size={18} className="text-primary-700" />, 'Travel Information', 'travel')}

          {editing === 'travel' ? (
            <div className="space-y-3">
              {renderInput('Current City', 'currentCity')}
              {renderInput('Home Country', 'homeCountry')}
              {renderInput('Travel Purpose', 'travelPurpose', 'text', ['Tourism', 'Business', 'Medical', 'Education', 'Other'])}
              {renderInput('Trip Start Date', 'tripStart', 'date')}
              {renderInput('Trip End Date', 'tripEnd', 'date')}
            </div>
          ) : (
            <div className="space-y-2">
              {renderViewRow('Current City', profile.currentCity)}
              {renderViewRow('Home Country', profile.homeCountry)}
              {renderViewRow('Travel Purpose', profile.travelPurpose)}
              {renderViewRow('Trip Duration', tripDuration)}
            </div>
          )}
        </div>

        {/* ====== Medical Preferences ====== */}
        <div className="card p-5">
          {renderCardHeader(<Heart size={18} className="text-primary-700" />, 'Medical Preferences', 'medical')}

          {editing === 'medical' ? (
            <div className="space-y-3">
              {renderInput('Known Allergies', 'allergies')}
              {renderInput('Chronic Conditions', 'chronicConditions')}
              {renderInput('Blood Group', 'bloodGroup', 'text', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])}
              {renderInput('Emergency WhatsApp', 'emergencyWhatsApp', 'tel')}
              {renderInput('Emergency Email ID', 'emergencyEmail', 'email')}
            </div>
          ) : (
            <div className="space-y-2">
              {renderViewRow('Known Allergies', profile.allergies)}
              {renderViewRow('Chronic Conditions', profile.chronicConditions)}
              {renderViewRow('Blood Group', profile.bloodGroup)}
              {renderViewRow('Emergency WhatsApp', profile.emergencyWhatsApp)}
              {renderViewRow('Emergency Email ID', profile.emergencyEmail)}
            </div>
          )}
        </div>

        {/* ====== Settings ====== */}
        <div className="card p-5">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Settings size={18} className="text-primary-700" /> Settings
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-slate-400" />
                <span className="text-sm text-slate-700">Push Notifications</span>
              </div>
              <Toggle enabled={appSettings.pushNotifications} onToggle={() => toggleSetting('pushNotifications')} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-slate-400" />
                <span className="text-sm text-slate-700">Email Alerts</span>
              </div>
              <Toggle enabled={appSettings.emailAlerts} onToggle={() => toggleSetting('emailAlerts')} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-slate-400" />
                <span className="text-sm text-slate-700">Location Access</span>
              </div>
              <Toggle enabled={appSettings.locationAccess} onToggle={() => toggleSetting('locationAccess')} />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-slate-400" />
                <span className="text-sm text-slate-700">Language</span>
              </div>
              <select
                value={appSettings.language}
                onChange={(e) => setAppSettings((prev) => ({ ...prev, language: e.target.value }))}
                className="text-sm font-medium text-slate-700 bg-transparent border border-slate-200 rounded-lg px-3 py-1
                           focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option>English</option>
                <option>Hindi</option>
                <option>Bengali</option>
                <option>Tamil</option>
              </select>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full mt-8 flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl text-sm font-bold
                       border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200 shadow-sm"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}
