// src/components/driver/DriverRouteMap.jsx
// Shows driver's optimized route on Google Maps
// Draws: driver → stop 1 → stop 2 → ... → NGO
// Orange polyline connects all stops in order

import { useEffect, useRef } from "react";

const GOOGLE_MAPS_KEY  = import.meta.env.VITE_GOOGLE_MAPS_KEY || "YOUR_GOOGLE_MAPS_API_KEY";

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
  script.src   = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}`;
  script.async = true;
  script.onload = callback;
  document.head.appendChild(script);
};

const DriverRouteMap = ({ route, driverLocation }) => { 
  const mapRef      = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!route?.route?.length) return;

    loadGoogleMaps(() => {
      if (!mapRef.current) return;

      // Center on first stop or driver location
      const center = driverLocation || {
        lat: route.route[0]?.lat || 0,
        lng: route.route[0]?.lng || 0,
      };

      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 13,
        styles: [
          { featureType: "poi",     stylers: [{ visibility: "off" }] },
          { featureType: "transit", stylers: [{ visibility: "off" }] },
        ],
      });

      const bounds = new window.google.maps.LatLngBounds();

      // ── Driver location marker (blue) ─────────────────
      if (driverLocation) {
        new window.google.maps.Marker({
          position: driverLocation,
          map:      mapInstance.current,
          title:    "Your Location",
          icon: {
            path:        window.google.maps.SymbolPath.CIRCLE,
            scale:       10,
            fillColor:   "#2563EB",
            fillOpacity: 1,
            strokeColor: "white",
            strokeWeight: 2,
          },
        });
        bounds.extend(driverLocation);
      }

      // ── Stop markers ──────────────────────────────────
      route.route.forEach((stop, idx) => {
        if (!stop.lat || !stop.lng) return;
        const pos = { lat: stop.lat, lng: stop.lng };

        const isNGO = stop.isDestination;
        const marker = new window.google.maps.Marker({
          position: pos,
          map:      mapInstance.current,
          title:    stop.title,
          label: isNGO ? undefined : {
            text:      String(idx + 1),
            color:     "white",
            fontSize:  "11px",
            fontWeight: "bold",
          },
          icon: isNGO ? {
            path:        window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
            scale:       10,
            fillColor:   "#2D6A4F",
            fillOpacity: 1,
            strokeColor: "white",
            strokeWeight: 1.5,
          } : {
            path:        window.google.maps.SymbolPath.CIRCLE,
            scale:       14,
            fillColor:   stop.priority === "high" ? "#EF4444" : stop.priority === "medium" ? "#F59E0B" : "#E76F1A",
            fillOpacity: 1,
            strokeColor: "white",
            strokeWeight: 2,
          },
        });

        // Info window
        const info = new window.google.maps.InfoWindow({
          content: `
            <div style="font-family:sans-serif;padding:4px;min-width:160px;">
              ${isNGO
                ? `<p style="font-weight:700;font-size:13px;margin:0 0 4px;color:#2D6A4F;">🏠 NGO Drop-off</p>`
                : `<p style="font-weight:700;font-size:13px;margin:0 0 4px;">Stop ${idx + 1}: ${stop.title}</p>
                   <p style="font-size:12px;color:#6B7280;margin:0 0 2px;">📦 ${stop.quantity} ${stop.unit || "plates"}</p>
                   <p style="font-size:12px;color:#6B7280;margin:0;">${stop.address}</p>`
              }
            </div>
          `,
        });
        marker.addListener("click", () => info.open(mapInstance.current, marker));
        bounds.extend(pos);
      });

      // ── Route polyline (orange line connecting all stops) ──
      const pathCoords = [];
      if (driverLocation) pathCoords.push(driverLocation);
      route.route.forEach((stop) => {
        if (stop.lat && stop.lng) pathCoords.push({ lat: stop.lat, lng: stop.lng });
      });

      if (pathCoords.length > 1) {
        new window.google.maps.Polyline({
          path:          pathCoords,
          map:           mapInstance.current,
          strokeColor:   "#E76F1A",  // orange brand color
          strokeOpacity: 0.85,
          strokeWeight:  4,
          icons: [{
            icon:   { path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW },
            offset: "50%",
            repeat: "100px",
          }],
        });
      }

      // Fit map to show all stops
      if (!bounds.isEmpty()) {
        mapInstance.current.fitBounds(bounds);
      }
    });
  }, [route, driverLocation]);

  if (!route?.route?.length) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB]">
        <div className="text-center">
          <p className="text-[40px] mb-3">🗺️</p>
          <p className="text-[14px] font-semibold text-[#374151]">No route yet</p>
          <p className="text-[12px] text-[#9CA3AF] mt-1">Route will appear when donations are assigned.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-[#E5E7EB]">
      <div ref={mapRef} className="w-full h-full" />

      {/* Route info overlay */}
      <div className="absolute top-4 left-4 bg-white rounded-xl px-4 py-3 shadow-lg border border-[#E5E7EB]">
        <p className="text-[12px] font-semibold text-[#374151] mb-1">🗺️ Your Route</p>
        <p className="text-[11px] text-[#6B7280]">{route.totalDistance} km · {route.estimatedMinutes} min · {route.stopCount} stops</p>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-xl px-3 py-2.5 shadow-lg border border-[#E5E7EB]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] text-[#6B7280]">
            <div className="w-3 h-3 rounded-full bg-[#2563EB]" /> You (driver)
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#6B7280]">
            <div className="w-3 h-3 rounded-full bg-[#E76F1A]" /> Pickup stops
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#6B7280]">
            <div className="w-3 h-3 rounded-full bg-[#2D6A4F]" /> NGO drop-off
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverRouteMap;
