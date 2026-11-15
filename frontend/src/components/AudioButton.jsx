import React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function AudioButton({ text, label, className = "", size = "md" }) {
  const { speak, stopSpeaking, isSpeaking, t } = useApp();

  const handleClick = (e) => {
    e.stopPropagation();
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(text);
    }
  };

  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs gap-1.5",
    md: "px-3.5 py-2 text-sm gap-2",
    lg: "px-4 py-2.5 text-base gap-2.5"
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      className={`btn-touch relative inline-flex items-center justify-center font-semibold rounded-full border border-emerald-300/80 bg-gradient-to-r from-emerald-50 to-emerald-100/70 text-[#245C3A] hover:bg-emerald-100 hover:border-[#8DBF74] hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all duration-200 ${sizeClasses[size] || sizeClasses.md} ${className}`}
      title={isSpeaking ? "Stop Speaking" : "Listen in Regional Voice"}
      aria-label="Listen button"
    >
      {isSpeaking ? (
        <span className="relative flex items-center justify-center">
          <span className="absolute -inset-1 rounded-full bg-red-400/40 animate-ping"></span>
          <VolumeX className="w-5 h-5 text-red-600 animate-pulse relative z-10" />
        </span>
      ) : (
        <Volume2 className="w-5 h-5 text-[#245C3A] transition-transform group-hover:scale-110" />
      )}
      {label && <span className="tracking-tight">{label}</span>}
      {!label && <span className="sr-only">{t("listenBtn")}</span>}
    </button>
  );
}
