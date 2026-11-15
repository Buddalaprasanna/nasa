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
    sm: "px-2.5 py-1 text-xs gap-1",
    md: "px-3.5 py-2 text-sm gap-2",
    lg: "px-4 py-2.5 text-base gap-2.5"
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      className={`btn-touch inline-flex items-center justify-center font-medium rounded-full border border-emerald-200 bg-emerald-50 text-[#245C3A] hover:bg-emerald-100 shadow-sm active:scale-95 transition-all ${sizeClasses[size] || sizeClasses.md} ${className}`}
      title={isSpeaking ? "Stop Speaking" : "Listen in Regional Voice"}
      aria-label="Listen button"
    >
      {isSpeaking ? (
        <VolumeX className="w-5 h-5 text-red-600 animate-pulse" />
      ) : (
        <Volume2 className="w-5 h-5 text-[#245C3A]" />
      )}
      {label && <span>{label}</span>}
      {!label && <span className="sr-only">{t("listenBtn")}</span>}
    </button>
  );
}
