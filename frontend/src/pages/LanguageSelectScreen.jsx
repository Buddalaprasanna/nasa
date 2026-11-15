import React from "react";
import { useNavigate } from "react-router-dom";
import { Check, Volume2, ArrowRight, Languages } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function LanguageSelectScreen() {
  const navigate = useNavigate();
  const { lang, setLang, speak, t } = useApp();

  const languages = [
    {
      code: "en",
      name: "English",
      subtext: "English (Default)",
      speechGreeting: "Welcome to Field Shift. English language selected."
    },
    {
      code: "kn",
      name: "ಕನ್ನಡ",
      subtext: "Kannada",
      speechGreeting: "ಫೀಲ್ಡ್ ಶಿಫ್ಟ್‌ಗೆ ಸ್ವಾಗತ. ಕನ್ನಡ ಭಾಷೆ ಆಯ್ಕೆಯಾಗಿದೆ."
    },
    {
      code: "te",
      name: "తెలుగు",
      subtext: "Telugu",
      speechGreeting: "ఫీల్డ్ షిఫ్ట్‌కి స్వాగతం. తెలుగు భాష ఎంపిక చేయబడింది."
    },
    {
      code: "ta",
      name: "தமிழ்",
      subtext: "Tamil",
      speechGreeting: "ஃபீಲ್ட் ஷಿப்ட்-க்கு நல்வரவு. தமிழ் மொழி தேர்வு செய்யப்பட்டுள்ளது."
    },
    {
      code: "hi",
      name: "हिन्दी",
      subtext: "Hindi",
      speechGreeting: "फील्ड शिफ्ट में आपका स्वागत है। हिन्दी भाषा चुनी गई है।"
    }
  ];

  const handleSelect = (code, speechText) => {
    setLang(code);
    speak(speechText);
  };

  const handleContinue = () => {
    // Ensure current language (defaults to "en") is explicitly saved if user just taps Continue
    if (!localStorage.getItem("field_shift_lang")) {
      setLang(lang || "en");
    }
    navigate("/welcome");
  };

  return (
    <div className="relative min-h-screen bg-transparent flex flex-col justify-between p-6 max-w-md mx-auto overflow-hidden">
      <div className="relative z-10">
        {/* Header with gentle slide-down entrance */}
        <div className="text-center mt-3 mb-6 animate-slide-up">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#245C3A] bg-emerald-100/90 px-3.5 py-1 rounded-full border border-emerald-300/40 shadow-sm backdrop-blur-sm">
            <Languages className="w-3.5 h-3.5 text-[#245C3A]" />
            Step 1 / 2
          </span>
          <h2 className="text-2xl font-black text-gray-900 mt-2.5 tracking-tight">
            Choose Your Language
          </h2>
          <p className="text-xs text-gray-600 mt-1 font-medium">
            Select your preferred language / ಭಾಷೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ
          </p>
        </div>

        {/* 5 Big Language Cards with Staggered Entrance */}
        <div className="space-y-3">
          {languages.map((item, index) => {
            const isSelected = (lang || "en") === item.code;
            const staggerClasses = [
              "stagger-1",
              "stagger-2",
              "stagger-3",
              "stagger-4",
              "stagger-5"
            ];
            return (
              <div
                key={item.code}
                onClick={() => handleSelect(item.code, item.speechGreeting)}
                className={`btn-touch p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex items-center justify-between animate-slide-up backdrop-blur-sm ${
                  staggerClasses[index] || ""
                } ${
                  isSelected
                    ? "bg-gradient-to-r from-emerald-50/95 to-white/95 border-[#245C3A] shadow-md ring-2 ring-[#8DBF74]/50 scale-[1.01]"
                    : "bg-white/90 border-gray-200/80 hover:border-emerald-300 hover:bg-emerald-50/30 hover:scale-[1.008] shadow-sm"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isSelected
                        ? "bg-[#245C3A] border-[#245C3A] text-white scale-110 shadow-sm"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] animate-scale-in" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      {item.subtext}
                    </p>
                  </div>
                </div>

                {/* Speaker button on each card */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(item.code, item.speechGreeting);
                  }}
                  className="p-2.5 rounded-full text-[#245C3A] bg-emerald-100/80 hover:bg-emerald-200 active:scale-95 transition-all duration-200 shadow-sm"
                  title="Listen pronunciation"
                  aria-label={`Listen ${item.name} pronunciation`}
                >
                  <Volume2 className="w-4 h-4 hover:scale-110 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Continue Button */}
      <div className="pt-6 pb-4 relative z-10 animate-slide-up">
        <button
          onClick={handleContinue}
          className="btn-touch w-full py-4 bg-gradient-to-r from-[#245C3A] to-[#1C4B2E] hover:from-[#1c4b2e] hover:to-[#163c25] active:from-[#163c25] active:to-[#122e1d] text-white font-bold text-lg rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.01] active:scale-98 group"
        >
          <span>{t("continueBtn") || "Continue"}</span>
          <ArrowRight className="w-5 h-5 text-[#8DBF74] group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
