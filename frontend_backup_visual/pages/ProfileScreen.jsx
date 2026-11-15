import React from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  MapPin,
  Layers,
  Droplets,
  Maximize2,
  Globe,
  Volume2,
  BookmarkCheck,
  PhoneCall,
  RotateCcw,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { useApp } from "../context/AppContext";

export default function ProfileScreen() {
  const navigate = useNavigate();
  const {
    farm,
    lang,
    setLang,
    activePlan,
    audioRate,
    setAudioRate,
    t
  } = useApp();

  const languages = [
    { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
    { code: "te", label: "తెలుగు (Telugu)" },
    { code: "ta", label: "தமிழ் (Tamil)" },
    { code: "hi", label: "हिन्दी (Hindi)" },
    { code: "en", label: "English" }
  ];

  const handleReset = () => {
    if (window.confirm("Do you want to reset your farm profile and restart setup?")) {
      localStorage.removeItem("field_shift_setup_done");
      navigate("/language");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F0] pb-24 max-w-md mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="pt-1">
        <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
          <User className="w-6 h-6 text-[#245C3A]" />
          <span>{t("profileTitle") || "Farmer & Farm Profile"}</span>
        </h2>
        <p className="text-xs text-gray-600">
          Settings, Saved Plans & Agricultural Support
        </p>
      </div>

      {/* Farmer Card */}
      <div className="farm-card p-4 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#245C3A] text-white flex items-center justify-center font-bold text-lg">
            {farm.farmer_name ? farm.farmer_name.charAt(0) : "F"}
          </div>
          <div>
            <h3 className="font-bold text-base text-gray-900">
              {farm.farmer_name || "Ramesh Gowda"}
            </h3>
            <p className="text-xs text-gray-500">
              Mandya Farmer • ID #{farm.id || 1}
            </p>
          </div>
        </div>

        {/* Farm Attributes */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-100">
          <div className="p-2 rounded-xl bg-gray-50 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#245C3A]" />
            <div>
              <span className="text-[10px] text-gray-400 block">Village</span>
              <span className="font-semibold text-gray-800">{farm.village_name}</span>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-gray-50 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-700" />
            <div>
              <span className="text-[10px] text-gray-400 block">Soil</span>
              <span className="font-semibold text-gray-800 capitalize">{farm.soil_type} Soil</span>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-gray-50 flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-600" />
            <div>
              <span className="text-[10px] text-gray-400 block">Irrigation</span>
              <span className="font-semibold text-gray-800 capitalize">{farm.irrigation_type}</span>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-gray-50 flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-emerald-700" />
            <div>
              <span className="text-[10px] text-gray-400 block">Land Size</span>
              <span className="font-semibold text-gray-800">{farm.land_size_category.replace(/_/g, " ")}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate("/setup")}
          className="text-xs font-bold text-[#245C3A] hover:underline block text-center w-full pt-1"
        >
          {t("resetSetup") || "Edit Farm Information"} →
        </button>
      </div>

      {/* Language Selector */}
      <div className="farm-card p-4 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-2">
        <label className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-[#245C3A]" />
          <span>{t("changeLang") || "App Language"}</span>
        </label>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#245C3A]"
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      {/* Saved Crop Plans */}
      <div className="farm-card p-4 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-2">
        <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
          <BookmarkCheck className="w-4 h-4 text-[#245C3A]" />
          <span>{t("savedPlansSection") || "Saved Crop Plans"}</span>
        </h4>
        {activePlan ? (
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-gray-900">{activePlan.title}</span>
              <span className="text-[10px] bg-[#245C3A] text-white px-2 py-0.5 rounded-full font-bold">
                Active
              </span>
            </div>
            <p className="text-[11px] text-gray-600 mt-1">
              Code: {activePlan.plan_code} • Multi-Season Sequence
            </p>
          </div>
        ) : (
          <p className="text-xs text-gray-500 italic">No saved plans yet. Generate one in Crop Rotation.</p>
        )}
      </div>

      {/* Audio Preferences */}
      <div className="farm-card p-4 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-2">
        <label className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
          <Volume2 className="w-4 h-4 text-[#245C3A]" />
          <span>Voice Guidance Speed</span>
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.75"
            max="1.1"
            step="0.05"
            value={audioRate}
            onChange={(e) => setAudioRate(parseFloat(e.target.value))}
            className="flex-1 accent-[#245C3A]"
          />
          <span className="text-xs font-bold text-gray-700 w-12 text-right">
            {audioRate < 0.85 ? "Slow" : audioRate > 0.95 ? "Fast" : "Clear"}
          </span>
        </div>
      </div>

      {/* Kisan Helpline Emergency Dial */}
      <a
        href="tel:1551"
        className="btn-touch p-4 rounded-2xl bg-emerald-800 text-white flex items-center justify-between shadow-md hover:bg-emerald-900 active:scale-98 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <PhoneCall className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h4 className="font-black text-sm">Kisan Call Centre (Toll-Free)</h4>
            <p className="text-xs text-emerald-200">Dial 1551 (Govt of India)</p>
          </div>
        </div>
        <ExternalLink className="w-4 h-4 text-emerald-200" />
      </a>

      {/* Reset & Restart Setup Button */}
      <div className="pt-2">
        <button
          onClick={handleReset}
          className="btn-touch w-full py-3.5 border-2 border-red-200 text-red-700 hover:bg-red-50 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t("logout") || "Reset Farm Profile & Restart Setup"}</span>
        </button>
      </div>
    </div>
  );
}
