import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppProvider } from "./context/AppContext";

// Components
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";

// 12 Required Application Screens
import SplashScreen from "./pages/SplashScreen";
import LanguageSelectScreen from "./pages/LanguageSelectScreen";
import WelcomeScreen from "./pages/WelcomeScreen";
import FarmSetupScreen from "./pages/FarmSetupScreen";
import DashboardScreen from "./pages/DashboardScreen";
import WeatherScreen from "./pages/WeatherScreen";
import RecommendationsScreen from "./pages/RecommendationsScreen";
import RotationScreen from "./pages/RotationScreen";
import AlertsScreen from "./pages/AlertsScreen";
import CalendarScreen from "./pages/CalendarScreen";
import VoiceAssistantScreen from "./pages/VoiceAssistantScreen";
import ProfileScreen from "./pages/ProfileScreen";

// Layout wrapper conditionally displaying Header and BottomNav on main app screens
function AppLayout({ children }) {
  const location = useLocation();
  const hideNavPaths = ["/", "/language", "/welcome", "/setup"];
  const showNav = !hideNavPaths.includes(location.pathname);

  return (
    <div className="min-h-screen bg-[#F8F8F0] flex flex-col justify-between">
      {showNav && <Header />}
      <main className="flex-1">{children}</main>
      {showNav && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            {/* Onboarding & Guided Setup Flow */}
            <Route path="/" element={<SplashScreen />} />
            <Route path="/language" element={<LanguageSelectScreen />} />
            <Route path="/welcome" element={<WelcomeScreen />} />
            <Route path="/setup" element={<FarmSetupScreen />} />

            {/* Core Application Screens */}
            <Route path="/dashboard" element={<DashboardScreen />} />
            <Route path="/weather" element={<WeatherScreen />} />
            <Route path="/recommendations" element={<RecommendationsScreen />} />
            <Route path="/rotation" element={<RotationScreen />} />
            <Route path="/alerts" element={<AlertsScreen />} />
            <Route path="/calendar" element={<CalendarScreen />} />
            <Route path="/voice" element={<VoiceAssistantScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AppProvider>
  );
}
