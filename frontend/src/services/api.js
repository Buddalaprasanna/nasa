
// api.js - Backend REST API service for FIELD SHIFT

const BASE_URL = import.meta.env.VITE_API_URL || "";

async function handleResponse(res) {
  if (!res.ok) {
    const errorText = await res.text();
    let message = `API Error (${res.status})`;

    try {
      const parsed = JSON.parse(errorText);
      message = parsed.detail || message;
    } catch {
      message = errorText || message;
    }

    throw new Error(message);
  }

  if (res.status === 204) {
    return null;
  }

  return res.json();
}

function validateCoordinates(latitude, longitude) {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error(
      "Valid farm GPS coordinates are required to fetch climate data."
    );
  }
}

function requireFarmId(farmId) {
  if (farmId === null || farmId === undefined || farmId === "") {
    throw new Error("Please select a valid farm first.");
  }
}

// Shared JSON POST helper
async function postJson(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return handleResponse(res);
}

export const api = {
  // Health
  getHealth: async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    return handleResponse(res);
  },

  // Crops
  getCrops: async () => {
    const res = await fetch(`${BASE_URL}/api/crops`);
    return handleResponse(res);
  },

  getCropDetails: async (cropId) => {
    const res = await fetch(
      `${BASE_URL}/api/crops/${encodeURIComponent(cropId)}`
    );
    return handleResponse(res);
  },

  // Farmers & Farms
  getFarms: async () => {
    const res = await fetch(`${BASE_URL}/api/farms`);
    return handleResponse(res);
  },

  getFarm: async (farmId) => {
    requireFarmId(farmId);

    const res = await fetch(
      `${BASE_URL}/api/farms/${encodeURIComponent(farmId)}`
    );

    return handleResponse(res);
  },

  createFarm: async (farmData) => {
    return postJson("/api/farms", farmData);
  },

  // GPS coordinates -> village, district and state
  reverseGeocode: async (latitude, longitude) => {
    validateCoordinates(latitude, longitude);

    return postJson("/api/farms/reverse-geocode", {
      latitude,
      longitude,
    });
  },

  // Smart soil identification (ISRIC SoilGrids + ICAR-NBSS&LUP)
  identifySoil: async (latitude, longitude, district = "", state = "") => {
    validateCoordinates(latitude, longitude);

    return postJson("/api/farms/identify-soil", {
      latitude,
      longitude,
      district,
      state,
    });
  },

  // Climate & NASA Earth Observation
  // Coordinates must come from the selected farm, never a fixed default.
  getClimate: async (
    farmId,
    latitude,
    longitude,
    forceRefresh = false
  ) => {
    validateCoordinates(latitude, longitude);

    return postJson("/api/climate", {
      farm_id: farmId ?? null,
      latitude,
      longitude,
      force_refresh: forceRefresh,
    });
  },

  // Crop Recommendations
  getRecommendations: async (params) => {
    if (!params || typeof params !== "object") {
      throw new Error("Farm and crop details are required for recommendations.");
    }

    return postJson("/api/recommendations", params);
  },

  // Crop Rotation
  generateRotation: async (params) => {
    if (!params || typeof params !== "object") {
      throw new Error("Farm details are required to generate crop rotation.");
    }

    return postJson("/api/rotation/generate", params);
  },

  getFarmRotation: async (farmId) => {
    requireFarmId(farmId);

    const res = await fetch(
      `${BASE_URL}/api/rotation/${encodeURIComponent(farmId)}`
    );

    return handleResponse(res);
  },

  saveRotationPlan: async (planData) => {
    if (!planData || typeof planData !== "object") {
      throw new Error("Rotation plan details are required.");
    }

    return postJson("/api/rotation/save", planData);
  },

  // Alerts
  getAlerts: async (farmId) => {
    requireFarmId(farmId);

    const res = await fetch(
      `${BASE_URL}/api/alerts/${encodeURIComponent(farmId)}`
    );

    return handleResponse(res);
  },

  // Voice Assistant
  askVoice: async ({
    question,
    language,
    farm_id,
    farmId,
    village,
    current_crop,
    currentCrop,
  }) => {
    if (!question || !question.trim()) {
      throw new Error("Please enter a question.");
    }

    const payload = {
      question: question.trim(),
      language: language || "en",
      farm_id: farm_id !== undefined ? farm_id : farmId !== undefined ? farmId : null,
      village: village || null,
      current_crop: current_crop || currentCrop || null,
    };

    const res = await postJson("/api/voice/query", payload);

    return {
      ...res,
      response: res.text_answer || res.response || "",
      spoken_response:
        res.spoken_answer || res.spoken_response || res.text_answer || "",
    };
  },

  sendVoiceQuery: async (params) => {
    return api.askVoice(params);
  },
};
export default api;