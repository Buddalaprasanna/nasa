// state.js - Centralized reactive state management with localStorage persistence

const STORAGE_KEY = "field_shift_state_v1";

const defaultState = {
  language: "en", // Default to English or user choice
  currentScreen: "splash",
  previousScreen: null,
  isSetupComplete: false,
  setupStep: 1, // 1 to 7
  farmer: {
    name: "Ramesh Gowda",
    village: "Mandya, Karnataka",
    landSize: "sizeOpt2", // 1 to 2 Acres
    soilType: "soilRed", // Red Soil
    waterSource: "waterRain", // Rainwater
    previousCrop: "paddy",
    goal: "goalSoil" // Improve soil health & fertility
  },
  activePlanId: "planA",
  savedPlans: ["planA"],
  ttsSpeed: "normal", // 'normal' or 'slow'
  autoSpeak: false,
  remindersEnabled: true,
  selectedCropDetailsId: "ragi",
  voiceChat: [
    {
      sender: "bot",
      text: {
        en: "Hello! I am your Field Shift assistant. Tap the microphone or select a question below to get farming advice.",
        kn: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಫೀಲ್ಡ್ ಶಿಫ್ಟ್ ಸಹಾಯಕ. ಕೃಷಿ ಸಲಹೆ ಪಡೆಯಲು ಕೆಳಗಿನ ಮೈಕ್ ಒತ್ತಿ ಅಥವಾ ಪ್ರಶ್ನೆಯನ್ನು ಆರಿಸಿ.",
        te: "నమస్కారం! నేను మీ ఫీల్డ్ షిఫ్ట్ అసిస్టెంట్. వ్యవసాయ సలహాల కోసం మైక్ నొక్కండి లేదా కింద ఉన్న ప్రశ్నను ఎంచుకోండి.",
        ta: "வணக்கம்! நான் உங்கள் ஃபீல்ட் ஷிப்ட் உதவியாளர். விவசாய ஆலோசனைக்கு மைக் அழுத்தவும் அல்லது கேள்வியை தேர்ந்தெடுக்கவும்.",
        hi: "नमस्ते! मैं आपका फील्ड शिफ्ट सहायक हूँ। खेती की सलाह के लिए माइक दबाएं या नीचे दिए सवाल चुनें।"
      }
    }
  ]
};

export class AppState {
  constructor() {
    this.state = this.loadState();
    this.listeners = [];
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...defaultState, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn("Could not load persisted state", e);
    }
    return { ...defaultState };
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn("Could not persist state to localStorage", e);
    }
  }

  get() {
    return this.state;
  }

  set(updates) {
    this.state = { ...this.state, ...updates };
    this.saveState();
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.state));
  }

  reset() {
    this.state = { ...defaultState, currentScreen: "language" };
    this.saveState();
    this.notify();
  }
}

export const appState = new AppState();
