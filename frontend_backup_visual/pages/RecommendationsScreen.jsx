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
    <div className="min-h-screen bg-[#F8F8F0] pb-24 max-w-md mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Sprout className="w-6 h-6 text-[#245C3A]" />
            <span>{t("navCrops") || "Crop Recommendations"}</span>
          </h2>
          <p className="text-xs text-gray-600">
            For {farm.village_name} • {farm.soil_type === "red" ? "Red Soil" : farm.soil_type}
          </p>
        </div>
        <AudioButton
          text={`Top recommended crops for your farm in ${farm.village_name}.`}
          size="sm"
        />
      </div>

      {/* Top 3 Crop Cards */}
      <div className="space-y-4">
        {recommendations.map((crop, idx) => {
          const cropName = crop.name[lang] || crop.name["en"];
          const sowingWindow = crop.sowing_season[lang] || crop.sowing_season["en"];
          const reasonsList = crop.reasons[lang] || crop.reasons["en"] || [];
          const climateRisk = crop.climate_risks[lang] || crop.climate_risks["en"];
          const imgUrl = cropImages[crop.crop_id] || cropImages.ragi;

          const spokenCrop = `${cropName}. Suitability: ${crop.suitability_category}. Water requirement: ${crop.water_req_level}. Growing duration: ${crop.duration_days}. Sowing season: ${sowingWindow}. Key reason: ${reasonsList[0] || ""}. Climate risk: ${climateRisk || ""}`;

          return (
            <div
              key={crop.crop_id}
              className="farm-card bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* Image & Rank Badge */}
              <div className="relative h-36 w-full overflow-hidden bg-emerald-950">
                <img
                  src={imgUrl}
                  alt={cropName}
                  className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                {/* Rank Badge */}
                <span className="absolute top-3 left-3 bg-[#245C3A] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                  #{idx + 1} Recommendation
                </span>

                {/* Suitability Pill */}
                <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {crop.suitability_category}
                </span>

                {/* Crop Name on Image bottom */}
                <div className="absolute bottom-2.5 left-3 right-3 text-white">
                  <h3 className="text-xl font-black leading-tight drop-shadow-md">
                    {cropName}
                  </h3>
                  <p className="text-xs text-emerald-200 italic font-medium">
                    {crop.scientific_name} • {crop.category}
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                {/* 3 Metric Pills */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-blue-50 text-blue-900 p-2 rounded-xl border border-blue-100">
                    <span className="block text-[10px] text-blue-600 font-semibold uppercase">Water</span>
                    <span className="font-bold flex items-center justify-center gap-1 mt-0.5">
                      <Droplets className="w-3.5 h-3.5 text-blue-500" />
                      {crop.water_req_level}
                    </span>
                  </div>
                  <div className="bg-purple-50 text-purple-900 p-2 rounded-xl border border-purple-100">
                    <span className="block text-[10px] text-purple-600 font-semibold uppercase">Duration</span>
                    <span className="font-bold flex items-center justify-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-purple-500" />
                      {crop.duration_days.split(" ")[0]} d
                    </span>
                  </div>
                  <div className="bg-amber-50 text-amber-900 p-2 rounded-xl border border-amber-100">
                    <span className="block text-[10px] text-amber-600 font-semibold uppercase">Type</span>
                    <span className="font-bold mt-0.5 block truncate">
                      {crop.is_legume ? "Legume" : "Millet/Grain"}
                    </span>
                  </div>
                </div>

                {/* Sowing Window */}
                <div className="text-xs text-gray-700 bg-gray-50 p-2.5 rounded-xl flex items-center gap-2 border border-gray-100">
                  <Calendar className="w-4 h-4 text-[#245C3A] shrink-0" />
                  <span>
                    <strong>Sowing:</strong> {sowingWindow}
                  </span>
                </div>

                {/* Top Reason */}
                {reasonsList.length > 0 && (
                  <div className="text-xs text-gray-800 space-y-1">
                    <span className="font-bold text-[#245C3A] block">Why Recommended:</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-gray-600 text-[11px]">
                      {reasonsList.slice(0, 2).map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Climate Risk Alert */}
                {climateRisk && (
                  <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 text-[11px] flex items-start gap-2 border border-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
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
                    className="text-xs font-bold text-[#245C3A] hover:text-[#1b462c] hover:underline"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Missing Information Notice Box */}
      {missingNotes && (
        <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Agricultural Data Notes:</span>
            <p className="text-[11px] text-blue-800 mt-0.5">{missingNotes}</p>
          </div>
        </div>
      )}

      {/* Advisory Disclaimer */}
      <div className="p-3.5 rounded-2xl bg-gray-100 text-gray-600 text-[11px] leading-relaxed border border-gray-200">
        <span className="font-bold text-gray-800 block mb-0.5">Advisory Notice:</span>
        {disclaimer ||
          "Recommendations are decision-support guidelines based on regional NASA Earth observation data and standard agronomy. Always verify with your local Raitha Samparka Kendra or Krishi Vigyan Kendra."}
      </div>

      {/* Crop Details Modal */}
      {selectedCrop && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl max-h-[85vh] overflow-y-auto p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-xl font-black text-gray-900">
                  {selectedCrop.name[lang] || selectedCrop.name.en}
                </h3>
                <p className="text-xs text-gray-500 italic">
                  {selectedCrop.scientific_name}
                </p>
              </div>
              <button
                onClick={() => setSelectedCrop(null)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Soil Health Benefits */}
            <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200">
              <span className="text-xs font-bold text-[#245C3A] flex items-center gap-1.5 mb-1">
                <Layers className="w-4 h-4" />
                Soil Health & Biology
              </span>
              <p className="text-xs text-emerald-900 leading-relaxed">
                {selectedCrop.soil_health_benefits[lang] ||
                  selectedCrop.soil_health_benefits.en}
              </p>
            </div>

            {/* Complete Reasons */}
            <div>
              <span className="text-xs font-bold text-gray-800 block mb-1">
                Full Agronomic Rationale:
              </span>
              <ul className="list-disc pl-4 space-y-1 text-xs text-gray-700">
                {(selectedCrop.reasons[lang] || selectedCrop.reasons.en || []).map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setSelectedCrop(null)}
              className="btn-touch w-full py-3 bg-[#245C3A] text-white font-bold text-sm rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
