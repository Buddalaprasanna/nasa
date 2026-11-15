import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  User,
  AlertCircle
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { speechService } from "../services/speech";
import { api } from "../services/api";

export default function VoiceAssistantScreen() {
  const { lang, farm, preferences, speak, stopSpeaking, isSpeaking, t } = useApp();

  const greetings = {
    en: {
      sender: "bot",
      text: "Hello! I am your Field Shift voice assistant. Ask me any question about crops, water, or climate for your farm.",
      spoken: "Hello! I am your Field Shift voice assistant. Ask me any question about crops, water, or climate for your farm."
    },
    kn: {
      sender: "bot",
      text: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಫೀಲ್ಡ್ ಶಿಫ್ಟ್ ಧ್ವನಿ ಸಹಾಯಕ. ನಿಮ್ಮ ಜಮೀನಿಗೆ ಸೂಕ್ತ ಬೆಳೆ, ನೀರು ಅಥವಾ ಹವಾಮಾನದ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆ ಕೇಳಿ.",
      spoken: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಫೀಲ್ಡ್ ಶಿಫ್ಟ್ ಧ್ವನಿ ಸಹಾಯಕ. ಬೆಳೆಗಳು, ನೀರು ಅಥವಾ ಹವಾಮಾನದ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆ ಕೇಳಿ."
    },
    te: {
      sender: "bot",
      text: "నమస్కారం! నేను మీ ఫీల్డ్ షిఫ్ట్ వాయిస్ అసిస్టెంట్. మీ పొలానికి తగిన పంటలు, నీరు లేదా వాతావరణం గురించి ఏదైనా ప్రశ్న అడగండి.",
      spoken: "నమస్కారం! నేను మీ ఫీల్డ్ షిఫ్ట్ వాయిస్ అసిస్టెంట్. పంటలు, నీరు లేదా వాతావరణం గురించి ఏదైనా ప్రశ్న అడగండి."
    },
    ta: {
      sender: "bot",
      text: "வணக்கம்! நான் உங்கள் ஃபீல்ட் ஷிப்ட் குரல் உதவியாளர். உங்கள் நிலத்திற்கான பயிர்கள், தண்ணீர் அல்லது வானிலை பற்றி கேளுங்கள்.",
      spoken: "வணக்கம்! நான் உங்கள் ஃபீಲ್ட் ஷிப்ட் குரல் உதவியாளர். பயிர்கள், தண்ணீர் அல்லது வானிலை பற்றி கேளுங்கள்."
    },
    hi: {
      sender: "bot",
      text: "नमस्ते! मैं आपका फील्ड शिफ्ट वॉयस सहायक हूँ। अपने खेत के लिए उपयुक्त फसल, पानी या मौसम के बारे में कोई भी सवाल पूछें।",
      spoken: "नमस्ते! मैं आपका फील्ड शिफ्ट वॉयस सहायक हूँ। फसलों, पानी या मौसम के बारे में कोई भी सवाल पूछें।"
    }
  };

  const [messages, setMessages] = useState(() => {
    return [greetings[lang] || greetings.en];
  });
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Update initial greeting if user switches language before asking questions
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].sender === "bot") {
        return [greetings[lang] || greetings.en];
      }
      return prev;
    });
  }, [lang]);

  // Suggested question chips tailored to current language
  const suggestedChips = {
    kn: [
      "ನನ್ನ ಜಮೀನಿಗೆ ಯಾವ ಬೆಳೆ ಸೂಕ್ತ?",
      "ಈ ಬೆಳೆಗೆ ಎಷ್ಟು ನೀರು ಬೇಕು?",
      "ಮುಂದಿನ ಋತುವಿನಲ್ಲಿ ಏನು ಬೆಳೆಯಬೇಕು?",
      "ಯಾವುದಾದರೂ ಹವಾಮಾನ ಎಚ್ಚರಿಕೆಗಳಿವೆಯೇ?",
      "ಮಣ್ಣಿನ ಫಲವತ್ತತೆ ಹೇಗೆ ಹೆಚ್ಚಿಸುವುದು?"
    ],
    te: [
      "నా పొలానికి ఏ పంట మంచిది?",
      "ఈ పంటకు ఎంత నీరు కావాలి?",
      "వచ్చే సీజన్‌లో ఏ పంట వేయాలి?",
      "వాతావరణ హెచ్చరికలు ఉన్నాయా?",
      "భూసారం ఎలా పెంచాలి?"
    ],
    ta: [
      "என் நிலத்திற்கு எந்த பயிர் ஏற்றது?",
      "இந்த பயிருக்கு எவ்வளவு தண்ணீர் தேவை?",
      "அடுத்த பருவத்தில் என்ன பயிரிடலாம்?",
      "வானிலை எச்சரிக்கைகள் உள்ளதா?",
      "மண் வளத்தை எப்படி கூட்டுவது?"
    ],
    hi: [
      "मेरे खेत के लिए कौन सी फसल ठीक है?",
      "इस फसल को कितना पानी चाहिए?",
      "अगले मौसम में क्या लगाएं?",
      "क्या कोई मौसम की चेतावनी है?",
      "मिट्टी की उर्वरता कैसे सुधारें?"
    ],
    en: [
      "Which crop is suitable for my farm?",
      "How much water does this crop need?",
      "What should I rotate next season?",
      "Are there any climate warnings?",
      "How to improve my soil fertility?"
    ]
  };

  const currentChips = suggestedChips[lang] || suggestedChips.en;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Handle incoming speech transcript or text question
  const handleSend = async (manualText) => {
    const questionText = manualText || inputText;
    if (!questionText || !questionText.trim()) return;

    const userMsg = { sender: "user", text: questionText.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setSpeechError("");
    setLoading(true);

    try {
      const res = await api.askVoice({
        farm_id: farm?.id || null,
        village: farm?.village_name || farm?.district || "",
        district: farm?.district || "",
        latitude: farm?.latitude || null,
        longitude: farm?.longitude || null,
        soil_type: farm?.soil_type || "",
        current_crop: preferences?.current_crop || preferences?.previous_crop || "",
        question: questionText.trim(),
        language: lang || "en"
      });

      const botReply =
        res.text_answer ||
        res.response ||
        (lang === "te"
          ? "క్షమించండి, ఈ ప్రశ్నకు సమాచారం లభించలేదు."
          : lang === "kn"
          ? "ಕ್ಷಮಿಸಿ, ಈ ಪ್ರಶ್ನೆಗೆ ಮಾಹಿತಿ ಸಿಗಲಿಲ್ಲ."
          : lang === "ta"
          ? "மன்னிக்கவும், இந்த கேள்விக்கான தகவல் கிடைக்கவில்லை."
          : lang === "hi"
          ? "क्षमा करें, इस प्रश्न की जानकारी उपलब्ध नहीं है।"
          : "Sorry, no information was found for this question.");

      const spokenReply =
        res.spoken_answer || res.spoken_response || botReply;

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: botReply, spoken: spokenReply }
      ]);

      // Automatically speak out the response in regional voice
      speak(spokenReply);
    } catch (err) {
      console.warn("Voice assistant answer error:", err);
      const fallbackReplies = {
        te: "క్షమించండి, సర్వర్ కనెక్ట్ కాలేదు. దయచేసి మళ్ళీ ప్రయత్నించండి లేదా కిసాన్ కాల్ సెంటర్ 1551 కి కాల్ చేయండి.",
        kn: "ಕ್ಷಮಿಸಿ, ಸಂಪರ್ಕ ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್ 1551 ಗೆ ಕರೆ ಮಾಡಿ.",
        ta: "மன்னிக்கவும், தொடர்பு கொள்ள முடியவில்லை. மீண்டும் முயற்சிக்கவும் அல்லது உழவர் உதவி மையம் 1551 ஐ அழைக்கவும்.",
        hi: "क्षमा करें, संपर्क नहीं हो सका। कृपया पुनः प्रयास करें या किसान कॉल सेंटर 1551 पर कॉल करें।",
        en: "Sorry, I could not connect. Please try again or call Kisan Call Centre 1551."
      };
      const fallbackReply = fallbackReplies[lang] || fallbackReplies.en;

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: fallbackReply, spoken: fallbackReply }
      ]);
      speak(fallbackReply);
    } finally {
      setLoading(false);
    }
  };

  // Toggle voice recording via Web Speech API
  const toggleRecording = () => {
    if (isRecording) {
      speechService.stopListening();
      setIsRecording(false);
    } else {
      setSpeechError("");
      const success = speechService.startListening(
        lang,
        (transcript) => {
          setIsRecording(false);
          handleSend(transcript);
        },
        (err) => {
          setIsRecording(false);
          setSpeechError(err);
        },
        () => {
          setIsRecording(false);
        }
      );

      if (success) {
        setIsRecording(true);
      } else {
        const errorMessages = {
          te: "ఈ బ్రౌజర్‌లో వాయిస్ రికగ్నిషన్ సపోర్ట్ లేదు. దయచేసి క్రింద ఉన్న బాక్స్‌లో టైప్ చేయండి.",
          kn: "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಬೆಂಬಲಿಸುವುದಿಲ್ಲ. ದಯವಿಟ್ಟು ಕೆಳಗಿನ ಬಾಕ್ಸ್‌ನಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ.",
          ta: "இந்த உலாவியில் குரல் அறிதல் ஆதரிக்கப்படவில்லை. கீழே உள்ள பெட்டியில் தட்டச்சு செய்யவும்.",
          hi: "इस ब्राउज़र में वॉयस इनपुट समर्थित नहीं है। कृपया नीचे दिए गए बॉक्स में टाइप करें।",
          en: "Voice input is not supported in this browser. Please use the text input below."
        };
        setSpeechError(errorMessages[lang] || errorMessages.en);
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-transparent pb-24 max-w-md mx-auto flex flex-col justify-between overflow-hidden">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-[#245C3A] to-[#1C4B2E] text-white p-4 rounded-b-2xl shadow-md animate-fade-in relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#8DBF74] to-[#A4D48D] flex items-center justify-center text-[#245C3A] shadow-md ring-2 ring-emerald-400/20">
              <Bot className="w-6 h-6 animate-sway" />
            </div>
            <div>
              <h2 className="font-black text-base leading-tight tracking-wide">Field Shift Assistant</h2>
              <p className="text-xs text-emerald-200 font-medium">
                Speaks Kannada, Telugu, Tamil, Hindi, English
              </p>
            </div>
          </div>
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="p-2 rounded-full bg-red-600 text-white animate-pulse shadow-md hover:bg-red-700 active:scale-95 transition-all"
              title="Stop voice"
              aria-label="Stop speaking"
            >
              <VolumeX className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Conversation Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 relative z-10">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2 animate-slide-up ${
              m.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {m.sender === "bot" && (
              <div className="w-7 h-7 rounded-full bg-[#245C3A] text-white flex items-center justify-center shrink-0 text-xs font-black shadow-sm mt-1">
                FS
              </div>
            )}
            <div
              className={`max-w-[82%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm transition-all duration-200 ${
                m.sender === "user"
                  ? "bg-gradient-to-r from-[#245C3A] to-[#1C4B2E] text-white rounded-br-none shadow-emerald-950/20"
                  : "bg-white text-gray-800 rounded-bl-none border border-gray-200/80 shadow-sm"
              }`}
            >
              <p className="font-medium">{m.text}</p>
              {m.spoken && m.sender === "bot" && (
                <button
                  onClick={() => speak(m.spoken)}
                  className="mt-2 text-[10px] font-bold text-[#245C3A] flex items-center gap-1 hover:underline pt-1.5 border-t border-gray-100 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  {lang === "te"
                    ? "మళ్ళీ వినండి"
                    : lang === "kn"
                    ? "ಮತ್ತೊಮ್ಮೆ ಕೇಳಿ"
                    : lang === "ta"
                    ? "மீண்டும் கேட்க"
                    : lang === "hi"
                    ? "फिर से सुनें"
                    : "Listen again"}
                </button>
              )}
            </div>
            {m.sender === "user" && (
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#245C3A] flex items-center justify-center shrink-0 text-xs font-black shadow-sm mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold italic pl-9 animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-[#245C3A] animate-ping"></span>
            {lang === "te"
              ? "ఫీల్డ్ షిఫ్ట్ అసిస్టెంట్ ఆలోచిస్తున్నారు..."
              : lang === "kn"
              ? "ಫೀಲ್ಡ್ ಶಿಫ್ಟ್ ಸಹಾಯಕ ಯೋಚಿಸುತ್ತಿದ್ದಾರೆ..."
              : lang === "ta"
              ? "ஃபீல்ட் ஷிப்ட் உதவியாளர் சிந்திக்கிறார்..."
              : lang === "hi"
              ? "फील्ड शिफ्ट सहायक सोच रहे हैं..."
              : "Field Shift Assistant is thinking..."}
          </div>
        )}

        {speechError && (
          <div className="p-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs flex items-center gap-2 animate-slide-up font-medium">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{speechError}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Chips with Staggered Entrance & Smooth Scroll */}
      <div className="px-4 py-2 relative z-10 animate-slide-up">
        <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">
          {lang === "te"
            ? "సూచించిన ప్రశ్నలు:"
            : lang === "kn"
            ? "ಸೂಚಿಸಿದ ಪ್ರಶ್ನೆಗಳು:"
            : lang === "ta"
            ? "பரிந்துரைத்த கேள்விகள்:"
            : lang === "hi"
            ? "सुझाए गए प्रश्न:"
            : "Suggested Questions:"}
        </p>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {currentChips.map((chip, cIdx) => (
            <button
              key={cIdx}
              onClick={() => handleSend(chip)}
              className="btn-touch whitespace-nowrap text-xs bg-white text-[#245C3A] font-semibold px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-sm hover:bg-emerald-50 hover:border-[#8DBF74] hover:shadow-md active:scale-95 transition-all duration-200 shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Large Microphone & Input Bar */}
      <div className="p-4 bg-white/95 backdrop-blur-md border-t border-gray-200/80 space-y-3 relative z-10 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
        {/* Large Central Microphone Button with Radar Ripples */}
        <div className="flex justify-center">
          <div className="relative">
            {isRecording && (
              <>
                <span className="absolute -inset-3 rounded-full bg-red-400/30 animate-ping"></span>
                <span className="absolute -inset-6 rounded-full bg-red-300/20 animate-pulse"></span>
              </>
            )}
            <button
              onClick={toggleRecording}
              className={`btn-touch w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 relative z-10 ${
                isRecording
                  ? "bg-red-600 text-white ring-8 ring-red-200 animate-pulse scale-105"
                  : "bg-gradient-to-tr from-[#245C3A] to-[#1C4B2E] text-white hover:from-[#1c4b2e] hover:to-[#163c25] ring-4 ring-emerald-100 hover:scale-105 active:scale-95 shadow-emerald-950/30"
              }`}
              title="Tap to Speak"
              aria-label="Microphone"
            >
              {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8 animate-bounce" />}
            </button>
          </div>
        </div>
        <p className="text-[11px] text-center text-gray-500 font-semibold tracking-wide">
          {isRecording
            ? lang === "te"
              ? "వింటోంది... మీ భాషలో మాట్లాడండి"
              : lang === "kn"
              ? "ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದೆ... ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಮಾತನಾಡಿ"
              : lang === "ta"
              ? "கேட்கிறது... உங்கள் மொழியில் பேசவும்"
              : lang === "hi"
              ? "सुन रहा है... अपनी भाषा में बोलें"
              : "Listening... Speak now in your regional language"
            : lang === "te"
            ? "వాయిస్ ద్వారా అడగడానికి మైక్ నొక్కండి"
            : lang === "kn"
            ? "ಧ್ವನಿ ಮೂಲಕ ಕೇಳಲು ಮೈಕ್ ಒತ್ತಿ"
            : lang === "ta"
            ? "குரல் மூலம் கேட்க மைக் அழுத்தவும்"
            : lang === "hi"
            ? "आवाज से पूछने के लिए माइक दबाएं"
            : "Tap microphone to ask by voice"}
        </p>

        {/* Text Input Fallback Bar */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={
              lang === "te"
                ? "లేదా మీ వ్యవసాయ ప్రశ్నను ఇక్కడ టైప్ చేయండి..."
                : lang === "kn"
                ? "ಅಥವಾ ನಿಮ್ಮ ಕೃಷಿ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ..."
                : lang === "ta"
                ? "அல்லது உங்கள் விவசாய கேள்வியை தட்டச்சு செய்யவும்..."
                : lang === "hi"
                ? "या अपना कृषि संबंधी सवाल यहाँ टाइप करें..."
                : "Or type your farming question..."
            }
            className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#245C3A] focus:border-transparent transition-all shadow-inner"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-[#245C3A] hover:bg-[#1a442a] active:scale-95 text-white disabled:opacity-40 transition-all shadow-md"
            title="Send"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
