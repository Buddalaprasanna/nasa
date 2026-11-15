// speech.js - Audio Voice Assistance & Speech Recognition for Indian Languages

export class SpeechManager {
  constructor(getState, onStatusChange) {
    this.getState = getState;
    this.onStatusChange = onStatusChange || (() => {});
    this.synth = window.speechSynthesis || null;
    this.isSpeaking = false;
    this.isListening = false;
    this.recognition = null;
    this.initRecognition();
  }

  getLangCode() {
    const lang = this.getState().language || 'en';
    switch (lang) {
      case 'kn': return 'kn-IN';
      case 'te': return 'te-IN';
      case 'ta': return 'ta-IN';
      case 'hi': return 'hi-IN';
      default: return 'en-IN';
    }
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.onStatusChange({ type: 'listening', active: true });
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        this.isListening = false;
        this.onStatusChange({ type: 'recognized', transcript });
      };

      this.recognition.onerror = (event) => {
        console.warn('Speech recognition notice:', event.error);
        this.isListening = false;
        this.onStatusChange({ type: 'listening', active: false, error: event.error });
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.onStatusChange({ type: 'listening', active: false });
      };
    }
  }

  speak(text, onComplete) {
    if (!text) return;

    // Cancel any ongoing speech first
    this.stop();

    if (!this.synth) {
      console.warn("SpeechSynthesis not available in this browser environment.");
      if (onComplete) onComplete();
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      const langCode = this.getLangCode();
      utterance.lang = langCode;

      const state = this.getState();
      const rate = state.ttsSpeed === 'slow' ? 0.82 : 0.98;
      utterance.rate = rate;
      utterance.pitch = 1.0;

      // Try to find regional voice if available
      const voices = this.synth.getVoices();
      const matchedVoice = voices.find(v => v.lang.startsWith(langCode) || v.lang.replace('_', '-').startsWith(langCode));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      this.isSpeaking = true;
      this.onStatusChange({ type: 'speaking', active: true, text });

      utterance.onend = () => {
        this.isSpeaking = false;
        this.onStatusChange({ type: 'speaking', active: false });
        if (onComplete) onComplete();
      };

      utterance.onerror = (e) => {
        console.warn("SpeechSynthesis utterance error/interrupted", e);
        this.isSpeaking = false;
        this.onStatusChange({ type: 'speaking', active: false });
        if (onComplete) onComplete();
      };

      this.synth.speak(utterance);
    } catch (err) {
      console.error("Failed to speak utterance:", err);
      this.isSpeaking = false;
      this.onStatusChange({ type: 'speaking', active: false });
      if (onComplete) onComplete();
    }
  }

  stop() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    this.onStatusChange({ type: 'speaking', active: false });
  }

  startListening(onResultCallback) {
    if (!this.recognition) {
      console.warn("Speech recognition not supported in this browser.");
      this.onStatusChange({ 
        type: 'unsupported', 
        message: "Speech recognition not supported in this browser. Please use the quick questions below." 
      });
      return false;
    }

    this.stop(); // Stop any speech playback before listening

    try {
      this.recognition.lang = this.getLangCode();
      if (onResultCallback) {
        this.recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          this.isListening = false;
          this.onStatusChange({ type: 'listening', active: false });
          onResultCallback(transcript);
        };
      }
      this.recognition.start();
      return true;
    } catch (err) {
      console.warn("Recognition already active or blocked:", err);
      return false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      this.onStatusChange({ type: 'listening', active: false });
    }
  }
}
