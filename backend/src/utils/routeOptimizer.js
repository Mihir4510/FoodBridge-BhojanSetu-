// backend/utils/routeOptimizer.js
// CommonJS version (module.exports)
// Greedy TSP — shortest route with urgency weighting
//
// HOW TO USE:
//   const optimizeRoute = require("../utils/routeOptimizer");
//   const result = optimizeRoute(driverLocation, donations, ngoLocation);

const distance = (a, b) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

const urgencyPenalty = (expiryTime) => {
  const hoursLeft = (new Date(expiryTime) - new Date()) / 3600000;
  if (hoursLeft < 1) return -100;
  if (hoursLeft < 3) return -50;
  if (hoursLeft < 6) return -20;
  return 0;
};

const toLatLng = (coordinates) => {
  if (!coordinates || coordinates.length < 2) return null;
  return { lat: coordinates[1], lng: coordinates[0] };
};

// @param driverLocation  { lat, lng }
// @param donations       Array of donation objects
// @param ngoLocation     { lat, lng } — final destination (optional)
// @returns               { route[], totalDistance, estimatedMinutes, stopCount }
const optimizeRoute = (driverLocation, donations, ngoLocation = null) => {
  if (!donations || !donations.length) {
    return { route: [], totalDistance: 0, estimatedMinutes: 0, stopCount: 0 };
  }

  const stops = donations
    .map((d) => {
      const donor  = d.donor || d.donorId;
      const coords = toLatLng(donor?.location?.coordinates || d.location?.coordinates);
      if (!coords) return null;
      return {
        id:         d._id?.toString() || d.id,
        donation:   d,
        lat:        coords.lat,
        lng:        coords.lng,
        address:    d.pickupAddress || d.address || "",
        title:      d.title,
        quantity:   d.quantity,
        unit:       d.unit || "plates",
        priority:   d.priority,
        expiryTime: d.expiryTime,
        status:     d.status,
      };
    })
    .filter(Boolean);

  if (!stops.length) return { route: [], totalDistance: 0, estimatedMinutes: 0, stopCount: 0 };

  // Greedy nearest neighbor with urgency weighting
  const unvisited = [...stops];
  const route     = [];
  let   current   = driverLocation;
  let   totalDist = 0;

  while (unvisited.length > 0) {
    const scored = unvisited.map((stop) => ({
      stop,
      realDist:  distance(current, stop),
      effective: distance(current, stop) + urgencyPenalty(stop.expiryTime),
    }));
    scored.sort((a, b) => a.effective - b.effective);
    const best = scored[0];

    route.push({ ...best.stop, distanceFromPrev: parseFloat(best.realDist.toFixed(2)) });
    totalDist += best.realDist;
    current    = { lat: best.stop.lat, lng: best.stop.lng };
    unvisited.splice(unvisited.indexOf(best.stop), 1);
  }

  // Add NGO as final destination
  if (ngoLocation) {
    const lastLeg = distance(current, ngoLocation);
    totalDist += lastLeg;
    route.push({
      id:               "ngo",
      title:            "NGO Drop-off",
      lat:              ngoLocation.lat,
      lng:              ngoLocation.lng,
      address:          "NGO Location",
      isDestination:    true,
      distanceFromPrev: parseFloat(lastLeg.toFixed(2)),
    });
  }

  return {
    route,
    totalDistance:    parseFloat(totalDist.toFixed(2)),
    estimatedMinutes: Math.ceil((totalDist / 30) * 60),
    stopCount:        route.length,
  };
};

module.exports = optimizeRoute;
