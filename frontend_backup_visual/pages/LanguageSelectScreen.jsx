import React from "react";
import { useNavigate } from "react-router-dom";
import { Check, Volume2, ArrowRight } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function LanguageSelectScreen() {
  const navigate = useNavigate();
  const { lang, setLang, speak, t } = useApp();

  const languages = [
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
      speechGreeting: "ஃபீல்ட் ஷிப்ட்-க்கு நல்வரவு. தமிழ் மொழி தேர்வு செய்யப்பட்டுள்ளது."
    },
    {
      code: "hi",
      name: "हिन्दी",
      subtext: "Hindi",
      speechGreeting: "फील्ड शिफ्ट में आपका स्वागत है। हिन्दी भाषा चुनी गई है।"
    },
    {
      code: "en",
      name: "English",
      subtext: "English",
      speechGreeting: "Welcome to Field Shift. English language selected."
    }
  ];

  const handleSelect = (code, speechText) => {
    setLang(code);
    speak(speechText);
  };

  const handleContinue = () => {
    navigate("/welcome");
  };

  return (
    <div className="min-h-screen bg-[#F8F8F0] flex flex-col justify-between p-6 max-w-md mx-auto">
      <div>
        {/* Header */}
        <div className="text-center mt-4 mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-[#245C3A] bg-emerald-100 px-3 py-1 rounded-full">
            Step 1 / 2
          </span>
          <h2 className="text-2xl font-black text-gray-900 mt-3">
            Choose Your Language
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ / अपनी भाषा चुनें
          </p>
        </div>

        {/* 5 Big Language Cards */}
        <div className="space-y-3">
          {languages.map((item) => {
            const isSelected = lang === item.code;
            return (
              <div
                key={item.code}
                onClick={() => handleSelect(item.code, item.speechGreeting)}
                className={`btn-touch p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? "bg-emerald-50 border-[#245C3A] shadow-md ring-2 ring-[#8DBF74]/50"
                    : "bg-white border-gray-200 hover:border-emerald-300 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                      isSelected
                        ? "bg-[#245C3A] border-[#245C3A] text-white"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
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
                  className="p-2 rounded-full text-[#245C3A] bg-emerald-100/70 hover:bg-emerald-200 active:scale-95 transition-all"
                  title="Listen pronunciation"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Continue Button */}
      <div className="pt-6 pb-4">
        <button
          onClick={handleContinue}
          className="btn-touch w-full py-4 bg-[#245C3A] hover:bg-[#1c4b2e] active:bg-[#163c25] text-white font-bold text-lg rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-transform active:scale-98"
        >
          <span>{t("continueBtn") || "Continue"}</span>
          <ArrowRight className="w-5 h-5 text-[#8DBF74]" />
        </button>
      </div>
    </div>
  );
}
