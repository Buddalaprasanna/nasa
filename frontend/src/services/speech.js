// speech.js - Browser Web Speech API service with graceful fallback
// Provides SpeechSynthesis (reading out guidance) & SpeechRecognition (voice questions)

const LANG_MAP = {
  kn: "kn-IN",
  te: "te-IN",
  ta: "ta-IN",
  hi: "hi-IN",
  en: "en-IN"
};

export class SpeechService {
  constructor() {
    this.synth = typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null;
    this.currentUtterance = null;
    this.recognition = null;
    this.isSpeaking = false;
    this.isListening = false;
    this.initRecognition();
  }

  initRecognition() {
    if (typeof window === "undefined") return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;
    }
  }

  isSpeechSynthesisSupported() {
    return !!this.synth;
  }

  isSpeechRecognitionSupported() {
    return !!this.recognition;
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }

  speak(text, lang = "kn", rate = 0.9, onEnd = null) {
    if (!this.synth || !text) {
      if (onEnd) onEnd();
      return false;
    }

    try {
      this.stopSpeaking();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = LANG_MAP[lang] || "en-IN";
      utterance.rate = rate; // slightly slower for rural clarity
      utterance.pitch = 1.0;

      // Select matching regional voice if available
      const voices = this.synth.getVoices();
      const targetLang = LANG_MAP[lang] || "en-IN";
      const voice = voices.find(v => v.lang === targetLang || v.lang.startsWith(lang));
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };

      utterance.onerror = (err) => {
        console.warn("Speech synthesis error or interrupted:", err);
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
      return true;
    } catch (e) {
      console.warn("Speech synthesis failed:", e);
      this.isSpeaking = false;
      if (onEnd) onEnd();
      return false;
    }
  }

  startListening(lang = "kn", onResult, onError, onEnd) {
    if (!this.recognition) {
      if (onError) onError("Browser does not support speech recognition. Please use text input or Chrome/Edge.");
      return false;
    }

    try {
      this.recognition.lang = LANG_MAP[lang] || "en-IN";

      this.recognition.onstart = () => {
        this.isListening = true;
      };

      this.recognition.onresult = (event) => {
        this.isListening = false;
        if (event.results && event.results[0] && event.results[0][0]) {
          const transcript = event.results[0][0].transcript;
          if (onResult) onResult(transcript);
        }
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        console.warn("Speech recognition error:", event.error);
        if (onError) {
          if (event.error === "not-allowed") {
            onError("Microphone access was denied. Please allow microphone permissions in your browser.");
          } else if (event.error === "no-speech") {
            onError("No voice detected. Please try tapping the microphone and speaking clearly.");
          } else {
            onError(`Voice error (${event.error}). You can also type your question.`);
          }
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (onEnd) onEnd();
      };

      this.recognition.start();
      return true;
    } catch (e) {
      this.isListening = false;
      if (onError) onError("Failed to start microphone: " + e.message);
      return false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}

export const speechService = new SpeechService();
