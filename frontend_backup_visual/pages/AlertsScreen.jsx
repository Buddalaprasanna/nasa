import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  ShieldAlert,
  Info,
  CheckCircle2,
  Calendar,
  Satellite,
  ArrowRight
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";
import AudioButton from "../components/AudioButton";

export default function AlertsScreen() {
  const { farm, lang, t } = useApp();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAlerts() {
      try {
        setLoading(true);
        const data = await api.getAlerts(farm.id);
        setAlerts(data || []);
      } catch (err) {
        console.warn("Alerts fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAlerts();
  }, [farm]);

  const severityStyles = {
    danger: {
      border: "border-red-200 bg-red-50",
      badge: "bg-red-600 text-white",
      icon: "text-red-600",
      label: "Critical Alert"
    },
    warning: {
      border: "border-amber-200 bg-amber-50/70",
      badge: "bg-amber-500 text-white",
      icon: "text-amber-600",
      label: "Climate Warning"
    },
    info: {
      border: "border-blue-200 bg-blue-50/70",
      badge: "bg-blue-600 text-white",
      icon: "text-blue-600",
      label: "Farming Notice"
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F0] pb-24 max-w-md mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            <span>Climate Alerts & Advisories</span>
          </h2>
          <p className="text-xs text-gray-600">
            Satellite Warnings for {farm.village_name}
          </p>
        </div>
        <AudioButton
          text={`Climate warnings and advisories for ${farm.village_name}.`}
          size="sm"
        />
      </div>

      {/* Distinction Header Banner */}
      <div className="p-3 bg-white rounded-2xl border border-gray-200 text-xs text-gray-700 flex items-start gap-2 shadow-sm">
        <Info className="w-4 h-4 text-[#245C3A] shrink-0 mt-0.5" />
        <p className="leading-snug text-[11px]">
          <strong>Notice:</strong> Advisories clearly distinguish <em>observed satellite conditions</em> (e.g., recorded temperature) from <em>projected climate risks</em> (e.g., dry spell soil moisture depletion).
        </p>
      </div>

      {/* Alert Cards */}
      <div className="space-y-3">
        {alerts.map((item) => {
          const style = severityStyles[item.severity] || severityStyles.warning;
          const titleText = item.title[lang] || item.title.en;
          const explText = item.explanation[lang] || item.explanation.en;
          const actionText = item.suggested_action[lang] || item.suggested_action.en;

          const spokenItem = `${style.label}: ${titleText}. ${explText}. Suggested farmer action: ${actionText}`;

          return (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border ${style.border} shadow-sm space-y-3 transition-all`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${style.badge}`}>
                    {style.label}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">
                    {item.date_generated}
                  </span>
                </div>
                <AudioButton text={spokenItem} size="sm" />
              </div>

              {/* Title */}
              <h3 className="font-bold text-base text-gray-900 leading-snug">
                {titleText}
              </h3>

              {/* Explanation */}
              <div className="text-xs text-gray-800 space-y-0.5">
                <span className="font-bold text-gray-900 block text-[11px] uppercase tracking-wide">
                  Observed Satellite Condition:
                </span>
                <p className="leading-relaxed text-[11px] text-gray-700">
                  {explText}
                </p>
              </div>

              {/* Suggested Farmer Action */}
              <div className="p-3 bg-white/90 rounded-xl border border-gray-200 text-xs space-y-1">
                <span className="font-bold text-[#245C3A] flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Suggested Practical Action:
                </span>
                <p className="text-[11px] text-gray-800 leading-relaxed font-medium">
                  {actionText}
                </p>
              </div>

              {/* Data Citation */}
              <div className="text-[10px] text-gray-500 flex items-center gap-1 pt-1">
                <Satellite className="w-3 h-3 text-[#245C3A]" />
                <span>Source: {item.data_source}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
