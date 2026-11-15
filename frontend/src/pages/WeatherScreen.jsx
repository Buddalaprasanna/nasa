import React, { useCallback, useEffect, useState } from "react";
import {
  CloudSun,
  Thermometer,
  CloudRain,
  Sun,
  Layers,
  Info,
  RefreshCw,
  MapPin,
  AlertCircle,
  Sparkles
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { useApp } from "../context/AppContext";
import { api } from "../services/api";
import AudioButton from "../components/AudioButton";

function formatNumber(value, decimals = 1) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(decimals) : null;
}

function formatDate(value) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function MetricCard({
  title,
  value,
  unit,
  description,
  icon: Icon,
  color,
  staggerClass = "",
}) {
  return (
    <div className={`farm-card p-3.5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 animate-slide-up group ${staggerClass}`}>
      <div className={`flex items-center justify-between ${color} mb-2`}>
        <span className="text-xs font-extrabold uppercase tracking-wider">
          {title}
        </span>
        <div className="p-1 rounded-lg bg-gray-50 group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="text-2xl font-black text-gray-900 tracking-tight">
        {value !== null && value !== undefined
          ? `${value}${unit || ""}`
          : "Unavailable"}
      </div>

      {description && (
        <p className="text-[11px] text-gray-500 mt-1 font-medium">{description}</p>
      )}
    </div>
  );
}

