import React from "react";
import { useNavigate } from "react-router-dom";
import { Sprout, Sun, CloudRain, ShieldCheck, ArrowRight } from "lucide-react";
import { useApp } from "../context/AppContext";
import AudioButton from "../components/AudioButton";

export default function WelcomeScreen() {
  const navigate = useNavigate();
  const { t } = useApp();

  const welcomeText = `${t("welcomeTitle") || "Welcome to Field Shift!"} ${t("welcomeSubtitle") || "Let's find the right crops for your farm."}`;

  return (
    <div className="min-h-screen bg-[#F8F8F0] flex flex-col justify-between p-6 max-w-md mx-auto">
      {/* Top Header with Listen Button */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs font-bold text-[#245C3A] tracking-wider uppercase bg-emerald-100 px-3 py-1 rounded-full">
          FIELD SHIFT
        </span>
        <AudioButton text={welcomeText} label={t("listenBtn") || "Listen"} />
      </div>

      {/* Main Illustration and Welcome Copy */}
      <div className="text-center my-auto py-6">
        {/* Visual Agricultural Vignette */}
        <div className="relative w-44 h-44 mx-auto mb-6">
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-emerald-200 via-emerald-100 to-amber-100 flex items-center justify-center shadow-lg border-4 border-white">
            <Sprout className="w-24 h-24 text-[#245C3A]" />
          </div>
          {/* Floating Badges */}
          <div className="absolute top-2 left-0 bg-amber-400 text-gray-900 rounded-full p-2.5 shadow-md animate-bounce">
            <Sun className="w-5 h-5" />
          </div>
          <div className="absolute bottom-2 right-1 bg-blue-500 text-white rounded-full p-2.5 shadow-md">
            <CloudRain className="w-5 h-5" />
          </div>
        </div>

        {/* Headings */}
        <h1 className="text-2xl font-black text-gray-900 leading-tight mb-2">
          {t("welcomeTitle") || "Welcome to Field Shift!"}
        </h1>
        <p className="text-base text-gray-700 font-medium max-w-xs mx-auto leading-relaxed">
          {t("welcomeSubtitle") || "Let's find the right crops for your farm."}
        </p>

        {/* Feature Pillars */}
        <div className="grid grid-cols-3 gap-2 mt-8 text-left">
          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-xl">🛰️</span>
            <h4 className="text-xs font-bold text-gray-900 mt-1">NASA Data</h4>
            <p className="text-[10px] text-gray-500">Local climate trends</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-xl">🌾</span>
            <h4 className="text-xs font-bold text-gray-900 mt-1">Right Crops</h4>
            <p className="text-[10px] text-gray-500">Save water & costs</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-xl">🔄</span>
            <h4 className="text-xs font-bold text-gray-900 mt-1">Rotation</h4>
            <p className="text-[10px] text-gray-500">Rebuild soil health</p>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="pb-4 space-y-3">
        <button
          onClick={() => navigate("/setup")}
          className="btn-touch w-full py-4 bg-[#245C3A] hover:bg-[#1b482c] active:bg-[#153a23] text-white font-bold text-lg rounded-2xl shadow-xl flex items-center justify-center gap-3 active:scale-98 transition-all"
        >
          <span>{t("startBtn") || "Start Setup"}</span>
          <ArrowRight className="w-5 h-5 text-[#8DBF74]" />
        </button>

        <p className="text-[11px] text-center text-gray-500">
          Takes only 1 minute • No typing required
        </p>
      </div>
    </div>
  );
}
