
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import { translations } from "../translations";
import { speechService } from "../services/speech";
import { api } from "../services/api";

const AppContext = createContext(null);

function readLocalJSON(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

const EMPTY_FARM = {
  id: null,
  farmer_name: "",
  village_name: "",
  district: "",
  state: "",
  latitude: null,
  longitude: null,
  land_size_category: "",
  soil_type: "",
  irrigation_type: "",
};

const EMPTY_PREFERENCES = {
  primary_goal: "",
  previous_crop: "",
  current_crop: "",
};

export function AppProvider({ children }) {
  // 1. Language - Default to English ("en") on first launch / when logged out,
  // or retrieve user's saved preference while logged in.
  const [lang, setLangState] = useState(() => {
    const isSetupDone =
      localStorage.getItem("field_shift_setup_done") === "true";
    if (!isSetupDone) {
      return "en";
    }
    return localStorage.getItem("field_shift_lang") || "en";
  });

  const setLang = (newLang) => {
    const validLang = newLang || "en";
    setLangState(validLang);
    localStorage.setItem("field_shift_lang", validLang);
  };

  const logout = () => {
    speechService.stopSpeaking();
    setIsSpeaking(false);
    setLangState("en");
    localStorage.removeItem("field_shift_lang");
    localStorage.removeItem("field_shift_setup_done");
  };

  const t = (key) => {
    if (!key) return "";
    const langDict = translations[lang] || {};
    if (langDict[key] !== undefined && langDict[key] !== "") {
      return langDict[key];
    }

    const fallbackDict = translations.en || {};
    if (fallbackDict[key] !== undefined && fallbackDict[key] !== "") {
      return fallbackDict[key];
    }

    return "";
  };

  // 2. Farm profile
  // No example farm, default coordinates, or invented farmer details.
  const [farm, setFarm] = useState(() =>
    readLocalJSON("field_shift_farm", EMPTY_FARM)
  );

  const [preferences, setPreferences] = useState(() =>
    readLocalJSON("field_shift_pref", EMPTY_PREFERENCES)
  );

  // 3. Active plan
  const [activePlan, setActivePlanState] = useState(() =>
    readLocalJSON("field_shift_active_plan", null)
  );

  const setActivePlan = (plan) => {
    setActivePlanState(plan);

    if (plan == null) {
      localStorage.removeItem("field_shift_active_plan");
    } else {
      localStorage.setItem(
        "field_shift_active_plan",
        JSON.stringify(plan)
      );
    }
  };

  // 4. Audio / speech
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioRate, setAudioRate] = useState(0.88);

  const speak = (text) => {
    if (!text) return;

    setIsSpeaking(true);

    speechService.speak(text, lang, audioRate, () => {
      setIsSpeaking(false);
    });
  };

  const stopSpeaking = () => {
    speechService.stopSpeaking();
    setIsSpeaking(false);
  };

  // 5. Save farm profile
  // A failed backend request must remain a failure.
  // Do not silently pretend that the farm was saved.
  const updateFarmProfile = async (farmData, prefData) => {
    if (
      !Number.isFinite(Number(farmData.latitude)) ||
      !Number.isFinite(Number(farmData.longitude)) ||
      Number(farmData.latitude) < -90 ||
      Number(farmData.latitude) > 90 ||
      Number(farmData.longitude) < -180 ||
      Number(farmData.longitude) > 180
    ) {
      throw new Error("Please provide valid farm GPS coordinates.");
    }

    if (
      !farmData.district?.trim() ||
      !farmData.state?.trim() ||
      !farmData.land_size_category ||
      !farmData.soil_type ||
      !farmData.irrigation_type
    ) {
      throw new Error("Please complete the required farm details.");
    }

    const payload = {
      ...farmData,
      ...prefData,
      latitude: Number(farmData.latitude),
      longitude: Number(farmData.longitude),
    };

    // Wait for the backend to confirm the save.
    const savedFarm = await api.createFarm(payload);

    if (!savedFarm || savedFarm.id == null) {
      throw new Error("The server did not confirm the farm profile save.");
    }

    const updatedFarm = {
      ...EMPTY_FARM,
      ...farmData,
      ...savedFarm,
      id: savedFarm.id,
      latitude:
        savedFarm.latitude != null
          ? Number(savedFarm.latitude)
          : Number(farmData.latitude),
      longitude:
        savedFarm.longitude != null
          ? Number(savedFarm.longitude)
          : Number(farmData.longitude),
    };

    const updatedPreferences = {
      ...EMPTY_PREFERENCES,
      ...prefData,
    };

    setFarm(updatedFarm);
    setPreferences(updatedPreferences);

    localStorage.setItem(
      "field_shift_farm",
      JSON.stringify(updatedFarm)
    );

    localStorage.setItem(
      "field_shift_pref",
      JSON.stringify(updatedPreferences)
    );

    return savedFarm;
  };

  // 6. Load the latest saved farm from the backend.
  useEffect(() => {
    let cancelled = false;

    const loadFarmProfile = async () => {
      try {
        const farms = await api.getFarms();

        if (cancelled || !Array.isArray(farms) || farms.length === 0) {
          return;
        }

        // The backend list endpoint returns newest farms first.
        const latest = farms[0];

        const backendFarm = {
          ...EMPTY_FARM,
          ...latest,
          id: latest.id,
          latitude:
            latest.latitude != null
              ? Number(latest.latitude)
              : null,
          longitude:
            latest.longitude != null
              ? Number(latest.longitude)
              : null,
        };

        if (cancelled) return;

        setFarm(backendFarm);

        localStorage.setItem(
          "field_shift_farm",
          JSON.stringify(backendFarm)
        );
      } catch (error) {
        // Keep the locally stored profile, but do not invent
        // coordinates or claim that the backend was updated.
        console.warn("Could not load farms from the backend:", error);
      }
    };

    loadFarmProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        logout,
        t,

        farm,
        setFarm,

        preferences,
        setPreferences,

        updateFarmProfile,

        activePlan,
        setActivePlan,

        speak,
        stopSpeaking,
        isSpeaking,
        audioRate,
        setAudioRate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used inside an AppProvider.");
  }

  return context;
}
