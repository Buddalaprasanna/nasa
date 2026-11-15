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
    <div className="min-h-screen bg-gradient-to-b from-[#245C3A] via-[#1B462C] to-[#143621] text-white flex flex-col justify-between p-6 max-w-md mx-auto">
      {/* Top spacing */}
      <div className="pt-8"></div>

      {/* Hero Branding */}
      <div className="text-center flex flex-col items-center">
        {/* Animated Icon Emblem */}
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-3xl bg-[#8DBF74] flex items-center justify-center shadow-2xl shadow-emerald-950/60 ring-8 ring-emerald-500/20 transform rotate-3 hover:rotate-0 transition-transform">
            <Sprout className="w-16 h-16 text-[#245C3A]" />
          </div>
          <div className="absolute -top-2 -right-2 bg-amber-400 text-gray-900 rounded-full p-1.5 shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* Name & Tagline */}
        <h1 className="text-4xl font-extrabold tracking-wider mb-2">FIELD SHIFT</h1>
        <div className="h-1 w-16 bg-[#8DBF74] rounded-full mb-3"></div>
        <p className="text-[#8DBF74] font-medium text-base mb-1 tracking-wide">
          {t("tagline") || "Smart farming. Better seasons. Stronger future."}
        </p>
        <p className="text-emerald-200/80 text-xs mt-1 max-w-xs">
          NASA Earth Observation & Regional Crop Rotation for Indian Farmers
        </p>

        {/* Loading Progress Bar */}
        <div className="w-48 bg-emerald-950/70 rounded-full h-2 mt-8 overflow-hidden border border-emerald-500/20">
          <div
            className="bg-[#8DBF74] h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-[11px] text-emerald-300/60 mt-2">
          {progress < 100 ? "Loading satellite climatology..." : "Ready"}
        </p>
      </div>

      {/* Bottom Start Action */}
      <div className="pb-8">
        <button
          onClick={handleContinue}
          className="btn-touch w-full py-4 bg-[#8DBF74] hover:bg-[#7cb062] active:bg-[#6c9f52] text-[#245C3A] font-bold text-lg rounded-2xl shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-3 transition-transform active:scale-98"
        >
          <span>{t("startBtn") || "Get Started"}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
