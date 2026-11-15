import React from "react";
import { NavLink, Link } from "react-router-dom";
import { Home, CloudSun, Sprout, Repeat, User, Mic } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function BottomNav() {
  const { t } = useApp();

  const navItems = [
    { to: "/dashboard", label: t("navHome") || "Home", icon: Home },
    { to: "/weather", label: t("navWeather") || "Weather", icon: CloudSun },
    { to: "/recommendations", label: t("navCrops") || "Crops", icon: Sprout },
    { to: "/rotation", label: t("navPlans") || "Rotation", icon: Repeat },
    { to: "/profile", label: t("navProfile") || "Profile", icon: User }
  ];

  return (
    <>
      {/* Floating Voice Assistant Button */}
      <div className="fixed right-4 bottom-20 z-40">
        <Link
          to="/voice"
          className="flex items-center gap-2 bg-[#245C3A] text-white px-4 py-3 rounded-full shadow-xl border-2 border-[#8DBF74] hover:bg-emerald-900 active:scale-95 transition-all group"
          title="Field Shift Voice Assistant"
          aria-label="Voice Assistant"
        >
          <div className="w-8 h-8 rounded-full bg-[#8DBF74] flex items-center justify-center text-[#245C3A] group-hover:scale-110 transition-transform">
            <Mic className="w-5 h-5 animate-bounce" />
          </div>
          <span className="text-sm font-semibold pr-1">
            {t("listenBtn") || "Voice"}
          </span>
        </Link>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-lg pb-safe">
        <div className="max-w-md mx-auto flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1 px-2 min-w-[56px] text-xs font-medium rounded-lg transition-colors ${
                    isActive
                      ? "text-[#245C3A] font-bold"
                      : "text-gray-500 hover:text-gray-900"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`p-1 rounded-full transition-transform ${
                        isActive ? "bg-emerald-100 scale-110" : ""
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}
