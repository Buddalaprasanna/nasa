import React from "react";
import { useNavigate } from "react-router-dom";
import { Sprout, Sun, CloudRain, ArrowRight, Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext";
import AudioButton from "../components/AudioButton";

export default function WelcomeScreen() {
  const navigate = useNavigate();
  const { t } = useApp();

  const welcomeText = `${t("welcomeTitle") || "Welcome to Field Shift!"} ${t("welcomeSubtitle") || "Let's find the right crops for your farm."}`;

  return (
    <div className="relative min-h-screen bg-transparent flex flex-col justify-between p-6 max-w-md mx-auto overflow-hidden">
      {/* Top Header with Listen Button */}
      <div className="flex items-center justify-between pt-2 relative z-10 animate-fade-in">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#245C3A] tracking-wider uppercase bg-emerald-100/90 border border-emerald-300/40 px-3.5 py-1 rounded-full shadow-sm backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#245C3A]" />
          FIELD SHIFT
        </span>
        <AudioButton text={welcomeText} label={t("listenBtn") || "Listen"} />
      </div>

      {/* Main Illustration and Welcome Copy */}
      <div className="text-center my-auto py-4 relative z-10">
        {/* Visual Agricultural Vignette with Gentle Floating Badges */}
        <div className="relative w-44 h-44 mx-auto mb-6 animate-scale-in">
          {/* Subtle agricultural field backdrop photo inside circle */}
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-emerald-200 via-emerald-100 to-amber-100 flex items-center justify-center shadow-xl border-4 border-white relative overflow-hidden group">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-25"
              style={{
                backgroundImage: `url("https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80")`
              }}
            />
            <Sprout className="w-24 h-24 text-[#245C3A] relative z-10 animate-sway" />
          </div>

          {/* Floating Sun Badge */}
          <div className="absolute top-2 left-0 bg-amber-400 text-gray-900 rounded-full p-2.5 shadow-lg border-2 border-white animate-float">
            <Sun className="w-5 h-5 animate-spin" style={{ animationDuration: '16s' }} />
          </div>

          {/* Floating Rain Badge */}
          <div className="absolute bottom-2 right-1 bg-blue-500 text-white rounded-full p-2.5 shadow-lg border-2 border-white animate-float-delayed">
            <CloudRain className="w-5 h-5" />
          </div>
        </div>

        {/* Headings */}
        <h1 className="text-2xl font-black text-gray-900 leading-tight mb-2 tracking-tight animate-slide-up">
          {t("welcomeTitle") || "Welcome to Field Shift!"}
        </h1>
        <p className="text-base text-gray-700 font-medium max-w-xs mx-auto leading-relaxed animate-slide-up stagger-1">
          {t("welcomeSubtitle") || "Let's find the right crops for your farm."}
        </p>

        {/* Feature Pillars with Staggered Entrance & Smooth Hover Lift */}
        <div className="grid grid-cols-3 gap-2 mt-8 text-left">
          <div className="farm-card bg-white/95 backdrop-blur-sm p-3 rounded-2xl border border-gray-100/90 shadow-sm hover:-translate-y-1 hover:border-emerald-200 transition-all duration-300 animate-slide-up stagger-2">
            <span className="text-2xl block mb-1">🛰️</span>
            <h4 className="text-xs font-bold text-gray-900">NASA Data</h4>
            <p className="text-[10px] text-gray-500 mt-0.5 font-medium">Local climate trends</p>
          </div>
          <div className="farm-card bg-white/95 backdrop-blur-sm p-3 rounded-2xl border border-gray-100/90 shadow-sm hover:-translate-y-1 hover:border-emerald-200 transition-all duration-300 animate-slide-up stagger-3">
            <span className="text-2xl block mb-1">🌾</span>
            <h4 className="text-xs font-bold text-gray-900">Right Crops</h4>
            <p className="text-[10px] text-gray-500 mt-0.5 font-medium">Save water & costs</p>
          </div>
          <div className="farm-card bg-white/95 backdrop-blur-sm p-3 rounded-2xl border border-gray-100/90 shadow-sm hover:-translate-y-1 hover:border-emerald-200 transition-all duration-300 animate-slide-up stagger-4">
            <span className="text-2xl block mb-1">🔄</span>
            <h4 className="text-xs font-bold text-gray-900">Rotation</h4>
            <p className="text-[10px] text-gray-500 mt-0.5 font-medium">Rebuild soil health</p>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="pb-4 space-y-3 relative z-10 animate-slide-up">
        <button
          onClick={() => navigate("/setup")}
          className="btn-touch w-full py-4 bg-gradient-to-r from-[#245C3A] to-[#1C4B2E] hover:from-[#1b482c] hover:to-[#153a23] active:from-[#153a23] active:to-[#112d1b] text-white font-bold text-lg rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.01] active:scale-98 group"
        >
          <span>{t("startBtn") || "Start Setup"}</span>
          <ArrowRight className="w-5 h-5 text-[#8DBF74] group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="text-[11px] text-center text-gray-500 font-medium">
          Takes only 1 minute • No typing required
        </p>
      </div>
    </div>
  );
}
