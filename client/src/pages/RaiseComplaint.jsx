import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useLanguage } from '../context/LanguageContext';
import VoiceRecorder from '../components/VoiceRecorder';
import MapPicker from '../components/MapPicker';
import AIProcessingModal from './AIProcessingModal';
import { FilePlus, MapPin, Upload, Globe, Send, Sparkles, Image as ImageIcon } from 'lucide-react';

export default function RaiseComplaint() {
  const { addComplaint, setActivePage } = useAppData();
  const { lang, setLang } = useLanguage();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('');
  const [ward, setWard] = useState('18');
  const [locationStr, setLocationStr] = useState('Anna Salai Main Road, Ward 18');
  const [coords, setCoords] = useState([10.7905, 78.7047]);
  const [imagePreview, setImagePreview] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleVoiceText = (text) => {
    setTitle("Deep Pothole near Model School");
    setDescription(text);
  };

  const handleMapSelect = (newPos) => {
    setCoords(newPos);
    setLocationStr(`Selected Spot (${newPos[0].toFixed(4)}, ${newPos[1].toFixed(4)}), Ward ${ward}`);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() && !description.trim()) return;

    setIsProcessing(true);
  };

  return (
    <div class="max-w-3xl mx-auto px-4 py-8 space-y-6">
      
      <div class="gov-card p-6 border-l-4 border-l-blue-500">
        <div class="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
          <div class="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
            <FilePlus class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-white">Raise Municipal Grievance Complaint</h2>
            <p class="text-xs text-slate-400">AI will automatically classify department, priority score, and check duplicate records</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} class="space-y-5">
          
          {/* Voice Input Recorder Integration */}
          <VoiceRecorder onTranscriptionComplete={handleVoiceText} />

          {/* Title */}
          <div>
            <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Complaint Title *</label>
            <input 
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Large Potholes near Model School Entrance"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Description & Details *</label>
            <textarea 
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue, exact street landmarks, and severity..."
              class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Interactive React Leaflet Map Location Picker */}
          <MapPicker defaultPos={coords} onSelectLocation={handleMapSelect} />

          {/* Department & Ward */}
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Department (Optional Override)</label>
              <select 
                value={department} 
                onChange={(e) => setDepartment(e.target.value)}
                class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Auto-Detect via Gemini AI (Recommended)</option>
                <option value="Roads">Roads Maintenance</option>
                <option value="Water">Water & Pipe Leakage</option>
                <option value="Garbage">Garbage & Sanitation</option>
                <option value="Drainage">Drainage & Sewage</option>
                <option value="Electricity">Electricity & Streetlights</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Municipal Ward</label>
              <select 
                value={ward} 
                onChange={(e) => setWard(e.target.value)}
                class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="18">Ward 18 (Anna Salai Zone)</option>
                <option value="7">Ward 7 (Hospital & School Zone)</option>
                <option value="12">Ward 12 (Commercial Market Zone)</option>
                <option value="4">Ward 4 (Bus Stop Avenue Zone)</option>
              </select>
            </div>
          </div>

          {/* Location Landmark */}
          <div>
            <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1">
              <MapPin class="w-3.5 h-3.5 text-red-400" /> Location / Google Maps Landmark
            </label>
            <input 
              type="text"
              value={locationStr}
              onChange={(e) => setLocationStr(e.target.value)}
              placeholder="e.g. Anna Salai Main Road near Model School"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Media & Language Selectors */}
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Cloudinary Image Upload Simulation */}
            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Upload class="w-3.5 h-3.5 text-blue-400" /> Upload Incident Photos (Cloudinary)
              </label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                class="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
              />
              {imagePreview && (
                <img src={imagePreview} alt="Preview" class="mt-2 w-full h-24 object-cover rounded-lg border border-slate-700" />
              )}
            </div>

            {/* Language Selection */}
            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Globe class="w-3.5 h-3.5 text-emerald-400" /> Preferred Language
              </label>
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value)}
                class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="EN">English</option>
                <option value="TA">தமிழ் (Tamil)</option>
                <option value="HI">हिंदी (Hindi)</option>
                <option value="ML">മലയാളം (Malayalam)</option>
              </select>
            </div>

          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            class="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 hover:brightness-110 text-white font-extrabold text-sm rounded-xl shadow-xl flex items-center justify-center gap-2 transition hover:scale-[1.01]"
          >
            <Sparkles class="w-4 h-4 text-amber-300" /> Submit Complaint to AI Engine
          </button>

        </form>

      </div>

      {/* 5-Step AI Processing Modal Trigger */}
      {isProcessing && (
        <AIProcessingModal 
          formData={{ title, description, department, ward, locationStr }}
          onComplete={() => setIsProcessing(false)}
        />
      )}

    </div>
  );
}
