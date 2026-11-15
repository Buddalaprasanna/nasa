import React, { useState, useEffect, useRef } from "react";

// Five verified agriculture photographs supplied by user
// Downloaded and served locally from /farm-images/ with original URL fallbacks
const FARM_SLIDES = [
  {
    local: "/farm-images/farm-1.jpg",
    remote: "https://i.pinimg.com/1200x/f4/58/0c/f4580cceb8889a3b6fd97f6b9a4a7a38.jpg",
    title: "Terraced Green Rice Fields"
  },
  {
    local: "/farm-images/farm-2.jpg",
    remote: "https://i.pinimg.com/736x/06/e7/65/06e765a03d33b72411eee6c18564e224.jpg",
    title: "Farmer Working in Agricultural Field"
  },
  {
    local: "/farm-images/farm-3.jpg",
    remote: "https://i.pinimg.com/1200x/1a/16/6e/1a166e3f6b469e89f74315dc7fb346dc.jpg",
    title: "Farmer in Lush Paddy Field"
  },
  {
    local: "/farm-images/farm-4.jpg",
    remote: "https://i.pinimg.com/736x/c6/b8/c9/c6b8c9959c4fc418e736604fcfbbb884.jpg",
    title: "Golden Crops and Farmland Landscape"
  },
  {
    local: "/farm-images/farm-5.jpg",
    remote: "https://i.pinimg.com/1200x/7d/49/77/7d49778d0703befa0b1397902ce399dd.jpg",
    title: "Lush Agricultural Fields and Nature"
  }
];

export default function BackgroundSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const timerRef = useRef(null);

  // Check for prefers-reduced-motion accessibility preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Preload all 5 images immediately on mount so transitions are instantaneous
  useEffect(() => {
    FARM_SLIDES.forEach((slide) => {
      const img = new Image();
      img.src = slide.local;
      img.onerror = () => {
        // Fallback to remote if local has any issue
        img.src = slide.remote;
      };
    });
  }, []);

  // Automatically advance to the next slide every 6 seconds
  useEffect(() => {
    if (prefersReducedMotion) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % FARM_SLIDES.length);
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [prefersReducedMotion]);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Background Slides Stack with Smooth Crossfade */}
      {FARM_SLIDES.map((slide, idx) => {
        const isActive = idx === currentIndex;
        return (
          <div
            key={slide.local}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-[1500ms] ease-in-out transform-gpu"
            style={{
              backgroundImage: `url("${slide.local}"), url("${slide.remote}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              opacity: isActive ? 1 : 0,
              zIndex: isActive ? 2 : 1,
              transitionProperty: prefersReducedMotion ? "none" : "opacity",
              filter: "brightness(0.96) saturate(1.05)"
            }}
          />
        );
      })}

      {/* Subtle Cream Transparent Overlay for Readability while keeping images clearly visible */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(248, 248, 240, 0.42) 0%, rgba(248, 248, 240, 0.52) 50%, rgba(248, 248, 240, 0.62) 100%)"
        }}
      />
    </div>
  );
}
