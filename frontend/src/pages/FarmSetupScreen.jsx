
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
  Plus,
  X,
  ImagePlus,
} from "lucide-react";

import { useApp } from "../context/AppContext";
import AudioButton from "../components/AudioButton";
import api from "../services/api";

// SOIL PHOTOGRAPHS
import redSoil from "../assets/soils/red.jpg";
import blackSoil from "../assets/soils/black.jpg";
import sandySoil from "../assets/soils/sandy.jpg";
import claySoil from "../assets/soils/clay.jpg";

const REGIONS = [
  { district: "Mandya", state: "Karnataka" },
  { district: "Mysuru", state: "Karnataka" },
  { district: "Tumakuru", state: "Karnataka" },
  { district: "Kolar", state: "Karnataka" },
  { district: "Chikkaballapur", state: "Karnataka" },
  { district: "Dharmapuri", state: "Tamil Nadu" },
  { district: "Anantapur", state: "Andhra Pradesh" },
];

const SOIL_OPTIONS = [
  {
    id: "red",
    label: "Red Soil",
    desc: "Suitable for millets and groundnut",
    image: redSoil,
  },
  {
    id: "black",
    label: "Black Soil (Regur)",
    desc: "Retains moisture for longer periods",
    image: blackSoil,
  },
  {
    id: "sandy",
    label: "Sandy Soil",
    desc: "Loose soil with quick drainage",
    image: sandySoil,
  },
  {
    id: "other",
    label: "Mixed / Clay Soil",
    desc: "Clay-rich or mixed soil texture",
    image: claySoil,
  },
  {
    id: "dont_know",
    label: "Don't Know",
    desc: "I am not sure about my soil type",
    image: null,
  },
];

