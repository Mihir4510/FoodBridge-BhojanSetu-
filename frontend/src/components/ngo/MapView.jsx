// src/components/ngo/MapView.jsx
// Google Maps showing NGO + donor locations
// Add VITE_GOOGLE_MAPS_KEY to your .env file

import { useEffect, useRef } from "react";
import { toLatLng } from "./NgoUI";

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || "YOUR_GOOGLE_MAPS_API_KEY";
console.log("MAP KEY:", GOOGLE_MAPS_KEY);

// ── Load Google Maps script once ──────────────────────────
let scriptLoaded = false;
const loadGoogleMaps = (callback) => {
  if (window.google?.maps) { callback(); return; }
  if (scriptLoaded) {
    const check = setInterval(() => {
      if (window.google?.maps) { clearInterval(check); callback(); }
    }, 100);
    return;
  }
  scriptLoaded = true;
  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places`;
  script.async = true;
  script.defer = true;
  script.onload = callback;
  document.head.appendChild(script);
};

// ── MapView ───────────────────────────────────────────────
const MapView = ({ ngoLocation, donations = [], onMarkerClick }) => {
  const mapRef      = useRef(null);
  const mapInstance = useRef(null);
  const markers     = useRef([]);

  useEffect(() => {
    if (!ngoLocation) return;

    loadGoogleMaps(() => {
      if (!mapRef.current) return;

      // Init map centered on NGO
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center:    ngoLocation,
        zoom:      13,
        mapTypeId: "roadmap",
        styles: [
          { featureType: "poi",     stylers: [{ visibility: "off" }] },
          { featureType: "transit", stylers: [{ visibility: "off" }] },
        ],
      });

      // ── NGO marker (orange) ────────────────────────────
      new window.google.maps.Marker({
        position: ngoLocation,
        map:      mapInstance.current,
        title:    "Your Location (NGO)",
        icon: {
          path:        window.google.maps.SymbolPath.CIRCLE,
          scale:       12,
          fillColor:   "#E76F1A",
          fillOpacity: 1,
          strokeColor: "white",
          strokeWeight: 2,
        },
      });

      // ── Clear old donor markers ────────────────────────
      markers.current.forEach((m) => m.setMap(null));
      markers.current = [];

      // ── Donor markers ──────────────────────────────────
      donations.forEach((d) => {
        // ✅ Normalize: donor or donorId
        const donor  = d.donor || d.donorId;
        const coords = toLatLng(donor?.location?.coordinates);
        if (!coords) return;

        const priorityColors = {
          high:   "#EF4444",
          medium: "#F59E0B",
          low:    "#22C55E",
        };

        const marker = new window.google.maps.Marker({
          position: coords,
          map:      mapInstance.current,
          title:    d.title,
          icon: {
            path:        window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            scale:       8,
            fillColor:   priorityColors[d.priority] || "#22C55E",
            fillOpacity: 1,
            strokeColor: "white",
            strokeWeight: 1.5,
          },
        });

        // Info window on hover
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="font-family:sans-serif;padding:4px;min-width:160px;">
              <p style="font-weight:700;font-size:13px;margin:0 0 4px;">${d.title}</p>
              <p style="font-size:12px;color:#6B7280;margin:0 0 2px;">
                👤 ${donor?.name || "Donor"}
              </p>
              <p style="font-size:12px;color:#6B7280;margin:0 0 2px;">
                📦 ${d.quantity} ${d.unit || "plates"}
              </p>
              <p style="font-size:12px;color:#6B7280;margin:0;text-transform:capitalize;">
                Status: <strong>${d.status}</strong>
              </p>
            </div>
          `,
        });

        marker.addListener("mouseover", () => infoWindow.open(mapInstance.current, marker));
        marker.addListener("mouseout",  () => infoWindow.close());
        marker.addListener("click",     () => onMarkerClick?.(d));

        markers.current.push(marker);
      });

      // Fit bounds to show all markers
      if (donations.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(ngoLocation);
        markers.current.forEach((m) => bounds.extend(m.getPosition()));
        mapInstance.current.fitBounds(bounds);
      }
    });
  }, [ngoLocation, donations]);

  // ── No location fallback ───────────────────────────────
  if (!ngoLocation) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB]">
        <div className="text-center py-12 px-6">
          <p className="text-[40px] mb-3">🗺️</p>
          <p className="text-[14px] font-semibold text-[#374151] mb-1">Location not set</p>
          <p className="text-[12px] text-[#9CA3AF]">
            Update your NGO profile with a city/location to enable the map view.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-sm">
      <div ref={mapRef} className="w-full h-full" />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-xl px-4 py-3 shadow-lg border border-[#E5E7EB]">
        <p className="text-[11px] font-bold text-[#374151] uppercase tracking-wider mb-2">Legend</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] text-[#6B7280]">
            <div className="w-3 h-3 rounded-full bg-[#E76F1A]" /> Your NGO
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#6B7280]">
            <div className="w-3 h-3 bg-red-400"    /> High Priority
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#6B7280]">
            <div className="w-3 h-3 bg-yellow-400" /> Medium
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#6B7280]">
            <div className="w-3 h-3 bg-green-400"  /> Low
          </div>
        </div>
      </div>

      {/* Donation count badge */}
      <div className="absolute top-4 right-4 bg-white rounded-xl px-3 py-2 shadow-lg border border-[#E5E7EB]">
        <p className="text-[12px] font-semibold text-[#374151]">
          🍱 {donations.length} donation{donations.length !== 1 ? "s" : ""} on map
        </p>
      </div>
    </div>
  );
};

export default MapView;
