import React, { useState, useEffect } from "react";
import { Mic, MicOff, X, Check, Volume2 } from "lucide-react";
import { speechService } from "../services/speech";
import { useApp } from "../context/AppContext";

export default function VoiceTextInput({
  value = "",
  onChange,
  placeholder,
  label,
  helperText,
  className = "",
  autoFocus = false,
}) {
  const { lang, t } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(speechService.isSpeechRecognitionSupported());
  }, []);

  const handleStartListening = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setErrorMessage("");

    if (!speechService.isSpeechRecognitionSupported()) {
      setErrorMessage(
        t("voiceNotSupported") ||
          "Voice input is not supported in this browser. Please type."
      );
      return;
    }

    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    const started = speechService.startListening(
      lang,
      (transcript) => {
        setIsListening(false);
        if (transcript) {
          onChange(transcript);
        }
      },
      (err) => {
        setIsListening(false);
        setErrorMessage(
          err ||
            t("voiceError") ||
            "Could not hear clearly. Please try again or type."
        );
      },
      () => {
        setIsListening(false);
      }
    );

    if (!started) {
      setIsListening(false);
    }
  };

  const handleClear = (e) => {
    e?.preventDefault?.();
    onChange("");
    setErrorMessage("");
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-gray-700">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (errorMessage) setErrorMessage("");
          }}
          placeholder={
            placeholder ||
            t("enterCustomAnswer") ||
            "Enter your answer"
          }
          autoFocus={autoFocus}
          className={`w-full pl-3.5 pr-20 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
            isListening
              ? "border-red-400 ring-2 ring-red-200 bg-red-50/40"
              : value
              ? "border-[#245C3A] bg-white ring-1 ring-emerald-100"
              : "border-gray-300 bg-white hover:border-gray-400 focus:border-[#245C3A] focus:ring-2 focus:ring-emerald-200"
          }`}
        />

        <div className="absolute right-2 flex items-center gap-1">
          {value ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              title="Clear"
              aria-label="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}

          <button
            type="button"
            onClick={handleStartListening}
            className={`p-2 rounded-xl transition-all flex items-center justify-center ${
              isListening
                ? "bg-red-500 text-white shadow-md animate-pulse ring-2 ring-red-300"
                : "bg-emerald-100 text-[#245C3A] hover:bg-emerald-200 hover:scale-105 active:scale-95"
            }`}
            title={
              isListening
                ? t("listening") || "Listening... Tap to stop"
                : t("pressToSpeak") || "Tap to speak in your language"
            }
            aria-label="Microphone voice input"
          >
            {isListening ? (
              <span className="relative flex items-center justify-center">
                <span className="absolute -inset-1 rounded-full bg-red-400 animate-ping opacity-75"></span>
                <Mic className="w-4 h-4 relative z-10" />
              </span>
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Listening Waveform Indicator */}
      {isListening && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-lg border border-red-200 text-xs font-semibold text-red-700 animate-fade-in">
          <div className="flex items-center gap-0.5">
            <span className="w-1 h-3 bg-red-600 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-5 bg-red-600 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-4 bg-red-600 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
            <span className="w-1 h-2 bg-red-600 rounded-full animate-pulse" style={{ animationDelay: '450ms' }} />
          </div>
          <span>{t("listening") || "Listening... Speak your answer now"}</span>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg">
          {errorMessage}
        </p>
      )}

      {/* Helper text */}
      {!isListening && !errorMessage && helperText && (
        <p className="text-[11px] text-gray-500 pl-1">{helperText}</p>
      )}
    </div>
  );
}