const CUSTOM_SOIL_KEY = "field_shift_custom_soils";

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
  const [locationConfirmed, setLocationConfirmed] = useState(
    farm.latitude != null && farm.longitude != null
  );

  const [landSize, setLandSize] = useState(
    farm.land_size_category || ""
  );
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

  // CUSTOM SOIL STATE
  const [customSoils, setCustomSoils] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem(CUSTOM_SOIL_KEY) || "[]"
      );
    } catch {
      return [];
    }
  });

  const [showAddSoil, setShowAddSoil] = useState(false);
  const [customSoilName, setCustomSoilName] = useState("");
  const [customSoilDescription, setCustomSoilDescription] = useState("");
  const [customSoilImage, setCustomSoilImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const hasCoordinates =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;

  // GPS LOCATION
  const handleGpsLocate = () => {
    if (!navigator.geolocation) {
      setGpsStatus("GPS is not supported by this browser.");
      return;
    }

if (
  !window.isSecureContext &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
) {
  setGpsStatus("Please open the application using HTTPS or localhost.");
  return;
}   
console.log("GPS DEBUG:", {
  secure: window.isSecureContext,
  gps: navigator.geolocation,
  url: window.location.href
});
    setIsLocating(true);
    setLocationConfirmed(false);
    setGpsStatus("Detecting your farm location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        setLatitude(lat);
        setLongitude(lon);

        try {
          const result = await api.reverseGeocode(lat, lon);

          setVillageName(result?.village || "");
          setDistrict(result?.district || "");
          setStateName(result?.state || "");

          setGpsStatus(
            "Location detected. Review and confirm your details."
          );
        } catch (error) {
          setGpsStatus(
            "GPS captured, but address lookup failed. Enter your details manually."
          );
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        setGpsStatus(
          error.code === 1
            ? "Please allow location permission."
            : "Unable to detect location. Try again."
        );
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
      (r) => `${r.district}, ${r.state}` === value
    );

    if (!selected) return;

    setDistrict(selected.district);
    setStateName(selected.state);
    setVillageName(selected.district);

    setLatitude(null);
    setLongitude(null);
    setLocationConfirmed(false);

    setGpsStatus(
      "District selected. GPS detection is still required."
    );
  };

  const confirmLocation = () => {
    if (!hasCoordinates || !district.trim() || !stateName.trim()) {
      setGpsStatus("Please provide valid GPS, district and state.");
      return;
    }

    setLocationConfirmed(true);
    setGpsStatus("Farm location confirmed!");
  };

  // SAVE CUSTOM SOIL IMAGE
  const handleSoilImage = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Please choose an image smaller than 2 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setCustomSoilImage(reader.result);
      setImagePreview(reader.result);
    };

    reader.readAsDataURL(file);
  };

  // ADD CUSTOM SOIL
  const addCustomSoil = () => {
    if (!customSoilName.trim()) {
      alert("Please enter a soil name.");
      return;
    }

    const newSoil = {
      id: `custom_${Date.now()}`,
      label: customSoilName.trim(),
      desc: customSoilDescription.trim() || "Custom farm soil type",
      image: customSoilImage || null,
    };

    const updatedSoils = [...customSoils, newSoil];

    try {
      localStorage.setItem(
        CUSTOM_SOIL_KEY,
        JSON.stringify(updatedSoils)
      );

      setCustomSoils(updatedSoils);
      setSoilType(newSoil.id);

      setCustomSoilName("");
      setCustomSoilDescription("");
      setCustomSoilImage("");
      setImagePreview("");
      setShowAddSoil(false);
    } catch (error) {
      alert("Image storage is full. Please use a smaller image.");
    }
  };

  // FINISH FARM SETUP
  const handleFinish = async () => {
    if (!hasCoordinates || !locationConfirmed) {
      setStep(1);
      setGpsStatus("Please detect and confirm your farm location.");
      return;
    }

    if (
      !landSize ||
      !soilType ||
      !irrigationType ||
      !previousCrop ||
      !primaryGoal
    ) {
      alert("Please complete all farm questions.");
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
      console.error(error);
      alert("Could not save farm details. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // REUSABLE OPTION CARD
  const OptionCard = ({
    selected,
    onClick,
    icon,
    label,
    desc,
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-full p-4 rounded-2xl border-2 text-left flex items-center justify-between transition-all ${
        selected
          ? "bg-emerald-50 border-[#245C3A] ring-2 ring-[#8DBF74]/40"
          : "bg-white border-gray-200 hover:border-emerald-400"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <h4 className="font-bold text-gray-900">{label}</h4>
          <p className="text-xs text-gray-500">{desc}</p>
        </div>
      </div>

      {selected && (
        <CheckCircle2 className="w-6 h-6 text-[#245C3A]" />
      )}
    </button>
  );

  // SOIL PHOTO CARD
  const SoilCard = ({ soil }) => (
    <button
      type="button"
      onClick={() => setSoilType(soil.id)}
      className={`relative overflow-hidden rounded-2xl border-2 text-left bg-white transition-all ${
        soilType === soil.id
          ? "border-[#245C3A] ring-2 ring-[#8DBF74]/50 shadow-lg"
          : "border-gray-200 hover:border-emerald-400"
      }`}
    >
      <div className="relative h-36 bg-gray-100">
        {soil.image ? (
          <img
            src={soil.image}
            alt={soil.label}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
            <span className="text-5xl">❓</span>
            <span className="text-xs text-gray-500 mt-2">
              Not sure
            </span>
          </div>
        )}

        {soilType === soil.id && (
          <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
            <CheckCircle2 className="w-6 h-6 text-[#245C3A]" />
          </div>
        )}
      </div>

      <div className="p-3">
        <h4 className="font-bold text-gray-900 text-sm">
          {soil.label}
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          {soil.desc}
        </p>
      </div>
    </button>
  );

  const renderStepContent = () => {
    switch (step) {
      // STEP 1: LOCATION
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">
                  Where is your farm located?
                </h3>
                <p className="text-xs text-gray-500">
                  Detect your farm location using GPS.
                </p>
              </div>
              <AudioButton text="Where is your farm located?" />
            </div>

            <input
              value={farmerName}
              onChange={(e) => setFarmerName(e.target.value)}
              placeholder="Farmer name (optional)"
              className="w-full p-3 rounded-xl border"
            />

            <button
              type="button"
              onClick={handleGpsLocate}
              disabled={isLocating}
              className="w-full p-4 rounded-xl bg-emerald-100 text-[#245C3A] font-bold flex items-center justify-center gap-2"
            >
              <Navigation />
              {isLocating ? "Detecting..." : "Detect My Farm Location"}
            </button>

            {gpsStatus && (
              <p className="text-xs bg-emerald-50 text-emerald-800 p-3 rounded-lg">
                {gpsStatus}
              </p>
            )}

            <div className="bg-white p-4 rounded-2xl border space-y-3">
              <h4 className="font-bold flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Farm Location
              </h4>

              <input
                value={villageName}
                onChange={(e) => {
                  setVillageName(e.target.value);
                  setLocationConfirmed(false);
                }}
                placeholder="Village / locality"
                className="w-full p-3 border rounded-xl"
              />

              <input
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  setLocationConfirmed(false);
                }}
                placeholder="District"
                className="w-full p-3 border rounded-xl"
              />

              <input
                value={stateName}
                onChange={(e) => {
                  setStateName(e.target.value);
                  setLocationConfirmed(false);
                }}
                placeholder="State"
                className="w-full p-3 border rounded-xl"
              />

              <button
                type="button"
                onClick={confirmLocation}
                disabled={!hasCoordinates}
                className="w-full p-3 rounded-xl bg-[#245C3A] text-white font-bold disabled:opacity-40"
              >
                {locationConfirmed ? "Location Confirmed ✓" : "Confirm Location"}
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl border">
              <label className="text-sm font-bold">
                Select district manually
              </label>

              <select
                value={
                  district && stateName
                    ? `${district}, ${stateName}`
                    : ""
                }
                onChange={(e) => handleManualRegion(e.target.value)}
                className="w-full p-3 mt-2 border rounded-xl"
              >
                <option value="">Select District</option>
                {REGIONS.map((r) => (
                  <option key={r.district} value={`${r.district}, ${r.state}`}>
                    {r.district}, {r.state}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      // STEP 2: LAND SIZE
      case 2:
        return (
          <div className="space-y-3">
            <h3 className="text-xl font-bold">
              What is your farm land size?
            </h3>

            {[
              ["less_than_1", "Less than 1 Acre", "🌱"],
              ["1_to_2_acres", "1 to 2 Acres", "🌾"],
              ["2_to_5_acres", "2 to 5 Acres", "🚜"],
              ["more_than_5", "More than 5 Acres", "🏡"],
            ].map(([id, label, icon]) => (
              <OptionCard
                key={id}
                selected={landSize === id}
                onClick={() => setLandSize(id)}
                icon={icon}
                label={label}
                desc="Select your approximate farm size"
              />
            ))}
          </div>
        );

      // STEP 3: SOIL PHOTO SELECTION
      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  What is your farm soil type?
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Select the soil by looking at its photograph.
                </p>
              </div>

              <AudioButton text="What is your farm soil type?" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {SOIL_OPTIONS.map((soil) => (
                <SoilCard key={soil.id} soil={soil} />
              ))}

              {customSoils.map((soil) => (
                <SoilCard key={soil.id} soil={soil} />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowAddSoil(true)}
              className="w-full min-h-16 rounded-2xl border-2 border-dashed border-[#245C3A] bg-emerald-50 text-[#245C3A] font-bold flex items-center justify-center gap-3 hover:bg-emerald-100"
            >
              <span className="rounded-full bg-[#245C3A] text-white p-2">
                <Plus className="w-6 h-6" />
              </span>
              <span>Add Your Own Soil Type</span>
            </button>

            <p className="text-xs text-center text-gray-500">
              You can upload a photograph of your farm soil and add
              your own soil category.
            </p>

            {showAddSoil && (
              <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">
                      Add New Soil
                    </h3>

                    <button
                      type="button"
                      onClick={() => setShowAddSoil(false)}
                      className="p-2 rounded-full bg-gray-100"
                    >
                      <X />
                    </button>
                  </div>

                  <label className="text-sm font-semibold">
                    Soil Name
                  </label>

                  <input
                    value={customSoilName}
                    onChange={(e) => setCustomSoilName(e.target.value)}
                    placeholder="Example: Laterite Soil"
                    className="w-full p-3 border rounded-xl mt-2 mb-4"
                  />

                  <label className="text-sm font-semibold">
                    Soil Description
                  </label>

                  <textarea
                    value={customSoilDescription}
                    onChange={(e) => setCustomSoilDescription(e.target.value)}
                    placeholder="Describe your soil..."
                    className="w-full p-3 border rounded-xl mt-2 mb-4"
                    rows={3}
                  />

                  <label className="text-sm font-semibold">
                    Upload Soil Photograph
                  </label>

                  <label className="mt-2 border-2 border-dashed border-emerald-500 bg-emerald-50 rounded-2xl min-h-40 flex flex-col items-center justify-center cursor-pointer overflow-hidden">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Soil preview"
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <>
                        <ImagePlus className="w-10 h-10 text-[#245C3A]" />
                        <span className="text-sm font-semibold text-[#245C3A] mt-2">
                          Choose Soil Image
                        </span>
                        <span className="text-xs text-gray-500">
                          JPG, PNG (maximum 2 MB)
                        </span>
                      </>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSoilImage}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={addCustomSoil}
                    className="w-full mt-5 p-4 bg-[#245C3A] text-white font-bold rounded-xl"
                  >
                    Add Soil to Selection
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      // STEP 4: IRRIGATION
      case 4:
        return (
          <div className="space-y-3">
            <h3 className="text-xl font-bold">
              What water source do you have?
            </h3>

            {[
              ["rainwater", "Only Rainwater", "🌧️"],
              ["borewell", "Borewell / Tube Well", "🚰"],
              ["canal", "Canal / River Water", "🌊"],
              ["drip", "Drip / Sprinkler", "💧"],
              ["other", "Farm Pond / Other", "🏞️"],
            ].map(([id, label, icon]) => (
              <OptionCard
                key={id}
                selected={irrigationType === id}
                onClick={() => setIrrigationType(id)}
                icon={icon}
                label={label}
                desc="Choose your main irrigation source"
              />
            ))}
          </div>
        );

      // STEP 5: PREVIOUS CROP
      case 5:
        return (
          <div className="space-y-3">
            <h3 className="text-xl font-bold">
              What crop did you grow previously?
            </h3>

            {[
              ["paddy", "Paddy (Rice)", "🌾"],
              ["ragi", "Finger Millet (Ragi)", "🥣"],
              ["maize", "Maize (Corn)", "🌽"],
              ["redgram", "Red Gram", "🌱"],
              ["groundnut", "Groundnut", "🥜"],
              ["other", "Other / New Land", "🌿"],
            ].map(([id, label, icon]) => (
              <OptionCard
                key={id}
                selected={previousCrop === id}
                onClick={() => setPreviousCrop(id)}
                icon={icon}
                label={label}
                desc="Previous crop history"
              />
            ))}
          </div>
        );

      // STEP 6: FARMER GOAL
      case 6:
        return (
          <div className="space-y-3">
            <h3 className="text-xl font-bold">
              What is your main farming goal?
            </h3>

            {[
              ["improve_soil_health", "Improve Soil Health", Sprout, "🌱"],
              ["save_water", "Save Water", Droplets, "💧"],
              ["reduce_costs", "Reduce Farming Costs", Coins, "💰"],
              ["short_duration", "Short Duration Crops", Clock, "⏱️"],
              ["reduce_climate_risks", "Reduce Climate Risks", ShieldAlert, "🛡️"],
            ].map(([id, label, Icon, emoji]) => (
              <button
                type="button"
                key={id}
                onClick={() => setPrimaryGoal(id)}
                className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between ${
                  primaryGoal === id
                    ? "bg-emerald-50 border-[#245C3A]"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <Icon className="w-6 h-6 text-[#245C3A]" />
                  </div>
                  <span className="font-bold text-sm">{label}</span>
                </div>

                {primaryGoal === id && (
                  <CheckCircle2 className="text-[#245C3A]" />
                )}
              </button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F0] flex flex-col justify-between p-4 max-w-md mx-auto">
      <div>
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() =>
              step > 1 ? setStep(step - 1) : navigate("/welcome")
            }
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <span className="font-bold text-sm text-[#245C3A]">
            {t("step") || "Step"} {step} {t("of") || "of"} {totalSteps}
          </span>

          <div className="w-8" />
        </div>

        <div className="w-full h-2 bg-gray-200 rounded-full mb-5 overflow-hidden">
          <div
            className="h-full bg-[#245C3A] rounded-full transition-all"
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
            className="w-full py-4 bg-[#245C3A] text-white font-bold text-lg rounded-2xl shadow-lg flex items-center justify-center gap-2"
          >
            {t("nextBtn") || "Next"}
            <ChevronRight className="w-5 h-5 text-[#8DBF74]" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            disabled={saving}
            className="w-full py-4 bg-[#245C3A] text-white font-bold text-lg rounded-2xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Sparkles className="w-5 h-5 text-amber-300" />
            {saving ? "Saving..." : t("finishBtn") || "Go to Dashboard"}
          </button>
        )}
      </div>
    </div>
  );
}
