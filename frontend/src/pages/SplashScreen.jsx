import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sprout, Sparkles, ArrowRight } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function SplashScreen() {
  const navigate = useNavigate();
  const { t } = useApp();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 15;
      });
    }, 200);

    return () => clearInterval(timer);
  }, []);

  const handleContinue = () => {
    // Check if farmer has already completed setup
    const saved = localStorage.getItem("field_shift_setup_done");
    if (saved) {
      navigate("/dashboard");
    } else {
      navigate("/language");
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#245C3A]/80 via-[#1B462C]/80 to-[#143621]/85 backdrop-blur-[1px] text-white flex flex-col justify-between p-6 max-w-md mx-auto overflow-hidden">
      {/* Top spacing */}
      <div className="pt-8 relative z-10"></div>

      {/* Hero Branding */}
      <div className="text-center flex flex-col items-center relative z-10 animate-fade-in">
        {/* Animated Icon Emblem with floating physics */}
        <div className="relative mb-6 animate-float">
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-[#8DBF74] to-[#A4D48D] flex items-center justify-center shadow-2xl shadow-emerald-950/80 ring-8 ring-emerald-500/20 transform rotate-3 hover:rotate-0 transition-all duration-300">
            <Sprout className="w-16 h-16 text-[#245C3A] animate-sway" />
          </div>
          <div className="absolute -top-2 -right-2 bg-amber-400 text-gray-900 rounded-full p-2 shadow-lg animate-bounce">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* Name & Tagline */}
        <h1 className="text-4xl font-black tracking-wider mb-2 text-white drop-shadow-sm">
          FIELD SHIFT
        </h1>
        <div className="h-1 w-16 bg-[#8DBF74] rounded-full mb-3 shadow-sm"></div>
        <p className="text-[#8DBF74] font-semibold text-base mb-1 tracking-wide">
          {t("tagline") || "Smart farming. Better seasons. Stronger future."}
        </p>
        <p className="text-emerald-100/80 text-xs mt-1 max-w-xs font-medium leading-relaxed">
          NASA Earth Observation & Regional Crop Rotation for Indian Farmers
        </p>

        {/* Loading Progress Bar */}
        <div className="w-52 bg-emerald-950/80 rounded-full h-2.5 mt-8 overflow-hidden border border-emerald-500/30 p-0.5 shadow-inner">
          <div
            className="bg-gradient-to-r from-[#8DBF74] to-[#A4D48D] h-full rounded-full transition-all duration-300 shadow-sm"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-[11px] text-emerald-300/80 mt-2 font-medium">
          {progress < 100 ? "Loading satellite climatology..." : "Ready"}
        </p>
      </div>

      {/* Bottom Start Action */}
      <div className="pb-8 relative z-10 animate-slide-up">
        <button
          onClick={handleContinue}
          className="btn-touch w-full py-4 bg-gradient-to-r from-[#8DBF74] to-[#A4D48D] hover:from-[#7cb062] hover:to-[#93c37c] active:from-[#6c9f52] active:to-[#82b26b] text-[#245C3A] font-black text-lg rounded-2xl shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.02] active:scale-98 group"
        >
          <span>{t("startBtn") || "Get Started"}</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
