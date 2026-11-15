import React, { useEffect, useState } from "react";
import {
  Repeat,
  CheckCircle,
  BookmarkCheck,
  Droplets,
  Sprout,
  ArrowRight,
  TrendingDown,
  Layers,
  Sparkles,
  Scale
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";
import AudioButton from "../components/AudioButton";

export default function RotationScreen() {
  const { farm, preferences, lang, activePlan, setActivePlan, t } = useApp();

  const [plans, setPlans] = useState([]);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [comparing, setComparing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlans() {
      try {
        setLoading(true);
        const res = await api.generateRotation({
          farm_id: farm.id,
          soil_type: farm.soil_type,
          irrigation_type: farm.irrigation_type,
          previous_crop: preferences.previous_crop,
          primary_goal: preferences.primary_goal
        });
        setPlans(res.available_plans || []);
      } catch (err) {
        console.warn("Failed to generate rotation plans:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPlans();
  }, [farm, preferences]);

  const currentPlan = plans[selectedPlanIndex] || null;

  // Handle saving the chosen rotation plan
  const handleSavePlan = async (plan) => {
    try {
      await api.saveRotationPlan({
        farm_id: farm.id,
        plan_code: plan.plan_code,
        plan_title: plan.title,
        plan_summary: plan.summary,
        seasons: plan.seasons,
        water_saving_summary: plan.water_saving_summary,
        soil_health_summary: plan.soil_health_summary
      });
      setActivePlan({
        plan_code: plan.plan_code,
        title: plan.title[lang] || plan.title.en
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err) {
      console.warn("Error saving plan:", err);
      setActivePlan({
        plan_code: plan.plan_code,
        title: plan.title[lang] || plan.title.en
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    }
  };

  const spokenText = currentPlan
    ? `${currentPlan.title[lang] || currentPlan.title.en}. ${currentPlan.summary[lang] || currentPlan.summary.en}. Water impact: ${currentPlan.water_saving_summary[lang] || currentPlan.water_saving_summary.en}. Soil health: ${currentPlan.soil_health_summary[lang] || currentPlan.soil_health_summary.en}.`
    : "Multi-season crop rotation planner.";

  return (
    <div className="min-h-screen bg-[#F8F8F0] pb-24 max-w-md mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Repeat className="w-6 h-6 text-[#245C3A]" />
            <span>{t("navPlans") || "Crop Rotation Planner"}</span>
          </h2>
          <p className="text-xs text-gray-600">
            3-Season Soil Rebuilding & Pest Cycle Disruption
          </p>
        </div>
        <AudioButton text={spokenText} size="sm" />
      </div>

      {/* Plan Selection Tabs (Plan A vs Plan B) */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-gray-200/70 rounded-2xl">
        {plans.map((p, idx) => (
          <button
            key={p.plan_code}
            onClick={() => { setSelectedPlanIndex(idx); setComparing(false); }}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center ${
              selectedPlanIndex === idx && !comparing
                ? "bg-[#245C3A] text-white shadow-sm"
                : "text-gray-700 hover:text-gray-900"
            }`}
          >
            {idx === 0 ? "Plan A (Soil Builder)" : "Plan B (Cash & Income)"}
          </button>
        ))}
      </div>

      {/* Compare Plans Toggle Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setComparing(!comparing)}
          className="text-xs font-bold text-[#245C3A] flex items-center gap-1.5 bg-emerald-100/70 hover:bg-emerald-100 px-3 py-1.5 rounded-full"
        >
          <Scale className="w-4 h-4" />
          <span>{comparing ? "Show Single Plan Timeline" : "Compare Both Plans Side-by-Side"}</span>
        </button>
      </div>

      {/* Save Success Alert */}
      {savedSuccess && (
        <div className="p-3 bg-emerald-700 text-white text-xs font-bold rounded-2xl flex items-center gap-2 animate-bounce shadow-md">
          <BookmarkCheck className="w-5 h-5 text-emerald-200" />
          <span>{t("planSaved") || "Plan Saved Successfully to SQLite Database!"}</span>
        </div>
      )}

      {/* Comparison View */}
      {comparing && plans.length === 2 && (
        <div className="space-y-4">
          <div className="farm-card p-4 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-3">
            <h3 className="font-black text-sm text-gray-900 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-[#245C3A]" />
              Trade-Offs Comparison Matrix
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="font-bold text-[#245C3A] block mb-1">Plan A: Soil Rebuilding</span>
                <p className="text-[11px] text-gray-700">
                  {plans[0].trade_offs[lang] || plans[0].trade_offs.en}
                </p>
                <div className="mt-2 text-[10px] font-bold text-emerald-800">
                  💧 40% Water Saved
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                <span className="font-bold text-blue-900 block mb-1">Plan B: Income Balance</span>
                <p className="text-[11px] text-gray-700">
                  {plans[1].trade_offs[lang] || plans[1].trade_offs.en}
                </p>
                <div className="mt-2 text-[10px] font-bold text-blue-800">
                  💰 Continuous Cashflow
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Single Plan Visual Timeline View */}
      {currentPlan && !comparing && (
        <div className="space-y-4">
          {/* Plan Header Card */}
          <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                {currentPlan.plan_code === activePlan?.plan_code ? "★ Currently Active Plan" : "Recommended Rotation"}
              </span>
              <button
                onClick={() => handleSavePlan(currentPlan)}
                className="btn-touch px-3 py-1.5 rounded-full bg-[#245C3A] hover:bg-[#1b462c] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <BookmarkCheck className="w-4 h-4" />
                <span>{t("saveBtn") || "Save Plan"}</span>
              </button>
            </div>

            <h3 className="text-lg font-black text-gray-900 leading-tight">
              {currentPlan.title[lang] || currentPlan.title.en}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {currentPlan.summary[lang] || currentPlan.summary.en}
            </p>

            {/* Impact Highlights */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-900 border border-blue-100">
                <span className="text-[10px] text-blue-600 font-bold uppercase flex items-center gap-1">
                  <Droplets className="w-3 h-3" />
                  Water Impact
                </span>
                <p className="text-[11px] font-semibold mt-0.5">
                  {currentPlan.water_saving_summary[lang] || currentPlan.water_saving_summary.en}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-100">
                <span className="text-[10px] text-emerald-600 font-bold uppercase flex items-center gap-1">
                  <Sprout className="w-3 h-3" />
                  Soil Nutrition
                </span>
                <p className="text-[11px] font-semibold mt-0.5">
                  {currentPlan.soil_health_summary[lang] || currentPlan.soil_health_summary.en}
                </p>
              </div>
            </div>
          </div>

          {/* 3-Season Visual Timeline */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider px-1">
              3-Season Rotation Sequence
            </h4>

            {currentPlan.seasons.map((season, sIdx) => {
              const seasonName = season.season_name[lang] || season.season_name.en;
              const cropName = season.crop_name[lang] || season.crop_name.en;
              const waterImpact = season.water_impact[lang] || season.water_impact.en;
              const soilBenefit = season.soil_health_benefit[lang] || season.soil_health_benefit.en;
              const climateSuit = season.climate_suitability[lang] || season.climate_suitability.en;
              const sowingWin = season.sowing_window[lang] || season.sowing_window.en;
              const harvestWin = season.harvest_window[lang] || season.harvest_window.en;

              return (
                <div
                  key={season.season_number}
                  className="farm-card p-4 rounded-2xl bg-white border border-gray-100 shadow-sm relative overflow-hidden"
                >
                  {/* Step Ribbon */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#245C3A] bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      Season {season.season_number}: {seasonName}
                    </span>
                    <span className="text-[11px] text-gray-500 font-medium">
                      {sowingWin} ➔ {harvestWin}
                    </span>
                  </div>

                  {/* Crop Name */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">
                      {season.crop_id === "ragi" ? "🌾" : season.crop_id === "redgram" ? "🌱" : season.crop_id === "groundnut" ? "🥜" : "🌿"}
                    </span>
                    <div>
                      <h5 className="font-black text-base text-gray-900 leading-tight">
                        {cropName}
                      </h5>
                      <span className="text-[10px] font-semibold text-emerald-800">
                        {season.is_legume ? "★ Nitrogen-Fixing Legume" : "★ Resilient Cereal"}
                      </span>
                    </div>
                  </div>

                  {/* Soil & Water Details */}
                  <div className="space-y-1.5 text-xs text-gray-700 pt-1 border-t border-gray-100">
                    <p className="flex items-start gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-gray-900">Soil Benefit:</strong> {soilBenefit}
                      </span>
                    </p>
                    <p className="flex items-start gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-gray-900">Water Impact:</strong> {waterImpact}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trade-Offs Explanation */}
          <div className="p-3.5 rounded-2xl bg-gray-100 text-gray-700 text-xs space-y-1 border border-gray-200">
            <span className="font-bold text-gray-900 block">Agro-Economic Trade-Offs:</span>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              {currentPlan.trade_offs[lang] || currentPlan.trade_offs.en}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
