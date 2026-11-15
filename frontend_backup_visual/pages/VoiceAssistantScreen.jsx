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

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಫೀಲ್ಡ್ ಶಿಫ್ಟ್ ಧ್ವನಿ ಸಹಾಯಕ. ನಿಮ್ಮ ಜಮೀನಿಗೆ ಸೂಕ್ತ ಬೆಳೆ, ನೀರು ಅಥವಾ ಹವಾಮಾನದ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆ ಕೇಳಿ.",
      spoken: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಫೀಲ್ಡ್ ಶಿಫ್ಟ್ ಧ್ವನಿ ಸಹಾಯಕ. ಬೆಳೆಗಳು, ನೀರು ಅಥವಾ ಹವಾಮಾನದ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆ ಕೇಳಿ."
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

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
      "मिट्टी की उर्वरता कैसे बढ़ाएं?"
    ],
    en: [
      "Which crop is suitable for my farm?",
      "How much water does this crop need?",
      "What should I grow next season?",
      "Are there any climate warnings?",
      "How to improve soil health?"
    ]
  };

  const currentChips = suggestedChips[lang] || suggestedChips.en;

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle Query Submission
  const handleSend = async (queryText) => {
    const textToSend = (queryText || inputText).trim();
    if (!textToSend) return;

    // Add user message
    const newMessages = [...messages, { sender: "user", text: textToSend }];
    setMessages(newMessages);
    setInputText("");
    setSpeechError("");
    setLoading(true);

    try {
      const response = await api.sendVoiceQuery(
        textToSend,
        lang,
        farm.id,
        farm.village_name,
        preferences.current_crop
      );

      const botReply = {
        sender: "bot",
        text: response.text_answer,
        spoken: response.spoken_answer,
        chip: response.suggested_action_chip
      };

      setMessages((prev) => [...prev, botReply]);

      // Automatically speak the response
      speak(response.spoken_answer);
    } catch (err) {
      console.warn("Voice query failed:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "I am having difficulty connecting to the agroclimatology engine. Finger Millet and Red Gram are typically suitable for local red soil.",
          spoken: "Finger Millet and Red Gram are suitable for your farm."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Microphone Recording
  const toggleRecording = () => {
    if (isRecording) {
      speechService.stopListening();
      setIsRecording(false);
    } else {
      setSpeechError("");
      const started = speechService.startListening(
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

      if (started) {
        setIsRecording(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F0] pb-24 max-w-md mx-auto flex flex-col justify-between">
      {/* Top Header */}
      <div className="bg-[#245C3A] text-white p-4 rounded-b-2xl shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#8DBF74] flex items-center justify-center text-[#245C3A]">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-base leading-tight">Field Shift Assistant</h2>
              <p className="text-xs text-emerald-200">
                Speaks Kannada, Telugu, Tamil, Hindi, English
              </p>
            </div>
          </div>
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="p-2 rounded-full bg-red-600 text-white animate-pulse"
              title="Stop voice"
            >
              <VolumeX className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Conversation Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2 ${
              m.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {m.sender === "bot" && (
              <div className="w-7 h-7 rounded-full bg-[#245C3A] text-white flex items-center justify-center shrink-0 text-xs font-bold mt-1">
                FS
              </div>
            )}
            <div
              className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                m.sender === "user"
                  ? "bg-[#245C3A] text-white rounded-br-none"
                  : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
              }`}
            >
              <p>{m.text}</p>
              {m.spoken && m.sender === "bot" && (
                <button
                  onClick={() => speak(m.spoken)}
                  className="mt-2 text-[10px] font-bold text-[#245C3A] flex items-center gap-1 hover:underline pt-1 border-t border-gray-100"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  Listen again
                </button>
              )}
            </div>
            {m.sender === "user" && (
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#245C3A] flex items-center justify-center shrink-0 text-xs font-bold mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-gray-500 italic pl-9">
            <span className="w-2 h-2 rounded-full bg-[#245C3A] animate-ping"></span>
            Field Shift Assistant is thinking...
          </div>
        )}

        {speechError && (
          <div className="p-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{speechError}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Chips */}
      <div className="px-4 py-2">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
          Suggested Questions:
        </p>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {currentChips.map((chip, cIdx) => (
            <button
              key={cIdx}
              onClick={() => handleSend(chip)}
              className="btn-touch whitespace-nowrap text-xs bg-white text-[#245C3A] font-semibold px-3 py-1.5 rounded-full border border-emerald-200 shadow-sm hover:bg-emerald-50 active:scale-95 shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Large Microphone & Input Bar */}
      <div className="p-4 bg-white border-t border-gray-200 space-y-3">
        {/* Large Central Microphone Button */}
        <div className="flex justify-center">
          <button
            onClick={toggleRecording}
            className={`btn-touch w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 ${
              isRecording
                ? "bg-red-600 text-white ring-8 ring-red-200 animate-pulse"
                : "bg-[#245C3A] text-white hover:bg-[#1a442a] ring-4 ring-emerald-100"
            }`}
            title="Tap to Speak"
            aria-label="Microphone"
          >
            {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>
        </div>
        <p className="text-[11px] text-center text-gray-500 font-medium">
          {isRecording ? "Listening... Speak now" : "Tap microphone to ask by voice"}
        </p>

        {/* Text Input Fallback Bar */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Or type your farming question..."
            className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#245C3A]"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-[#245C3A] text-white disabled:opacity-40 hover:bg-[#1a442a] active:scale-95"
            title="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
