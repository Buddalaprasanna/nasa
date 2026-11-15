import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sprout, MapPin, Globe, Bell } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Header() {
  const { lang, setLang, farm } = useApp();
  const navigate = useNavigate();

  const languages = [
    { code: "en", label: "English" },
    { code: "kn", label: "ಕನ್ನಡ" },
    { code: "te", label: "తెలుగు" },
    { code: "ta", label: "தமிழ்" },
    { code: "hi", label: "हिन्दी" }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#245C3A]/95 backdrop-blur-md text-white shadow-md border-b border-emerald-700/30 transition-all duration-300">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#8DBF74] to-[#A4D48D] flex items-center justify-center shadow-md shadow-emerald-950/20 group-hover:scale-105 active:scale-95 transition-all duration-300 ring-2 ring-emerald-400/20">
            <Sprout className="w-6 h-6 text-[#245C3A] group-hover:rotate-6 transition-transform duration-300" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg leading-tight tracking-wide group-hover:text-emerald-100 transition-colors">
              FIELD SHIFT
            </h1>
            <p className="text-[10px] text-emerald-100/90 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#8DBF74] animate-pulse" />
              <span className="truncate max-w-[130px] font-medium">{farm.village_name || "Mandya"}</span>
            </p>
          </div>
        </Link>

        {/* Right Actions: Language Selector Pill & Alerts */}
        <div className="flex items-center gap-2">
          {/* Language Selector Dropdown */}
          <div className="relative group">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="appearance-none bg-emerald-900/60 hover:bg-emerald-900/90 focus:bg-emerald-900 text-white text-xs font-semibold py-1.5 pl-7 pr-3 rounded-full border border-emerald-500/40 hover:border-[#8DBF74] focus:outline-none focus:ring-2 focus:ring-[#8DBF74]/60 cursor-pointer transition-all duration-200"
              aria-label="Select Language"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code} className="bg-gray-800 text-white">
                  {l.label}
                </option>
              ))}
            </select>
            <Globe className="w-3.5 h-3.5 text-[#8DBF74] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none group-hover:rotate-12 transition-transform duration-300" />
          </div>

          {/* Alerts Bell */}
          <Link
            to="/alerts"
            className="w-9 h-9 rounded-full bg-emerald-900/60 hover:bg-emerald-900/90 active:scale-95 flex items-center justify-center border border-emerald-500/40 hover:border-[#8DBF74] transition-all duration-200 relative group"
            title="Climate Alerts"
            aria-label="Climate Alerts"
          >
            <Bell className="w-4 h-4 text-[#8DBF74] group-hover:scale-110 group-hover:rotate-12 transition-transform duration-200" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 shadow-sm"></span>
          </Link>
        </div>
      </div>
    </header>
  );
}
