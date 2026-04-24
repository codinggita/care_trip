import { useState, useMemo } from 'react';
import { Search, MapPin, Star, BadgeCheck, Globe, SlidersHorizontal, X } from 'lucide-react';
import { doctors, specialties, languageOptions } from '../data/mockData';

export default function FindDoctors({ onViewProfile, onBookDoctor }) {
  const [searchText, setSearchText] = useState('');
  const [locationText, setLocationText] = useState('Mumbai, India');
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [priceRange, setPriceRange] = useState(2000);
  const [minRating, setMinRating] = useState(0);
  const [availability, setAvailability] = useState('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const toggleFilter = (list, setList, value) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const resetFilters = () => {
    setSelectedSpecialties([]);
    setSelectedLanguages([]);
    setPriceRange(2000);
    setMinRating(0);
    setAvailability('all');
  };

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchesSearch =
        !searchText ||
        doc.name.toLowerCase().includes(searchText.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(searchText.toLowerCase());
      const matchesSpecialty =
        selectedSpecialties.length === 0 || selectedSpecialties.includes(doc.specialty);
      const matchesLanguage =
        selectedLanguages.length === 0 ||
        doc.languages.some((l) => selectedLanguages.includes(l));
      const matchesPrice = doc.fee <= priceRange;
      const matchesRating = doc.rating >= minRating;
      const matchesAvail =
        availability === 'all' ||
        (availability === 'today' && doc.available === 'Available Today') ||
        (availability === 'week');
      return matchesSearch && matchesSpecialty && matchesLanguage && matchesPrice && matchesRating && matchesAvail;
    });
  }, [searchText, selectedSpecialties, selectedLanguages, priceRange, minRating, availability]);

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Specialty */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Specialty</h3>
        <div className="space-y-2">
          {specialties.map((spec) => (
            <label key={spec} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedSpecialties.includes(spec)}
                onChange={() => toggleFilter(selectedSpecialties, setSelectedSpecialties, spec)}
                className="w-4 h-4 rounded border-slate-300 text-primary-700 focus:ring-primary-500"
              />
              <span className="text-sm text-slate-600 group-hover:text-primary-700 transition-colors">
                {spec}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Language */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Language</h3>
        <div className="space-y-2">
          {languageOptions.map((lang) => (
            <label key={lang} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedLanguages.includes(lang)}
                onChange={() => toggleFilter(selectedLanguages, setSelectedLanguages, lang)}
                className="w-4 h-4 rounded border-slate-300 text-primary-700 focus:ring-primary-500"
              />
              <span className="text-sm text-slate-600 group-hover:text-primary-700 transition-colors">
                {lang}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">
          Price Range: <span className="text-primary-700">₹0 – ₹{priceRange}</span>
        </h3>
        <input
          type="range"
          min={0}
          max={2000}
          step={100}
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-700"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>₹0</span>
          <span>₹2,000</span>
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Minimum Rating</h3>
        <div className="flex flex-wrap gap-2">
          {[0, 3, 4, 4.5].map((r) => (
            <button
              key={r}
              onClick={() => setMinRating(r)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200
                ${minRating === r
                  ? 'bg-primary-700 text-white border-primary-700'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-primary-400'
                }`}
            >
              {r === 0 ? 'All' : `${r}★+`}
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Availability</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'All' },
            { value: 'today', label: 'Today' },
            { value: 'week', label: 'This Week' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setAvailability(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200
                ${availability === opt.value
                  ? 'bg-primary-700 text-white border-primary-700'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-primary-400'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button onClick={resetFilters} className="text-sm text-slate-500 hover:text-primary-700 transition-colors">
          Reset All
        </button>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* Top Search Bar */}
      <div className="card p-4 sm:p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by symptom, specialty, or doctor name..."
              className="input-field pl-10"
            />
          </div>
          <div className="relative flex-1 sm:max-w-xs">
            <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              placeholder="Location"
              className="input-field pl-10"
            />
          </div>
          <button className="btn-primary whitespace-nowrap flex items-center justify-center gap-2">
            <Search size={16} /> Search
          </button>
        </div>
      </div>

      {/* Mobile Filters Toggle */}
      <button
        onClick={() => setShowMobileFilters(true)}
        className="lg:hidden flex items-center gap-2 mb-4 px-4 py-2 rounded-lg border border-slate-200 
                   text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
      >
        <SlidersHorizontal size={16} /> Filters
        {(selectedSpecialties.length > 0 || selectedLanguages.length > 0 || minRating > 0) && (
          <span className="w-5 h-5 rounded-full bg-primary-700 text-white text-xs flex items-center justify-center">
            {selectedSpecialties.length + selectedLanguages.length + (minRating > 0 ? 1 : 0)}
          </span>
        )}
      </button>

      {/* Mobile Filters Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Filters</h2>
              <button onClick={() => setShowMobileFilters(false)} className="p-1">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <FiltersContent />
            <button
              onClick={() => setShowMobileFilters(false)}
              className="w-full btn-primary mt-4 py-3"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Main Layout: Filters + Cards */}
      <div className="flex gap-6">
        {/* Desktop Filters Panel */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="card p-5 sticky top-24">
            <h2 className="text-base font-bold text-slate-900 mb-4">Filters</h2>
            <FiltersContent />
          </div>
        </div>

        {/* Doctor Cards Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-900">{filteredDoctors.length}</span> doctors
            </p>
          </div>

          {filteredDoctors.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-4xl mb-3">🔍</p>
              <h3 className="text-lg font-semibold text-slate-700 mb-1">No doctors found</h3>
              <p className="text-sm text-slate-500">Try adjusting your filters or search terms.</p>
              <button onClick={resetFilters} className="btn-secondary mt-4">
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {filteredDoctors.map((doc) => (
                <div key={doc.id} className="card p-6 card-hover group flex flex-col justify-between min-h-[340px]">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-xl ${doc.color} text-white flex items-center justify-center font-semibold shadow-md
                                    group-hover:scale-105 transition-transform duration-300`}>
                      {doc.initials}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{doc.name}</h3>
                      <p className="text-sm text-slate-500">{doc.specialty}</p>
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {doc.languages.map((lang) => (
                      <span key={lang} className="pill text-[10px]">
                        <Globe size={10} className="text-primary-600" /> {lang}
                      </span>
                    ))}
                  </div>

                  {/* Rating + Verified */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex items-center gap-1 text-sm text-amber-600 font-medium">
                      <Star size={14} fill="currentColor" /> {doc.rating}
                      <span className="text-slate-400 text-xs font-normal">({doc.reviews} reviews)</span>
                    </span>
                    <span className="badge badge-green text-[10px]">
                      <BadgeCheck size={10} /> Verified
                    </span>
                  </div>

                  {/* Fee + Availability */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-slate-900">₹{doc.fee}</span>
                    <span className={`text-xs font-medium ${doc.available === 'Available Today' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {doc.available}
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => onViewProfile(doc)}
                      className="flex-1 px-3 py-2 text-sm font-medium border-2 border-primary-700 text-primary-700 rounded-lg
                                 hover:bg-primary-50 transition-all duration-200"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => onBookDoctor(doc)}
                      className="flex-1 px-3 py-2 text-sm font-medium bg-primary-700 text-white rounded-lg
                                 hover:bg-primary-800 transition-all duration-200 shadow-sm"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
