"use client";
import { useSyncExternalStore } from "react";
import { getCountrySnapshot, getServerCountrySnapshot, subscribeToCountry } from "@/lib/country";

// Curated Pexels clips of recognizable sites. The CSS filter renders every clip in monochrome.
const BACKGROUND_VIDEOS: Record<string, string> = {
  ES: "https://videos.pexels.com/video-files/37029830/15688505_3840_2160_30fps.mp4", // Sagrada Familia
  MX: "https://videos.pexels.com/video-files/36301631/15394022_3840_2160_30fps.mp4", // Angel of Independence
  AR: "https://videos.pexels.com/video-files/31563866/13451932_3840_2160_50fps.mp4", // Obelisk, Buenos Aires
  CO: "https://videos.pexels.com/video-files/37151627/15738803_3840_2160_30fps.mp4", // Historic Bogota
  PE: "https://videos.pexels.com/video-files/4361882/4361882-hd_1920_1080_25fps.mp4", // Machu Picchu
  EC: "https://videos.pexels.com/video-files/31207661/13329770_3840_2160_60fps.mp4", // Historic Quito
  GT: "https://videos.pexels.com/video-files/29721175/12778899_3840_2160_60fps.mp4", // Tikal
  CU: "https://videos.pexels.com/video-files/35924416/15240779_3840_2160_60fps.mp4", // Havana
  BO: "https://videos.pexels.com/video-files/31146384/13307909_3840_2160_60fps.mp4", // La Paz
  DO: "https://videos.pexels.com/video-files/17404367/17404367-uhd_3840_2160_24fps.mp4", // Colonial Santo Domingo
  PA: "https://videos.pexels.com/video-files/32210910/13738061_3840_2160_30fps.mp4", // Panama Canal
  PY: "https://videos.pexels.com/video-files/36808131/15596993_3840_2160_30fps.mp4", // Asuncion
  UY: "https://videos.pexels.com/video-files/36844370/15610297_3840_2160_30fps.mp4", // Montevideo
  CR: "https://videos.pexels.com/video-files/31787656/13541577_3840_2160_24fps.mp4", // San Jose
};

export default function CountryBackdrop() {
  const country = useSyncExternalStore(subscribeToCountry, getCountrySnapshot, getServerCountrySnapshot);
  const video = BACKGROUND_VIDEOS[country];

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#090a0b]">
      {video && (
        <video key={country} autoPlay muted loop playsInline preload="metadata" className="absolute left-1/2 top-1/2 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover opacity-80 grayscale">
          <source src={video} type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0 bg-black/25" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/45" />
    </div>
  );
}
