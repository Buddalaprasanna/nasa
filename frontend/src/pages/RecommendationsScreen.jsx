import React, { useEffect, useState } from "react";
import {
  Sprout,
  Droplets,
  Clock,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle2,
  X,
  Sparkles,
  Layers
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";
import AudioButton from "../components/AudioButton";

export default function RecommendationsScreen() {
  const { farm, preferences, lang, t } = useApp();
  const [recommendations, setRecommendations] = useState([]);
  const [missingNotes, setMissingNotes] = useState("");
  const [disclaimer, setDisclaimer] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState(null);

  useEffect(() => {
    async function loadRecs() {
      try {
        setLoading(true);
        const res = await api.getRecommendations({
          farm_id: farm.id,
          soil_type: farm.soil_type,
          irrigation_type: farm.irrigation_type,
          previous_crop: preferences.previous_crop,
          primary_goal: preferences.primary_goal
        });
        setRecommendations(res.top_recommendations || []);
        setMissingNotes(res.missing_data_notes || "");
        setDisclaimer(res.transparency_statement || "");
      } catch (err) {
        console.warn("Failed to load recommendations:", err);
      } finally {
        setLoading(false);
      }
    }

    loadRecs();
  }, [farm, preferences]);

  // Crop images dictionary
  const cropImages = {
    ragi: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
    redgram: "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80",
    groundnut: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=600&q=80",
    chickpea: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    maize: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80",
    greengram: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
    sorghum: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80",
    sunnhemp: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80"
  };

  return (
    <div className="min-h-screen bg-transparent pb-24 max-w-md mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-1 animate-fade-in">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Sprout className="w-6 h-6 text-[#245C3A] animate-sway" />
            <span>{t("navCrops") || "Crop Recommendations"}</span>
          </h2>
          <p className="text-xs text-gray-600 font-medium">
            For {farm.village_name} • {farm.soil_type === "red" ? "Red Soil" : farm.soil_type}
          </p>
        </div>
        <AudioButton
          text={`Top recommended crops for your farm in ${farm.village_name}.`}
          size="sm"
        />
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="farm-card bg-white rounded-2xl h-56 skeleton-shimmer"></div>
          <div className="farm-card bg-white rounded-2xl h-56 skeleton-shimmer"></div>
        </div>
      )}

      {/* Top 3 Crop Cards */}
      {!loading && (
        <div className="space-y-4">
          {recommendations.map((crop, idx) => {
            const cropName = crop.name[lang] || crop.name["en"];
            const sowingWindow = crop.sowing_season[lang] || crop.sowing_season["en"];
            const reasonsList = crop.reasons[lang] || crop.reasons["en"] || [];
            const climateRisk = crop.climate_risks[lang] || crop.climate_risks["en"];
            const imgUrl = cropImages[crop.crop_id] || cropImages.ragi;

            const spokenCrop = `${cropName}. Suitability: ${crop.suitability_category}. Water requirement: ${crop.water_req_level}. Growing duration: ${crop.duration_days}. Sowing season: ${sowingWindow}. Key reason: ${reasonsList[0] || ""}. Climate risk: ${climateRisk || ""}`;

            const staggerClasses = ["stagger-1", "stagger-2", "stagger-3", "stagger-4"];

            return (
              <div
                key={crop.crop_id}
                className={`farm-card bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-300 overflow-hidden animate-slide-up group ${staggerClasses[idx] || ""}`}
              >
                {/* Image & Rank Badge with smooth zoom physics */}
                <div className="relative h-36 w-full overflow-hidden bg-emerald-950">
                  <img
                    src={imgUrl}
                    alt={cropName}
                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>

                  {/* Rank Badge */}
                  <span className="absolute top-3 left-3 bg-[#245C3A]/90 backdrop-blur-sm text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md border border-emerald-400/30">
                    #{idx + 1} Recommendation
                  </span>

                  {/* Suitability Pill */}
                  <span className="absolute top-3 right-3 bg-emerald-500/90 backdrop-blur-sm text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {crop.suitability_category}
                  </span>

                  {/* Crop Name on Image bottom */}
                  <div className="absolute bottom-2.5 left-3 right-3 text-white">
                    <h3 className="text-xl font-black leading-tight drop-shadow-md group-hover:text-emerald-200 transition-colors">
                      {cropName}
                    </h3>
                    <p className="text-xs text-emerald-200 italic font-semibold">
                      {crop.scientific_name} • {crop.category}
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  {/* 3 Metric Pills */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-blue-50/80 text-blue-900 p-2 rounded-xl border border-blue-100 hover:bg-blue-100/60 transition-colors">
                      <span className="block text-[10px] text-blue-600 font-extrabold uppercase">Water</span>
                      <span className="font-black flex items-center justify-center gap-1 mt-0.5">
                        <Droplets className="w-3.5 h-3.5 text-blue-500" />
                        {crop.water_req_level}
                      </span>
                    </div>
                    <div className="bg-purple-50/80 text-purple-900 p-2 rounded-xl border border-purple-100 hover:bg-purple-100/60 transition-colors">
                      <span className="block text-[10px] text-purple-600 font-extrabold uppercase">Duration</span>
                      <span className="font-black flex items-center justify-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-purple-500" />
                        {crop.duration_days.split(" ")[0]} d
                      </span>
                    </div>
                    <div className="bg-amber-50/80 text-amber-900 p-2 rounded-xl border border-amber-100 hover:bg-amber-100/60 transition-colors">
                      <span className="block text-[10px] text-amber-600 font-extrabold uppercase">Type</span>
                      <span className="font-black mt-0.5 block truncate">
                        {crop.is_legume ? "Legume" : "Millet/Grain"}
                      </span>
                    </div>
                  </div>

                  {/* Sowing Window */}
                  <div className="text-xs text-gray-700 bg-gray-50/80 p-2.5 rounded-xl flex items-center gap-2 border border-gray-100">
                    <Calendar className="w-4 h-4 text-[#245C3A] shrink-0" />
                    <span>
                      <strong className="font-bold">Sowing:</strong> {sowingWindow}
                    </span>
                  </div>

                  {/* Top Reason */}
                  {reasonsList.length > 0 && (
                    <div className="text-xs text-gray-800 space-y-1">
                      <span className="font-extrabold text-[#245C3A] block">Why Recommended:</span>
                      <ul className="list-disc pl-4 space-y-0.5 text-gray-600 text-[11px] font-medium">
                        {reasonsList.slice(0, 2).map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Climate Risk Alert */}
                  {climateRisk && (
                    <div className="p-2.5 rounded-xl bg-amber-50/80 text-amber-900 text-[11px] flex items-start gap-2 border border-amber-200">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <strong className="font-bold">Climate Risk:</strong> {climateRisk}
                      </div>
                    </div>
                  )}

                  {/* Bottom Card Actions: Audio Listen & View Details */}
                  <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                    <AudioButton text={spokenCrop} label="Listen Advice" size="sm" />
                    <button
                      onClick={() => setSelectedCrop(crop)}
                      className="text-xs font-black text-[#245C3A] hover:text-[#1b462c] hover:underline transition-colors flex items-center gap-1 group-hover:translate-x-0.5"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Missing Information Notice Box */}
      {missingNotes && (
        <div className="p-3.5 rounded-2xl bg-blue-50/90 border border-blue-200 text-blue-900 text-xs flex items-start gap-2 animate-slide-up">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Agricultural Data Notes:</span>
            <p className="text-[11px] text-blue-800 mt-0.5 font-medium">{missingNotes}</p>
          </div>
        </div>
      )}

      {/* Advisory Disclaimer */}
      <div className="p-3.5 rounded-2xl bg-white border border-gray-200/80 text-gray-600 text-[11px] leading-relaxed shadow-sm animate-slide-up">
        <span className="font-bold text-gray-800 block mb-0.5">Advisory Notice:</span>
        {disclaimer ||
          "Recommendations are decision-support guidelines based on regional NASA Earth observation data and standard agronomy. Always verify with your local Raitha Samparka Kendra or Krishi Vigyan Kendra."}
      </div>

      {/* Crop Details Modal */}
      {selectedCrop && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl max-h-[85vh] overflow-y-auto p-5 space-y-4 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-xl font-black text-gray-900">
                  {selectedCrop.name[lang] || selectedCrop.name.en}
                </h3>
                <p className="text-xs text-gray-500 italic font-semibold">
                  {selectedCrop.scientific_name}
                </p>
              </div>
              <button
                onClick={() => setSelectedCrop(null)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:rotate-90 active:scale-95 transition-all duration-200"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Soil Health Benefits */}
            <div className="bg-emerald-50/90 p-3.5 rounded-2xl border border-emerald-200">
              <span className="text-xs font-bold text-[#245C3A] flex items-center gap-1.5 mb-1">
                <Layers className="w-4 h-4" />
                Soil Health & Biology
              </span>
              <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                {selectedCrop.soil_health_benefits[lang] ||
                  selectedCrop.soil_health_benefits.en}
              </p>
            </div>

            {/* Complete Reasons */}
            <div>
              <span className="text-xs font-bold text-gray-800 block mb-1">
                Full Agronomic Rationale:
              </span>
              <ul className="list-disc pl-4 space-y-1 text-xs text-gray-700 font-medium">
                {(selectedCrop.reasons[lang] || selectedCrop.reasons.en || []).map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setSelectedCrop(null)}
              className="btn-touch w-full py-3 bg-[#245C3A] hover:bg-[#1c4b2e] active:scale-98 text-white font-bold text-sm rounded-xl transition-all shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
