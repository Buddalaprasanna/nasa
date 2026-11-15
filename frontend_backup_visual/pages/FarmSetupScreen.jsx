
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Navigation,
  Sparkles,
  Droplets,
  Sprout,
  ShieldAlert,
  Coins,
  Clock,
  MapPin,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import AudioButton from "../components/AudioButton";
import api from "../services/api";

const REGIONS = [
  { district: "Mandya", state: "Karnataka" },
  { district: "Mysuru", state: "Karnataka" },
  { district: "Tumakuru", state: "Karnataka" },
  { district: "Kolar", state: "Karnataka" },
  { district: "Chikkaballapur", state: "Karnataka" },
  { district: "Dharmapuri", state: "Tamil Nadu" },
  { district: "Anantapur", state: "Andhra Pradesh" },
];

export default function FarmSetupScreen() {
  const navigate = useNavigate();
  const { farm, preferences, updateFarmProfile, t } = useApp();

  const [step, setStep] = useState(1);
  const totalSteps = 6;

  const [farmerName, setFarmerName] = useState(farm.farmer_name || "");
  const [villageName, setVillageName] = useState(farm.village_name || "");
  const [district, setDistrict] = useState(farm.district || "");
  const [stateName, setStateName] = useState(farm.state || "");

  const [latitude, setLatitude] = useState(
    farm.latitude != null ? Number(farm.latitude) : null
  );
  const [longitude, setLongitude] = useState(
    farm.longitude != null ? Number(farm.longitude) : null
  );

  const [gpsStatus, setGpsStatus] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [locationConfirmed, setLocationConfirmed] = useState(
    Boolean(farm.latitude != null && farm.longitude != null)
  );

  const [landSize, setLandSize] = useState(farm.land_size_category || "");
  const [soilType, setSoilType] = useState(farm.soil_type || "");
  const [irrigationType, setIrrigationType] = useState(
    farm.irrigation_type || ""
  );
  const [previousCrop, setPreviousCrop] = useState(
    preferences.previous_crop || ""
  );
  const [primaryGoal, setPrimaryGoal] = useState(
    preferences.primary_goal || ""
  );
  const [saving, setSaving] = useState(false);

  const hasCoordinates =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;

  // Capture GPS coordinates and resolve the address through the backend.
  const handleGpsLocate = () => {
    if (!navigator.geolocation) {
      setGpsStatus(
        "Location detection is not supported by this browser. Please use a supported browser or device."
      );
      return;
    }

    if (!window.isSecureContext) {
      setGpsStatus(
        "GPS requires a secure connection (HTTPS) or localhost."
      );
      return;
    }

    setIsLocating(true);
    setLocationConfirmed(false);
    setGpsAccuracy(null);
    setGpsStatus("Requesting your farm location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        setLatitude(lat);
        setLongitude(lon);
        setGpsAccuracy(
          Number.isFinite(accuracy) && accuracy >= 0 ? accuracy : null
        );
        setGpsStatus(
          "Coordinates found. Identifying your village, district and state..."
        );

        try {
          const result = await api.reverseGeocode(lat, lon);

          const detectedVillage =
            typeof result?.village === "string"
              ? result.village.trim()
              : "";
          const detectedDistrict =
            typeof result?.district === "string"
              ? result.district.trim()
              : "";
          const detectedState =
            typeof result?.state === "string"
              ? result.state.trim()
              : "";

          setVillageName(detectedVillage);
          setDistrict(detectedDistrict);
          setStateName(detectedState);

          if (!detectedDistrict || !detectedState) {
            setGpsStatus(
              "GPS coordinates were captured, but the district or state could not be identified. Please enter the missing details and review them."
            );
            return;
          }

          setGpsStatus(
            "Location detected. Please review the village, district and state, then confirm."
          );
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          setVillageName("");
          setDistrict("");
          setStateName("");
          setGpsStatus(
            error?.message ||
              "GPS coordinates were captured, but the address lookup is unavailable. Please try again or enter the location details manually."
          );
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.warn("GPS error:", error);
        setIsLocating(false);

        if (error.code === error.PERMISSION_DENIED) {
          setGpsStatus(
            "Location permission was denied. Allow location access in your browser settings or try again."
          );
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setGpsStatus(
            "Your device could not determine its location. Try again outdoors."
          );
        } else {
          setGpsStatus("Location detection timed out. Please try again.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 60000,
      }
    );
  };

  const handleManualRegion = (value) => {
    const selected = REGIONS.find(
      (region) => `${region.district}, ${region.state}` === value
    );

    if (!selected) return;

    setDistrict(selected.district);
    setStateName(selected.state);
    setVillageName(selected.district);

    // A district is not an exact farm GPS location.
    setLatitude(null);
    setLongitude(null);
    setLocationConfirmed(false);

    setGpsStatus(
      "District selected. Detect your farm's GPS location before saving so satellite data uses the correct coordinates."
    );
  };

  const handleConfirmLocation = () => {
    if (!hasCoordinates) {
      setGpsStatus("Valid GPS coordinates are required.");
      return;
    }

    if (!district.trim() || !stateName.trim()) {
      setGpsStatus("Please enter both district and state.");
      return;
    }

    setLocationConfirmed(true);
    setGpsStatus("Farm location confirmed.");
  };

  const handleFinish = async () => {
    if (!hasCoordinates) {
      setStep(1);
      setGpsStatus(
        "Please detect your farm's GPS location before completing setup."
      );
      return;
    }

    if (!locationConfirmed) {
      setStep(1);
      setGpsStatus(
        "Please review and confirm your detected farm location first."
      );
      return;
    }

    if (!district.trim() || !stateName.trim()) {
      setStep(1);
      setGpsStatus("District and state are required.");
      return;
    }

    if (
      !landSize ||
      !soilType ||
      !irrigationType ||
      !previousCrop ||
      !primaryGoal
    ) {
      window.alert("Please complete all farm questions before continuing.");
      return;
    }

    const farmData = {
      village_name: villageName.trim() || district.trim(),
      district: district.trim(),
      state: stateName.trim(),
      latitude,
      longitude,
      land_size_category: landSize,
      soil_type: soilType,
      irrigation_type: irrigationType,
      farmer_name: farmerName.trim(),
    };

    const prefData = {
      primary_goal: primaryGoal,
      previous_crop: previousCrop,
      current_crop: previousCrop,
    };

    try {
      setSaving(true);
      await updateFarmProfile(farmData, prefData);
      localStorage.setItem("field_shift_setup_done", "true");
      navigate("/dashboard");
    } catch (error) {
      console.error("Farm setup save failed:", error);
      window.alert(
        "We could not save your farm details. Please check your connection and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {t("q2Title") || "Where is your farm located?"}
                </h3>
                <p className="text-xs text-gray-600">
                  {t("q2Sub") || "Used to identify your farm's location"}
                </p>
              </div>
              <AudioButton
                text={`${t("q2Title") || "Where is your farm located?"}.`}
              />
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t("q1Title") || "What is your name?"}{" "}
                <span className="font-normal text-gray-400">
                  ({t("q1Sub") || "Optional"})
                </span>
              </label>
              <input
                type="text"
                value={farmerName}
                onChange={(event) => setFarmerName(event.target.value)}
                placeholder={t("q1Placeholder") || "Enter your name"}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#245C3A] text-sm"
              />
            </div>

            <button
              type="button"
              onClick={handleGpsLocate}
              disabled={isLocating}
              className="btn-touch w-full p-4 rounded-2xl bg-emerald-100/70 hover:bg-emerald-100 border-2 border-dashed border-[#245C3A] text-[#245C3A] font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Navigation className="w-5 h-5" />
              <span>
                {isLocating
                  ? "Detecting location..."
                  : t("gpsLocateBtn") || "Detect My Farm Location (GPS)"}
              </span>
            </button>

            {gpsStatus && (
              <p className="text-xs text-center font-medium text-emerald-800 bg-emerald-50 py-2 px-3 rounded-lg border border-emerald-200">
                {gpsStatus}
              </p>
            )}

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#245C3A]" />
                <h4 className="text-sm font-bold text-gray-800">
                  Detected farm location
                </h4>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Village / locality
                </label>
                <input
                  value={villageName}
                  onChange={(event) => {
                    setVillageName(event.target.value);
                    setLocationConfirmed(false);
                  }}
                  placeholder="Enter village or locality"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  District
                </label>
                <input
                  value={district}
                  onChange={(event) => {
                    setDistrict(event.target.value);
                    setLocationConfirmed(false);
                  }}
                  placeholder="Detected district"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  State
                </label>
                <input
                  value={stateName}
                  onChange={(event) => {
                    setStateName(event.target.value);
                    setLocationConfirmed(false);
                  }}
                  placeholder="Detected state"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm"
                />
              </div>

              {hasCoordinates && (
                <p className="text-xs text-gray-500">
                  {gpsAccuracy != null
                    ? `Device-reported GPS accuracy: approximately ${Math.round(gpsAccuracy)} metres.`
                    : "GPS coordinates captured successfully."}
                </p>
              )}

              <button
                type="button"
                onClick={handleConfirmLocation}
                disabled={
                  !hasCoordinates ||
                  !district.trim() ||
                  !stateName.trim()
                }
                className="w-full py-3 rounded-xl bg-[#245C3A] text-white font-bold text-sm disabled:opacity-40"
              >
                {locationConfirmed
                  ? "Location confirmed ✓"
                  : "Confirm this location"}
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Or select a district manually
              </label>
              <select
                value={
                  district && stateName
                    ? `${district}, ${stateName}`
                    : ""
                }
                onChange={(event) =>
                  handleManualRegion(event.target.value)
                }
                className="w-full px-3 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 font-medium text-sm"
              >
                <option value="">Select a district</option>
                {REGIONS.map((region) => (
                  <option
                    key={`${region.district}-${region.state}`}
                    value={`${region.district}, ${region.state}`}
                  >
                    {region.district}, {region.state}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Manual district selection does not provide exact farm
                coordinates. GPS is still required for satellite-based data.
              </p>
            </div>

            <p className="text-[10px] text-gray-500 text-center">
              Address lookup provided by OpenStreetMap contributors.
            </p>
          </div>
        );

      case 2: {
        const sizeOptions = [
          { id: "less_than_1", label: t("sizeOpt1") || "Less than 1 Acre", desc: t("sizeOpt1Desc") || "Small marginal holding", icon: "🌱" },
          { id: "1_to_2_acres", label: t("sizeOpt2") || "1 to 2 Acres", desc: t("sizeOpt2Desc") || "Small family farm", icon: "🌾" },
          { id: "2_to_5_acres", label: t("sizeOpt3") || "2 to 5 Acres", desc: t("sizeOpt3Desc") || "Medium farm holding", icon: "🚜" },
          { id: "more_than_5", label: t("sizeOpt4") || "More than 5 Acres", desc: t("sizeOpt4Desc") || "Large agricultural land", icon: "🏡" },
        ];

        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {t("q3Title") || "What is your farm land size?"}
                </h3>
                <p className="text-xs text-gray-600">
                  {t("q3Sub") || "Choose the closest option"}
                </p>
              </div>
              <AudioButton
                text={`${t("q3Title") || "What is your farm land size?"}.`}
              />
            </div>

            {sizeOptions.map((opt) => (
              <button
                type="button"
                key={opt.id}
                onClick={() => setLandSize(opt.id)}
                className={`btn-touch w-full text-left p-4 rounded-2xl border-2 flex items-center justify-between ${
                  landSize === opt.id
                    ? "bg-emerald-50 border-[#245C3A] ring-2 ring-[#8DBF74]/50 shadow-md"
                    : "bg-white border-gray-200 hover:border-emerald-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{opt.icon}</span>
                  <div>
                    <h4 className="font-bold text-base text-gray-900">
                      {opt.label}
                    </h4>
                    <p className="text-xs text-gray-500">{opt.desc}</p>
                  </div>
                </div>
                {landSize === opt.id && (
                  <CheckCircle2 className="w-6 h-6 text-[#245C3A]" />
                )}
              </button>
            ))}
          </div>
        );
      }

      case 3: {
        const soilOptions = [
          { id: "red", label: t("soilRed") || "Red Soil", desc: t("soilRedDesc") || "Porous soil, often used for millets and groundnut", color: "bg-amber-100 text-amber-900 border-amber-300" },
          { id: "black", label: t("soilBlack") || "Black Soil (Regur)", desc: t("soilBlackDesc") || "Clay-rich soil with high moisture retention", color: "bg-stone-200 text-stone-900 border-stone-400" },
          { id: "sandy", label: t("soilSandy") || "Sandy Soil", desc: "Drains quickly", color: "bg-yellow-100 text-yellow-900 border-yellow-300" },
          { id: "other", label: t("soilOther") || "Mixed / Clay Soil", desc: "Other or mixed soil type", color: "bg-emerald-100 text-emerald-900 border-emerald-300" },
          { id: "dont_know", label: t("soilDontKnow") || "Don't Know", desc: "Soil type not confirmed", color: "bg-gray-100 text-gray-900 border-gray-300" },
        ];

        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {t("q4Title") || "What is your farm soil type?"}
                </h3>
                <p className="text-xs text-gray-600">
                  {t("q4Sub") || "Helps describe soil characteristics"}
                </p>
              </div>
              <AudioButton
                text={`${t("q4Title") || "What is your farm soil type?"}.`}
              />
            </div>

            {soilOptions.map((opt) => (
              <button
                type="button"
                key={opt.id}
                onClick={() => setSoilType(opt.id)}
                className={`btn-touch w-full text-left p-4 rounded-2xl border-2 flex items-center justify-between ${
                  soilType === opt.id
                    ? "bg-emerald-50 border-[#245C3A] ring-2 ring-[#8DBF74]/50 shadow-md"
                    : "bg-white border-gray-200 hover:border-emerald-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs ${opt.color}`}>
                    ●
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-gray-900">
                      {opt.label}
                    </h4>
                    <p className="text-xs text-gray-500">{opt.desc}</p>
                  </div>
                </div>
                {soilType === opt.id && (
                  <CheckCircle2 className="w-6 h-6 text-[#245C3A]" />
                )}
              </button>
            ))}
          </div>
        );
      }

      case 4: {
        const waterOptions = [
          { id: "rainwater", label: t("waterRain") || "Only Rainwater", desc: t("waterRainDesc") || "Rain-dependent farming", icon: "🌧️" },
          { id: "borewell", label: t("waterBorewell") || "Borewell / Tube Well", desc: t("waterBorewellDesc") || "Groundwater source", icon: "🚰" },
          { id: "canal", label: t("waterCanal") || "Canal / River Water", desc: t("waterCanalDesc") || "Surface water source", icon: "🌊" },
          { id: "drip", label: t("waterDrip") || "Drip / Sprinkler System", desc: t("waterDripDesc") || "Micro-irrigation system", icon: "💧" },
          { id: "other", label: t("waterOther") || "Farm Pond / Other", desc: t("waterOtherDesc") || "Pond, tank or other source", icon: "🏞️" },
        ];

        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {t("q5Title") || "What water source do you have?"}
                </h3>
                <p className="text-xs text-gray-600">
                  {t("q5Sub") || "Select your main irrigation source"}
                </p>
              </div>
              <AudioButton
                text={`${t("q5Title") || "What water source do you have?"}.`}
              />
            </div>

            {waterOptions.map((opt) => (
              <button
                type="button"
                key={opt.id}
                onClick={() => setIrrigationType(opt.id)}
                className={`btn-touch w-full text-left p-4 rounded-2xl border-2 flex items-center justify-between ${
                  irrigationType === opt.id
                    ? "bg-emerald-50 border-[#245C3A] ring-2 ring-[#8DBF74]/50 shadow-md"
                    : "bg-white border-gray-200 hover:border-emerald-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{opt.icon}</span>
                  <div>
                    <h4 className="font-bold text-base text-gray-900">
                      {opt.label}
                    </h4>
                    <p className="text-xs text-gray-500">{opt.desc}</p>
                  </div>
                </div>
                {irrigationType === opt.id && (
                  <CheckCircle2 className="w-6 h-6 text-[#245C3A]" />
                )}
              </button>
            ))}
          </div>
        );
      }

      case 5: {
        const cropOptions = [
          { id: "paddy", label: t("cropPaddy") || "Paddy (Rice)", desc: "Cereal crop", icon: "🌾" },
          { id: "ragi", label: t("cropRagi") || "Finger Millet (Ragi)", desc: "Millet crop", icon: "🥣" },
          { id: "maize", label: t("cropMaize") || "Maize (Corn)", desc: "Cereal crop", icon: "🌽" },
          { id: "redgram", label: t("cropRedgram") || "Red Gram / Pigeon Pea", desc: "Pulse crop", icon: "🌱" },
          { id: "groundnut", label: t("cropGroundnut") || "Groundnut / Peanut", desc: "Oilseed legume", icon: "🥜" },
          { id: "other", label: t("cropNone") || "Other / New Land", desc: "Other crop or fallow land", icon: "🌿" },
        ];

        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {t("q6Title") || "What crop did you grow previously?"}
                </h3>
                <p className="text-xs text-gray-600">
                  {t("q6Sub") || "Helps assess crop rotation"}
                </p>
              </div>
              <AudioButton
                text={`${t("q6Title") || "What crop did you grow previously?"}.`}
              />
            </div>

            {cropOptions.map((opt) => (
              <button
                type="button"
                key={opt.id}
                onClick={() => setPreviousCrop(opt.id)}
                className={`btn-touch w-full text-left p-3.5 rounded-2xl border-2 flex items-center justify-between ${
                  previousCrop === opt.id
                    ? "bg-emerald-50 border-[#245C3A] ring-2 ring-[#8DBF74]/50 shadow-md"
                    : "bg-white border-gray-200 hover:border-emerald-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{opt.icon}</span>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">
                      {opt.label}
                    </h4>
                    <p className="text-[11px] text-gray-500">{opt.desc}</p>
                  </div>
                </div>
                {previousCrop === opt.id && (
                  <CheckCircle2 className="w-5 h-5 text-[#245C3A]" />
                )}
              </button>
            ))}
          </div>
        );
      }

      case 6: {
        const goalOptions = [
          { id: "improve_soil_health", label: t("goalSoil") || "Improve Soil Health", desc: t("goalSoilDesc") || "Improve soil condition", icon: Sprout, color: "text-emerald-700 bg-emerald-100" },
          { id: "save_water", label: t("goalWater") || "Save Water", desc: t("goalWaterDesc") || "Reduce irrigation demand", icon: Droplets, color: "text-blue-700 bg-blue-100" },
          { id: "reduce_costs", label: t("goalCost") || "Reduce Farming Costs", desc: t("goalCostDesc") || "Manage input costs", icon: Coins, color: "text-amber-700 bg-amber-100" },
          { id: "short_duration", label: t("goalDuration") || "Short Duration Crops", desc: t("goalDurationDesc") || "Consider shorter crop cycles", icon: Clock, color: "text-purple-700 bg-purple-100" },
          { id: "reduce_climate_risks", label: t("goalRisk") || "Reduce Climate Risks", desc: t("goalRiskDesc") || "Consider climate-related risks", icon: ShieldAlert, color: "text-rose-700 bg-rose-100" },
        ];

        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {t("q7Title") || "What is your main farming goal?"}
                </h3>
                <p className="text-xs text-gray-600">
                  {t("q7Sub") || "Choose your main priority"}
                </p>
              </div>
              <AudioButton
                text={`${t("q7Title") || "What is your main farming goal?"}.`}
              />
            </div>

            {goalOptions.map((opt) => {
              const Icon = opt.icon;

              return (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setPrimaryGoal(opt.id)}
                  className={`btn-touch w-full text-left p-3.5 rounded-2xl border-2 flex items-center justify-between ${
                    primaryGoal === opt.id
                      ? "bg-emerald-50 border-[#245C3A] ring-2 ring-[#8DBF74]/50 shadow-md"
                      : "bg-white border-gray-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${opt.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">
                        {opt.label}
                      </h4>
                      <p className="text-[11px] text-gray-500">{opt.desc}</p>
                    </div>
                  </div>
                  {primaryGoal === opt.id && (
                    <CheckCircle2 className="w-5 h-5 text-[#245C3A]" />
                  )}
                </button>
              );
            })}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F0] flex flex-col justify-between p-4 max-w-md mx-auto">
      <div>
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={() =>
              step > 1 ? setStep(step - 1) : navigate("/welcome")
            }
            className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-200"
            aria-label="Back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <span className="text-xs font-bold text-[#245C3A]">
            {t("step") || "Step"} {step} {t("of") || "of"} {totalSteps}
          </span>

          <div className="w-8" />
        </div>

        <div className="w-full bg-gray-200 h-2 rounded-full mb-4 overflow-hidden">
          <div
            className="bg-[#245C3A] h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {renderStepContent()}
      </div>

      <div className="pt-6 pb-2">
        {step < totalSteps ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="btn-touch w-full py-4 bg-[#245C3A] hover:bg-[#1a442a] active:bg-[#133520] text-white font-bold text-lg rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <span>{t("nextBtn") || "Next"}</span>
            <ChevronRight className="w-5 h-5 text-[#8DBF74]" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            disabled={saving}
            className="btn-touch w-full py-4 bg-[#245C3A] hover:bg-[#1a442a] active:bg-[#133520] text-white font-bold text-lg rounded-2xl shadow-xl flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-60"
          >
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>
              {saving
                ? "Saving..."
                : t("finishBtn") || "Go to Dashboard"}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
