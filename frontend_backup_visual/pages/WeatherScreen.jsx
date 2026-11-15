
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
}) {
  return (
    <div className="farm-card p-3.5 rounded-2xl bg-white border border-gray-100 shadow-sm">
      <div className={`flex items-center justify-between ${color} mb-2`}>
        <span className="text-xs font-bold uppercase tracking-wider">
          {title}
        </span>
        <Icon className="w-5 h-5" />
      </div>

      <div className="text-2xl font-black text-gray-900">
        {value !== null && value !== undefined
          ? `${value}${unit || ""}`
          : "Unavailable"}
      </div>

      {description && (
        <p className="text-[11px] text-gray-500 mt-1">{description}</p>
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
    <div className="min-h-screen bg-[#F8F8F0] pb-24 max-w-md mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <CloudSun className="w-6 h-6 text-[#245C3A]" />
            <span>{t("navWeather") || "Weather & Climate"}</span>
          </h2>

          <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3" />
            {farm?.village_name || "Your farm"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadClimate(true)}
            disabled={loading || refreshing}
            className="p-2 rounded-full text-emerald-800 bg-emerald-100 hover:bg-emerald-200 disabled:opacity-50"
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

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
          <RefreshCw className="w-7 h-7 mx-auto text-emerald-700 animate-spin" />
          <p className="text-sm text-gray-600 mt-3">
            Fetching climate information for your farm...
          </p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <AlertCircle className="w-5 h-5" />
            Climate information unavailable
          </div>

          <p className="text-xs text-amber-800 mt-2 leading-relaxed">
            {error}
          </p>

          <button
            onClick={() => loadClimate(true)}
            className="mt-3 px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold"
          >
            Try again
          </button>
        </div>
      )}

      {/* Climate information */}
      {!loading && climate && !error && (
        <>
          {/* Data status */}
          <div className="p-3 rounded-2xl bg-emerald-900 text-white shadow-sm">
            <div className="flex items-center gap-2">
              <CloudSun className="w-5 h-5 text-[#8DBF74]" />

              <div>
                <p className="text-xs font-bold">
                  Farm climate information
                </p>

                <p className="text-[10px] text-emerald-200 mt-0.5">
                  {climate.retrieval_date
                    ? `Retrieved ${formatDate(climate.retrieval_date)}`
                    : "Retrieval date not provided"}
                </p>
              </div>
            </div>

            <p className="text-xs text-emerald-100 mt-2 leading-relaxed">
              Based on available historical and climatological observations.
            </p>
          </div>

          {/* Climate metrics */}
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
            />

            <MetricCard
              title="Recent Rainfall"
              value={rainfall}
              unit=" mm"
              description="Accumulated over the last 30 days"
              icon={CloudRain}
              color="text-blue-600"
            />

            <MetricCard
              title="Solar Radiation"
              value={solarRadiation}
              description="Surface solar radiation"
              icon={Sun}
              color="text-amber-500"
            />

            <MetricCard
              title="Soil Moisture"
              value={soilMoisture}
              unit="%"
              description={
                soilMoisture !== null
                  ? "Available topsoil moisture estimate"
                  : "No validated measurement available"
              }
              icon={Layers}
              color="text-emerald-600"
            />
          </div>

          {/* Monthly climatology chart */}
          <div className="farm-card p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                <CloudRain className="w-4 h-4 text-[#245C3A]" />
                Monthly Rainfall Pattern
              </h3>

              <span className="text-[10px] text-gray-400 font-medium">
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
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        formatter={(value) => [
                          `${value} mm`,
                          "Rainfall",
                        ]}
                      />

                      <Bar
                        dataKey="rainfall"
                        fill="#8DBF74"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <p className="text-[11px] text-gray-500 text-center mt-2">
                  Historical average rainfall pattern. This is not a
                  forecast for the coming months.
                </p>
              </>
            ) : (
              <div className="py-8 text-center">
                <CloudRain className="w-8 h-8 mx-auto text-gray-300" />
                <p className="text-xs text-gray-500 mt-2">
                  Monthly rainfall pattern is not available for this location.
                </p>
              </div>
            )}
          </div>

          {/* Farmer guidance */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold">
              <Info className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Important farming information</span>
            </div>

            <p className="leading-relaxed text-[11px] text-amber-800">
              This information describes historical weather patterns and
              available climate observations. It is not a live weather
              forecast, a prediction of rainfall probability, or a direct
              measurement from your field.
            </p>

            <p className="text-[11px] text-amber-800">
              Check local weather forecasts and field conditions before
              making irrigation or crop-protection decisions.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
