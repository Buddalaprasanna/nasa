import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sprout, MapPin, Globe, Bell, PhoneCall } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Header() {
  const { lang, setLang, farm, t } = useApp();
  const navigate = useNavigate();

  const languages = [
    { code: "kn", label: "ಕನ್ನಡ" },
    { code: "te", label: "తెలుగు" },
    { code: "ta", label: "தமிழ்" },
    { code: "hi", label: "हिन्दी" },
    { code: "en", label: "English" }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#245C3A] text-white shadow-md">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-[#8DBF74] flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
            <Sprout className="w-6 h-6 text-[#245C3A]" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-wide">FIELD SHIFT</h1>
            <p className="text-[10px] text-emerald-100 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#8DBF74]" />
              <span className="truncate max-w-[130px]">{farm.village_name || "Mandya"}</span>
            </p>
          </div>
        </Link>

        {/* Right Actions: Language Selector Pill & Alerts */}
        <div className="flex items-center gap-2">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="appearance-none bg-emerald-900/60 hover:bg-emerald-900 text-white text-xs font-semibold py-1.5 pl-7 pr-3 rounded-full border border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-[#8DBF74] cursor-pointer"
              aria-label="Select Language"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code} className="bg-gray-800 text-white">
                  {l.label}
                </option>
              ))}
            </select>
            <Globe className="w-3.5 h-3.5 text-[#8DBF74] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Alerts Bell */}
          <Link
            to="/alerts"
            className="w-9 h-9 rounded-full bg-emerald-900/60 flex items-center justify-center hover:bg-emerald-900 border border-emerald-500/40 relative"
            title="Climate Alerts"
            aria-label="Climate Alerts"
          >
            <Bell className="w-4 h-4 text-[#8DBF74]" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400"></span>
          </Link>
        </div>
      </div>
    </header>
  );
}
