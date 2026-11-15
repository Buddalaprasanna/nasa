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
  RefreshCw
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";
import AudioButton from "../components/AudioButton";

export default function DashboardScreen() {
  const { farm, preferences, activePlan, t } = useApp();
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

  const dashboardAudioText = `${t("dashboardGreeting") || "Namaskara"}, ${farm.farmer_name || "Farmer"}. ${t("weatherFor") || "Weather for"} ${farm.village_name}. ${topCrop ? (t("topCrop") || "Top recommended crop:") + " " + (topCrop.name[t("langCode") || "en"] || topCrop.name.en) : ""}`;

  return (
    <div className="min-h-screen bg-[#F8F8F0] pb-24 max-w-md mx-auto">
      {/* Top Banner / Farmer Greeting */}
      <div className="bg-gradient-to-b from-[#245C3A] to-[#1C4B2E] text-white px-5 pt-4 pb-8 rounded-b-3xl shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-emerald-200 text-xs font-semibold uppercase tracking-wider">
              {t("dashboardGreeting") || "Namaskara"}
            </p>
            <h2 className="text-2xl font-black tracking-tight">
              {farm.farmer_name || "Farmer"}
            </h2>
          </div>
          <AudioButton text={dashboardAudioText} size="sm" />
        </div>

        {/* Village & Soil Micro Badges */}
        <div className="flex flex-wrap gap-2 text-[11px] font-medium text-emerald-100">
          <span className="bg-emerald-900/60 px-2.5 py-1 rounded-full border border-emerald-400/30">
            📍 {farm.village_name}
          </span>
          <span className="bg-emerald-900/60 px-2.5 py-1 rounded-full border border-emerald-400/30">
            🪴 {farm.soil_type === "red" ? "Red Soil" : farm.soil_type === "black" ? "Black Soil" : farm.soil_type}
          </span>
          <span className="bg-emerald-900/60 px-2.5 py-1 rounded-full border border-emerald-400/30">
            💧 {farm.irrigation_type === "rainwater" ? "Rainfed" : farm.irrigation_type}
          </span>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Weather Summary Card (Pulling NASA POWER data) */}
        <Link
          to="/weather"
          className="farm-card block p-4 bg-white border border-emerald-100 rounded-2xl shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <CloudSun className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  NASA POWER Observation
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-black text-gray-900">
                    {climate ? `${climate.temp_mean}°C` : "25.6°C"}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {climate ? `Rain: ${climate.precipitation_annual_or_daily} mm` : "Rain: 68 mm"}
                  </span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Link>

        {/* Climate Alert Highlight Banner */}
        {alert && (
          <Link
            to="/alerts"
            className="block p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 shadow-sm hover:bg-amber-100/70 transition-all"
          >
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs">
                    {alert.title[t("langCode") || "en"] || alert.title.en}
                  </h4>
                  <span className="text-[10px] text-amber-700 font-semibold uppercase">Notice</span>
                </div>
                <p className="text-[11px] text-amber-800 line-clamp-1 mt-0.5">
                  {alert.explanation[t("langCode") || "en"] || alert.explanation.en}
                </p>
              </div>
            </div>
          </Link>
        )}

        {/* 4 Large Primary Action Cards */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider px-1 mb-2.5">
            Farm Management
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {/* Card 1: My Crops */}
            <Link
              to="/recommendations"
              className="farm-card p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between h-36"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#245C3A] flex items-center justify-center">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-gray-900 leading-snug">
                  {t("navCrops") || "My Crops"}
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {topCrop ? topCrop.name[t("langCode") || "en"] || topCrop.name.en : "Top 3 Suitable"}
                </p>
              </div>
            </Link>

            {/* Card 2: Weather & Climate */}
            <Link
              to="/weather"
              className="farm-card p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between h-36"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <CloudSun className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-gray-900 leading-snug">
                  {t("navWeather") || "Weather"}
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  NASA POWER Climatology
                </p>
              </div>
            </Link>

            {/* Card 3: Crop Rotation Planner */}
            <Link
              to="/rotation"
              className="farm-card p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between h-36"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Repeat className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-gray-900 leading-snug">
                  {t("navPlans") || "Crop Rotation"}
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  3-Season Soil Rebuilding
                </p>
              </div>
            </Link>

            {/* Card 4: Crop Calendar */}
            <Link
              to="/calendar"
              className="farm-card p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between h-36"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-gray-900 leading-snug">
                  Crop Calendar
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Sowing to Harvest Tasks
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Active Saved Plan Preview */}
        {activePlan && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-emerald-100/60 border border-emerald-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-[#245C3A] uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Active Crop Rotation Plan
              </span>
              <Link to="/rotation" className="text-xs font-bold text-[#245C3A] hover:underline">
                View Plan →
              </Link>
            </div>
            <h4 className="font-black text-sm text-gray-900">
              {activePlan.title || "Water-Smart Legume Cycle"}
            </h4>
            <p className="text-xs text-gray-600 mt-0.5">
              Finger Millet ➔ Red Gram ➔ Sunnhemp Green Manure
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
