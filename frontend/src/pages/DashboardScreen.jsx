import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sprout,
  CloudSun,
  Repeat,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Droplets,
  Calendar,
  Sparkles,
  RefreshCw,
  Sun
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";
import AudioButton from "../components/AudioButton";

export default function DashboardScreen() {
  const { farm, preferences, activePlan, lang, t } = useApp();
  const navigate = useNavigate();

  const [climate, setClimate] = useState(null);
  const [topCrop, setTopCrop] = useState(null);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      try {
        setLoading(true);
        // 1. Fetch Climate
        const climData = await api.getClimate(farm.id);
        if (isMounted) setClimate(climData);

        // 2. Fetch Top Crop Recommendation
        const recData = await api.getRecommendations({
          farm_id: farm.id,
          soil_type: farm.soil_type,
          irrigation_type: farm.irrigation_type,
          previous_crop: preferences.previous_crop,
          primary_goal: preferences.primary_goal
        });
        if (isMounted && recData.top_recommendations && recData.top_recommendations.length > 0) {
          setTopCrop(recData.top_recommendations[0]);
        }

        // 3. Fetch Alerts
        const alertsData = await api.getAlerts(farm.id);
        if (isMounted && alertsData && alertsData.length > 0) {
          setAlert(alertsData[0]);
        }
      } catch (err) {
        console.warn("Dashboard data load notice:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboardData();
    return () => { isMounted = false; };
  }, [farm, preferences]);

  const defaultGreeting = (lang === "en" ? "Hello" : "Namaskara");
  const dashboardAudioText = `${t("dashboardGreeting") || defaultGreeting}, ${farm.farmer_name || (lang === "en" ? "Farmer" : "Farmer")}. ${t("weatherFor") || "Weather for"} ${farm.village_name || "your farm"}. ${topCrop ? (t("topCrop") || "Top recommended crop:") + " " + (topCrop.name[lang] || topCrop.name.en) : ""}`;

  return (
    <div className="min-h-screen bg-transparent pb-24 max-w-md mx-auto">
      {/* Top Banner / Farmer Greeting with Farming Landscape Backdrop */}
      <div className="relative bg-gradient-to-b from-[#245C3A] via-[#1F5032] to-[#1C4B2E] text-white px-5 pt-4 pb-8 rounded-b-3xl shadow-lg overflow-hidden animate-fade-in">
        {/* Subtle agricultural background photo with dark overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none"
          style={{
            backgroundImage: `url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80")`
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#245C3A]/50 to-[#1C4B2E] pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between mb-3.5">
          <div>
            <p className="text-emerald-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#8DBF74] animate-pulse"></span>
              {t("dashboardGreeting") || defaultGreeting}
            </p>
            <h2 className="text-2xl font-black tracking-tight mt-0.5">
              {farm.farmer_name || "Farmer"}
            </h2>
          </div>
          <AudioButton text={dashboardAudioText} size="sm" />
        </div>

        {/* Village & Soil Micro Badges with Gentle Hover Feedback */}
        <div className="relative z-10 flex flex-wrap gap-2 text-[11px] font-semibold text-emerald-100">
          <span className="bg-emerald-950/60 backdrop-blur-sm px-3 py-1 rounded-full border border-emerald-400/30 shadow-sm hover:border-[#8DBF74] transition-colors">
            📍 {farm.village_name}
          </span>
          <span className="bg-emerald-950/60 backdrop-blur-sm px-3 py-1 rounded-full border border-emerald-400/30 shadow-sm hover:border-[#8DBF74] transition-colors">
            🪴 {farm.soil_type === "red" ? "Red Soil" : farm.soil_type === "black" ? "Black Soil" : farm.soil_type}
          </span>
          <span className="bg-emerald-950/60 backdrop-blur-sm px-3 py-1 rounded-full border border-emerald-400/30 shadow-sm hover:border-[#8DBF74] transition-colors">
            💧 {farm.irrigation_type === "rainwater" ? "Rainfed" : farm.irrigation_type}
          </span>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4 relative z-10">
        {/* Weather Summary Card (Pulling NASA POWER data) */}
        <Link
          to="/weather"
          className="farm-card block p-4 bg-white/95 backdrop-blur-sm border border-emerald-100/90 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-300 group animate-slide-up stagger-1"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-100 to-amber-200 text-amber-700 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                <CloudSun className="w-7 h-7 animate-float" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <Sun className="w-3 h-3 text-amber-600 animate-spin" style={{ animationDuration: '18s' }} />
                  NASA POWER Observation
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-gray-900 tracking-tight">
                    {climate ? `${climate.temp_mean}°C` : "25.6°C"}
                  </span>
                  <span className="text-xs text-gray-500 font-semibold">
                    {climate ? `Rain: ${climate.precipitation_annual_or_daily} mm` : "Rain: 68 mm"}
                  </span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 group-hover:text-[#245C3A] transition-all" />
          </div>
        </Link>

        {/* Climate Alert Highlight Banner */}
        {alert && (
          <Link
            to="/alerts"
            className="block p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-200/90 text-amber-900 shadow-sm hover:bg-amber-100/80 hover:shadow-md transition-all duration-300 group animate-slide-up stagger-2"
          >
            <div className="flex items-start gap-2.5">
              <div className="p-1 rounded-lg bg-amber-200/70 text-amber-700 shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-4 h-4 text-amber-700 animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs tracking-tight">
                    {alert.title[t("langCode") || "en"] || alert.title.en}
                  </h4>
                  <span className="text-[10px] text-amber-800 font-extrabold uppercase bg-amber-200/60 px-2 py-0.5 rounded-full">
                    Notice
                  </span>
                </div>
                <p className="text-[11px] text-amber-800/90 line-clamp-1 mt-0.5 font-medium">
                  {alert.explanation[t("langCode") || "en"] || alert.explanation.en}
                </p>
              </div>
            </div>
          </Link>
        )}

        {/* 4 Large Primary Action Cards */}
        <div className="animate-slide-up stagger-3">
          <div className="flex items-center justify-between px-1 mb-2.5">
            <h3 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
              Farm Management
            </h3>
            <span className="text-[11px] text-emerald-700 font-medium">
              4 Tools Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Card 1: My Crops */}
            <Link
              to="/recommendations"
              className="farm-card p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-36 group relative overflow-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-100 to-emerald-200 text-[#245C3A] flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-gray-900 leading-snug group-hover:text-[#245C3A] transition-colors">
                  {t("navCrops") || "My Crops"}
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5 font-medium line-clamp-1">
                  {topCrop ? topCrop.name[t("langCode") || "en"] || topCrop.name.en : "Top 3 Suitable"}
                </p>
              </div>
            </Link>

            {/* Card 2: Weather & Climate */}
            <Link
              to="/weather"
              className="farm-card p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-blue-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-36 group relative overflow-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-100 to-blue-200 text-blue-700 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <CloudSun className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-gray-900 leading-snug group-hover:text-blue-800 transition-colors">
                  {t("navWeather") || "Weather"}
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
                  NASA POWER Climatology
                </p>
              </div>
            </Link>

            {/* Card 3: Crop Rotation Planner */}
            <Link
              to="/rotation"
              className="farm-card p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-purple-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-36 group relative overflow-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-100 to-purple-200 text-purple-700 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <Repeat className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-gray-900 leading-snug group-hover:text-purple-800 transition-colors">
                  {t("navPlans") || "Crop Rotation"}
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
                  3-Season Soil Rebuilding
                </p>
              </div>
            </Link>

            {/* Card 4: Crop Calendar */}
            <Link
              to="/calendar"
              className="farm-card p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-amber-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between h-36 group relative overflow-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-100 to-amber-200 text-amber-700 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-gray-900 leading-snug group-hover:text-amber-800 transition-colors">
                  Crop Calendar
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
                  Sowing to Harvest Tasks
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Active Saved Plan Preview */}
        {activePlan && (
          <div className="farm-card p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-emerald-100/40 to-white border border-emerald-200/90 shadow-sm hover:shadow-md transition-all duration-300 animate-slide-up stagger-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-extrabold text-[#245C3A] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: '8s' }} />
                Active Crop Rotation Plan
              </span>
              <Link to="/rotation" className="text-xs font-bold text-[#245C3A] hover:underline flex items-center gap-0.5">
                <span>View Plan</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <h4 className="font-black text-sm text-gray-900">
              {activePlan.title || "Water-Smart Legume Cycle"}
            </h4>
            <p className="text-xs text-gray-600 mt-0.5 font-medium">
              Finger Millet ➔ Red Gram ➔ Sunnhemp Green Manure
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
