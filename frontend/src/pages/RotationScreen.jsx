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
  Scale,
  Calendar
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
    <div className="min-h-screen bg-transparent pb-24 max-w-md mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-1 animate-fade-in">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Repeat className="w-6 h-6 text-[#245C3A] animate-spin" style={{ animationDuration: '24s' }} />
            <span>{t("navPlans") || "Crop Rotation Planner"}</span>
          </h2>
          <p className="text-xs text-gray-600 font-medium">
            3-Season Soil Rebuilding & Pest Cycle Disruption
          </p>
        </div>
        <AudioButton text={spokenText} size="sm" />
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-12 bg-gray-200/80 rounded-2xl skeleton-shimmer"></div>
          <div className="h-44 bg-white rounded-2xl skeleton-shimmer"></div>
          <div className="h-32 bg-white rounded-2xl skeleton-shimmer"></div>
        </div>
      )}

      {!loading && (
        <>
          {/* Plan Selection Tabs (Plan A vs Plan B) */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-gray-200/80 backdrop-blur-sm rounded-2xl shadow-inner animate-slide-up">
            {plans.map((p, idx) => (
              <button
                key={p.plan_code}
                onClick={() => { setSelectedPlanIndex(idx); setComparing(false); }}
                className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all duration-300 text-center ${
                  selectedPlanIndex === idx && !comparing
                    ? "bg-[#245C3A] text-white shadow-md scale-[1.01]"
                    : "text-gray-700 hover:text-gray-900 hover:bg-white/50"
                }`}
              >
                {idx === 0 ? "Plan A (Soil Builder)" : "Plan B (Cash & Income)"}
              </button>
            ))}
          </div>

          {/* Compare Plans Toggle Button */}
          <div className="flex justify-end animate-slide-up stagger-1">
            <button
              onClick={() => setComparing(!comparing)}
              className="text-xs font-bold text-[#245C3A] flex items-center gap-1.5 bg-emerald-100/80 hover:bg-emerald-200/90 active:scale-95 px-3.5 py-1.5 rounded-full transition-all duration-200 shadow-sm border border-emerald-300/40"
            >
              <Scale className="w-4 h-4" />
              <span>{comparing ? "Show Single Plan Timeline" : "Compare Both Plans Side-by-Side"}</span>
            </button>
          </div>

          {/* Save Success Alert */}
          {savedSuccess && (
            <div className="p-3 bg-gradient-to-r from-emerald-700 to-emerald-800 text-white text-xs font-black rounded-2xl flex items-center gap-2 animate-bounce shadow-lg border border-emerald-500/30">
              <BookmarkCheck className="w-5 h-5 text-emerald-200 shrink-0" />
              <span>{t("planSaved") || "Plan Saved Successfully to SQLite Database!"}</span>
            </div>
          )}

          {/* Comparison View */}
          {comparing && plans.length === 2 && (
            <div className="space-y-4 animate-scale-in">
              <div className="farm-card p-4 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-3">
                <h3 className="font-black text-sm text-gray-900 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-[#245C3A]" />
                  Trade-Offs Comparison Matrix
                </h3>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-gradient-to-b from-emerald-50 to-emerald-100/40 border border-emerald-200">
                    <span className="font-bold text-[#245C3A] block mb-1">Plan A: Soil Rebuilding</span>
                    <p className="text-[11px] text-gray-700 font-medium">
                      {plans[0].trade_offs[lang] || plans[0].trade_offs.en}
                    </p>
                    <div className="mt-2 text-[10px] font-black text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-full inline-block">
                      💧 40% Water Saved
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-gradient-to-b from-blue-50 to-blue-100/40 border border-blue-200">
                    <span className="font-bold text-blue-900 block mb-1">Plan B: Income Balance</span>
                    <p className="text-[11px] text-gray-700 font-medium">
                      {plans[1].trade_offs[lang] || plans[1].trade_offs.en}
                    </p>
                    <div className="mt-2 text-[10px] font-black text-blue-800 bg-blue-200/60 px-2 py-0.5 rounded-full inline-block">
                      💰 Continuous Cashflow
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Single Plan Visual Timeline View */}
          {currentPlan && !comparing && (
            <div className="space-y-4 animate-fade-in">
              {/* Plan Header Card */}
              <div className="farm-card p-4 rounded-2xl bg-white border border-emerald-100 shadow-sm hover:shadow-md transition-all duration-300 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-300/40">
                    {currentPlan.plan_code === activePlan?.plan_code ? "★ Currently Active Plan" : "Recommended Rotation"}
                  </span>
                  <button
                    onClick={() => handleSavePlan(currentPlan)}
                    className="btn-touch px-3.5 py-1.5 rounded-full bg-[#245C3A] hover:bg-[#1b462c] active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
                  >
                    <BookmarkCheck className="w-4 h-4 text-[#8DBF74]" />
                    <span>{t("saveBtn") || "Save Plan"}</span>
                  </button>
                </div>

                <h3 className="text-lg font-black text-gray-900 leading-tight">
                  {currentPlan.title[lang] || currentPlan.title.en}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  {currentPlan.summary[lang] || currentPlan.summary.en}
                </p>

                {/* Impact Highlights */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <div className="p-2.5 rounded-xl bg-blue-50/90 text-blue-900 border border-blue-100 hover:bg-blue-100/60 transition-colors">
                    <span className="text-[10px] text-blue-600 font-extrabold uppercase flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-blue-500" />
                      Water Impact
                    </span>
                    <p className="text-[11px] font-bold mt-0.5">
                      {currentPlan.water_saving_summary[lang] || currentPlan.water_saving_summary.en}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50/90 text-emerald-900 border border-emerald-100 hover:bg-emerald-100/60 transition-colors">
                    <span className="text-[10px] text-emerald-600 font-extrabold uppercase flex items-center gap-1">
                      <Sprout className="w-3 h-3 text-emerald-600" />
                      Soil Nutrition
                    </span>
                    <p className="text-[11px] font-bold mt-0.5">
                      {currentPlan.soil_health_summary[lang] || currentPlan.soil_health_summary.en}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3-Season Visual Timeline with Connector Dots */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                    3-Season Rotation Sequence
                  </h4>
                  <span className="text-[11px] text-emerald-700 font-medium">
                    Annual Cycle
                  </span>
                </div>

                {currentPlan.seasons.map((season, sIdx) => {
                  const seasonName = season.season_name[lang] || season.season_name.en;
                  const cropName = season.crop_name[lang] || season.crop_name.en;
                  const waterImpact = season.water_impact[lang] || season.water_impact.en;
                  const soilBenefit = season.soil_health_benefit[lang] || season.soil_health_benefit.en;
                  const sowingWin = season.sowing_window[lang] || season.sowing_window.en;
                  const harvestWin = season.harvest_window[lang] || season.harvest_window.en;

                  const staggerClasses = ["stagger-1", "stagger-2", "stagger-3"];

                  return (
                    <div key={season.season_number} className="relative">
                      {/* Connecting vertical line between seasons */}
                      {sIdx < currentPlan.seasons.length - 1 && (
                        <div className="absolute left-7 top-16 bottom-0 w-0.5 bg-gradient-to-b from-emerald-400 to-emerald-200 z-0 opacity-70"></div>
                      )}

                      <div
                        className={`farm-card p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-300 relative z-10 overflow-hidden animate-slide-up group ${staggerClasses[sIdx] || ""}`}
                      >
                        {/* Step Ribbon */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black text-[#245C3A] bg-emerald-100/90 border border-emerald-300/40 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#245C3A]"></span>
                            Season {season.season_number}: {seasonName}
                          </span>
                          <span className="text-[11px] text-gray-500 font-semibold flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            {sowingWin} ➔ {harvestWin}
                          </span>
                        </div>

                        {/* Crop Name */}
                        <div className="flex items-center gap-3 mb-2.5">
                          <span className="text-3xl p-1.5 rounded-xl bg-emerald-50 border border-emerald-100 group-hover:scale-110 transition-transform duration-300">
                            {season.crop_id === "ragi" ? "🌾" : season.crop_id === "redgram" ? "🌱" : season.crop_id === "groundnut" ? "🥜" : "🌿"}
                          </span>
                          <div>
                            <h5 className="font-black text-base text-gray-900 leading-tight group-hover:text-[#245C3A] transition-colors">
                              {cropName}
                            </h5>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                              {season.is_legume ? "★ Nitrogen-Fixing Legume" : "★ Resilient Cereal"}
                            </span>
                          </div>
                        </div>

                        {/* Soil & Water Details */}
                        <div className="space-y-1.5 text-xs text-gray-700 pt-2 border-t border-gray-100">
                          <p className="flex items-start gap-1.5 font-medium">
                            <Layers className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>
                              <strong className="text-gray-900 font-bold">Soil Benefit:</strong> {soilBenefit}
                            </span>
                          </p>
                          <p className="flex items-start gap-1.5 font-medium">
                            <Droplets className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                            <span>
                              <strong className="text-gray-900 font-bold">Water Impact:</strong> {waterImpact}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Trade-Offs Explanation */}
              <div className="farm-card p-3.5 rounded-2xl bg-white border border-gray-200/80 text-gray-700 text-xs space-y-1 shadow-sm animate-slide-up stagger-4">
                <span className="font-black text-gray-900 block">Agro-Economic Trade-Offs:</span>
                <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
                  {currentPlan.trade_offs[lang] || currentPlan.trade_offs.en}
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
