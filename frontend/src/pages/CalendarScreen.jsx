import React, { useState } from "react";
import {
  Calendar,
  CheckCircle,
  Clock,
  Droplets,
  Sprout,
  Shovel,
  Sparkles,
  Scissors
} from "lucide-react";
import { useApp } from "../context/AppContext";
import AudioButton from "../components/AudioButton";

export default function CalendarScreen() {
  const { farm, lang, t } = useApp();

  const [activeStage, setActiveStage] = useState(0);

  const activities = [
    {
      id: 1,
      stage: "1. Land Preparation (ಭೂಮಿ ಸಿದ್ಧತೆ)",
      timeline: "May - June (Pre-Monsoon)",
      icon: Shovel,
      color: "bg-amber-100 text-amber-800 border-amber-300",
      tasks: [
        "Summer deep ploughing to expose hibernating insect larvae and weed seeds to solar heat.",
        "Apply 5-8 tonnes of well-decomposed Farmyard Manure (FYM) or compost per acre.",
        "Form contour bunds across the slope to arrest rainwater runoff."
      ]
    },
    {
      id: 2,
      stage: "2. Seed Selection & Sowing (ಬಿತ್ತನೆ)",
      timeline: "July - Early August (Kharif Onset)",
      icon: Sprout,
      color: "bg-emerald-100 text-emerald-800 border-emerald-300",
      tasks: [
        "Treat Finger Millet / Pulse seeds with Trichoderma viride (4g/kg) and Rhizobium bio-fertilizer.",
        "Sow seeds at 25-30 cm line spacing at optimal soil moisture after first soaking monsoon shower.",
        "Ensure seed depth does not exceed 2-3 cm for finger millet."
      ]
    },
    {
      id: 3,
      stage: "3. Weed & Inter-cultivation (ಎಡೆಕುಂಟೆ)",
      timeline: "20 - 30 Days After Sowing",
      icon: Sparkles,
      color: "bg-blue-100 text-blue-800 border-blue-300",
      tasks: [
        "Pass blade harrow (edekunte) between crop rows to uproot weeds and create a loose dust mulch.",
        "Thin overcrowded seedlings to maintain healthy plant spacing.",
        "Apply neem cake or organic pest repellant if shoot fly is noticed."
      ]
    },
    {
      id: 4,
      stage: "4. Nutrient & Moisture Management (ಗೊಬ್ಬರ ಮತ್ತು ನೀರು)",
      timeline: "40 - 55 Days (Tillering & Earhead)",
      icon: Droplets,
      color: "bg-purple-100 text-purple-800 border-purple-300",
      tasks: [
        "Top-dress with organic vermicompost or split nitrogen before light rain.",
        "Ensure soil is moist during active tillering and flowering.",
        "In case of a dry spell, provide life-saving light furrow irrigation."
      ]
    },
    {
      id: 5,
      stage: "5. Harvesting & Post-Harvest (ಕೊಯ್ಲು)",
      timeline: "105 - 120 Days After Sowing",
      icon: Scissors,
      color: "bg-rose-100 text-rose-800 border-rose-300",
      tasks: [
        "Harvest earheads when 80% turn golden brown.",
        "Sun-dry earheads for 3-4 days to reach 10-12% moisture level before threshing.",
        "Store grain in moisture-proof bags with dried neem leaves to prevent storage pests."
      ]
    }
  ];

  const spokenOverview = "Farming activity calendar: From pre-monsoon land preparation in May, sowing in July, weeding at 25 days, through harvest at 110 days.";

  return (
    <div className="min-h-screen bg-transparent pb-24 max-w-md mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-1 animate-fade-in">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#245C3A] animate-float" />
            <span>Farming Activity Calendar</span>
          </h2>
          <p className="text-xs text-gray-600 font-medium">
            Seasonal Milestones for {farm.village_name}
          </p>
        </div>
        <AudioButton text={spokenOverview} size="sm" />
      </div>

      {/* Stage Cards Timeline with Staggered Entrance */}
      <div className="space-y-3">
        {activities.map((act, index) => {
          const Icon = act.icon;
          const isSelected = activeStage === index;
          const staggerClasses = ["stagger-1", "stagger-2", "stagger-3", "stagger-4", "stagger-5"];

          return (
            <div
              key={act.id}
              onClick={() => setActiveStage(index)}
              className={`farm-card p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer animate-slide-up group ${staggerClasses[index] || ""} ${
                isSelected
                  ? "bg-white border-[#245C3A] ring-2 ring-[#8DBF74]/50 shadow-md scale-[1.01]"
                  : "bg-white/95 border-gray-100/90 hover:border-emerald-200 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl border shadow-inner group-hover:scale-105 transition-transform duration-300 ${act.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900 leading-tight group-hover:text-[#245C3A] transition-colors">
                      {act.stage}
                    </h3>
                    <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
                      {act.timeline}
                    </p>
                  </div>
                </div>

                <AudioButton
                  text={`${act.stage}. Timing: ${act.timeline}. Tasks: ${act.tasks.join(". ")}`}
                  size="sm"
                />
              </div>

              {/* Tasks List */}
              <ul className="list-disc pl-4 space-y-1 text-xs text-gray-700 pt-2 border-t border-gray-100">
                {act.tasks.map((task, tIdx) => (
                  <li key={tIdx} className="text-[11px] leading-relaxed font-medium">
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
