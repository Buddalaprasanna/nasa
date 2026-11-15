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
      {/* Floating Voice Assistant Button with Ambient Pulsing Ring */}
      <div className="fixed right-4 bottom-20 z-40">
        <Link
          to="/voice"
          className="relative flex items-center gap-2 bg-[#245C3A] text-white px-4 py-3 rounded-full shadow-2xl border-2 border-[#8DBF74] hover:bg-[#1C4B2E] hover:-translate-y-1 active:scale-95 transition-all duration-300 group"
          title="Field Shift Voice Assistant"
          aria-label="Voice Assistant"
        >
          {/* Subtle radar pulse glow behind mic */}
          <span className="absolute -inset-1 rounded-full bg-[#8DBF74]/30 animate-ping opacity-60 pointer-events-none"></span>

          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8DBF74] to-[#A4D48D] flex items-center justify-center text-[#245C3A] shadow-inner group-hover:scale-110 transition-transform duration-300">
            <Mic className="w-5 h-5 animate-bounce" />
          </div>
          <span className="text-sm font-bold pr-1 tracking-wide">
            {t("listenBtn") || "Voice"}
          </span>
        </Link>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-[0_-4px_20px_rgba(36,92,58,0.06)] pb-safe transition-all duration-200">
        <div className="max-w-md mx-auto flex items-center justify-around py-1.5 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1 px-2.5 min-w-[56px] text-xs font-medium rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "text-[#245C3A] font-extrabold"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`p-1.5 rounded-full transition-all duration-300 ${
                        isActive
                          ? "bg-emerald-100 text-[#245C3A] scale-110 shadow-sm"
                          : "group-hover:scale-105"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[11px] mt-0.5 tracking-tight transition-all duration-200 ${
                        isActive ? "font-bold text-[#245C3A]" : ""
                      }`}
                    >
                      {item.label}
                    </span>
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