export default function WeatherScreen() {
  const { farm, t } = useApp();

  const [climate, setClimate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadClimate = useCallback(
    async (force = false) => {
      if (!farm?.id) {
        setClimate(null);
        setError("Please select or create your farm profile first.");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (
        !Number.isFinite(Number(farm.latitude)) ||
        !Number.isFinite(Number(farm.longitude))
      ) {
        setClimate(null);
        setError(
          "Farm location is not available. Please update your farm location before requesting climate information."
        );
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        if (force) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const data = await api.getClimate(
          farm.id,
          Number(farm.latitude),
          Number(farm.longitude),
          force
        );

        setClimate(data);
      } catch (err) {
        console.error("Climate request failed:", err);
        setError(
          err.message ||
            "Climate information is temporarily unavailable. Please try again."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [farm]
  );

  useEffect(() => {
    loadClimate();
  }, [loadClimate]);

  const monthlyTrends = climate?.monthly_trends;

  const chartData =
    monthlyTrends && typeof monthlyTrends === "object"
      ? Object.entries(monthlyTrends)
          .map(([month, values]) => {
            const rainfall = Number(values?.rainfall_mm);

            return {
              month,
              rainfall: Number.isFinite(rainfall) ? rainfall : null,
            };
          })
          .filter((item) => item.rainfall !== null)
      : [];

  const temperature = formatNumber(climate?.temp_mean);
  const minimumTemperature = formatNumber(climate?.temp_min);
  const maximumTemperature = formatNumber(climate?.temp_max);

  const rainfall = formatNumber(
    climate?.precipitation_annual_or_daily
  );

  const solarRadiation = formatNumber(climate?.solar_radiation);

  const soilMoisture =
    climate?.soil_moisture_estimate !== null &&
    climate?.soil_moisture_estimate !== undefined
      ? formatNumber(Number(climate.soil_moisture_estimate) * 100, 1)
      : null;

  const spokenText = climate
    ? [
        `Climate information for ${farm?.village_name || "your farm"}.`,
        temperature !== null
          ? `Average temperature is ${temperature} degrees Celsius.`
          : "Average temperature is unavailable.",
        rainfall !== null
          ? `Accumulated rainfall over the last 30 days is ${rainfall} millimeters.`
          : "Recent rainfall information is unavailable.",
        solarRadiation !== null
          ? `Solar radiation is ${solarRadiation}.`
          : "",
        "These are historical and climatological observations, not a live weather forecast.",
      ]
        .filter(Boolean)
        .join(" ")
    : `Climate information for ${farm?.village_name || "your farm"} is currently unavailable.`;

  return (
    <div className="min-h-screen bg-transparent pb-24 max-w-md mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-1 animate-fade-in">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <CloudSun className="w-6 h-6 text-[#245C3A] animate-float" />
            <span>{t("navWeather") || "Weather & Climate"}</span>
          </h2>

          <p className="text-xs text-gray-600 flex items-center gap-1 mt-1 font-medium">
            <MapPin className="w-3 h-3 text-[#8DBF74]" />
            {farm?.village_name || "Your farm"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadClimate(true)}
            disabled={loading || refreshing}
            className="p-2.5 rounded-full text-emerald-800 bg-emerald-100 hover:bg-emerald-200 active:scale-95 transition-all disabled:opacity-50 shadow-sm"
            title="Refresh climate information"
            aria-label="Refresh climate information"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
          </button>

          <AudioButton text={spokenText} size="sm" />
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-emerald-100 animate-pulse">
          <RefreshCw className="w-8 h-8 mx-auto text-[#245C3A] animate-spin" />
          <p className="text-sm font-semibold text-gray-700 mt-3">
            Fetching satellite climatology from NASA POWER...
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="h-24 rounded-xl skeleton-shimmer"></div>
            <div className="h-24 rounded-xl skeleton-shimmer"></div>
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 animate-slide-up">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            Climate information unavailable
          </div>

          <p className="text-xs text-amber-800 mt-2 leading-relaxed font-medium">
            {error}
          </p>

          <button
            onClick={() => loadClimate(true)}
            className="mt-3 px-4 py-2 rounded-xl bg-[#245C3A] hover:bg-[#1c4b2e] active:scale-95 text-white text-xs font-bold transition-all shadow-sm"
          >
            Try again
          </button>
        </div>
      )}

      {/* Climate information */}
      {!loading && climate && !error && (
        <>
          {/* Data status with agricultural background image */}
          <div className="relative p-4 rounded-2xl bg-gradient-to-r from-[#245C3A] to-[#1C4B2E] text-white shadow-md overflow-hidden animate-slide-up">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none"
              style={{
                backgroundImage: `url("https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80")`,
              }}
              aria-hidden="true"
            />
            <div className="relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-800/80 text-[#8DBF74] shadow-inner">
                  <CloudSun className="w-5 h-5" />
                </div>

                <div>
                  <p className="text-xs font-black tracking-wide">
                    NASA POWER Climate Observation
                  </p>

                  <p className="text-[10px] text-emerald-200 mt-0.5 font-medium">
                    {climate.retrieval_date
                      ? `Retrieved ${formatDate(climate.retrieval_date)}`
                      : "Multi-year climatological dataset"}
                  </p>
                </div>
              </div>

              <p className="text-xs text-emerald-100 mt-2.5 leading-relaxed font-medium">
                Surface weather & moisture metrics calibrated for Indian smallholder agriculture.
              </p>
            </div>
          </div>

          {/* Climate metrics with staggered animations */}
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              title="Temperature"
              value={temperature}
              unit="°C"
              description={
                minimumTemperature !== null &&
                maximumTemperature !== null
                  ? `Min ${minimumTemperature}°C · Max ${maximumTemperature}°C`
                  : "Average temperature"
              }
              icon={Thermometer}
              color="text-orange-600"
              staggerClass="stagger-1"
            />

            <MetricCard
              title="Recent Rainfall"
              value={rainfall}
              unit=" mm"
              description="Accumulated over 30 days"
              icon={CloudRain}
              color="text-blue-600"
              staggerClass="stagger-2"
            />

            <MetricCard
              title="Solar Radiation"
              value={solarRadiation}
              description="Surface solar radiation"
              icon={Sun}
              color="text-amber-500"
              staggerClass="stagger-3"
            />

            <MetricCard
              title="Soil Moisture"
              value={soilMoisture}
              unit="%"
              description={
                soilMoisture !== null
                  ? "Topsoil moisture estimate"
                  : "No validated measurement"
              }
              icon={Layers}
              color="text-emerald-600"
              staggerClass="stagger-4"
            />
          </div>

          {/* Monthly climatology chart */}
          <div className="farm-card p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 animate-slide-up stagger-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                <CloudRain className="w-4 h-4 text-[#245C3A]" />
                Monthly Rainfall Pattern
              </h3>

              <span className="text-[10px] text-emerald-800 bg-emerald-100 font-bold px-2 py-0.5 rounded-full">
                Historical
              </span>
            </div>

            {chartData.length > 0 ? (
              <>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{
                        top: 5,
                        right: 5,
                        left: -20,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#E5E7EB"
                      />

                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11 }}
                      />

                      <YAxis tick={{ fontSize: 10 }} />

                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#245C3A",
                          color: "#fff",
                          borderRadius: 12,
                          fontSize: 12,
                          border: "none",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                        }}
                        formatter={(value) => [
                          `${value} mm`,
                          "Rainfall",
                        ]}
                      />

                      <Bar
                        dataKey="rainfall"
                        fill="#8DBF74"
                        radius={[6, 6, 0, 0]}
                        animationDuration={1000}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <p className="text-[11px] text-gray-500 text-center mt-2 font-medium">
                  Historical average rainfall pattern. This is not a
                  forecast for the coming months.
                </p>
              </>
            ) : (
              <div className="py-8 text-center">
                <CloudRain className="w-8 h-8 mx-auto text-gray-300" />
                <p className="text-xs text-gray-500 mt-2 font-medium">
                  Monthly rainfall pattern is not available for this location.
                </p>
              </div>
            )}
          </div>

          {/* Farmer guidance */}
          <div className="farm-card p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs space-y-1.5 animate-slide-up stagger-5">
            <div className="flex items-center gap-1.5 font-black">
              <Info className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Important farming information</span>
            </div>

            <p className="leading-relaxed text-[11px] text-amber-800 font-medium">
              This information describes historical weather patterns and
              available climate observations. It is not a live weather
              forecast, a prediction of rainfall probability, or a direct
              measurement from your field.
            </p>

            <p className="text-[11px] text-amber-800 font-medium">
              Check local weather forecasts and field conditions before
              making irrigation or crop-protection decisions.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
