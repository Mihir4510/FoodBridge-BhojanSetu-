// backend/utils/routeOptimizer.js
// TSP (Travelling Salesman Problem) — Greedy Nearest Neighbor
// Finds shortest route for driver to visit all pickup points
//
// HOW TO USE:
//   import optimizeRoute from "../utils/routeOptimizer.js";
//   const route = optimizeRoute(driverLocation, donations);
//   // route = ordered array of stops the driver should visit

// ── Haversine distance ────────────────────────────────────
const distance = (a, b) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) *
    Math.cos(toRad(b.lat)) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

// ── Time urgency penalty ──────────────────────────────────
const urgencyPenalty = (expiryTime) => {
  const hoursLeft = (new Date(expiryTime) - new Date()) / 3600000;
  if (hoursLeft < 1) return -100; // Heavily prioritize — pull to front of route
  if (hoursLeft < 3) return -50;
  if (hoursLeft < 6) return -20;
  return 0;
};

// ── Convert GeoJSON [lng,lat] to {lat,lng} ────────────────
const toLatLng = (coordinates) => {
  if (!coordinates || coordinates.length < 2) return null;
  return { lat: coordinates[1], lng: coordinates[0] };
};

// ── Main route optimizer ──────────────────────────────────
// @param driverLocation  { lat, lng }
// @param donations       Array of donation objects (must have donor.location.coordinates or location.coordinates)
// @param ngoLocation     { lat, lng } — final destination
// @returns               { route: [], totalDistance: number, estimatedMinutes: number }

const optimizeRoute = (driverLocation, donations, ngoLocation = null) => {
  if (!donations.length) {
    return { route: [], totalDistance: 0, estimatedMinutes: 0 };
  }

  // Build list of stops with metadata
  const stops = donations
    .map((d) => {
      const donor = d.donor || d.donorId;
      const coords = toLatLng(
        donor?.location?.coordinates || d.location?.coordinates
      );
      if (!coords) return null;
      return {
        id:          d._id?.toString() || d.id,
        donation:    d,
        lat:         coords.lat,
        lng:         coords.lng,
        address:     d.pickupAddress || d.address || "",
        title:       d.title,
        quantity:    d.quantity,
        unit:        d.unit || "plates",
        priority:    d.priority,
        expiryTime:  d.expiryTime,
        status:      d.status,
      };
    })
    .filter(Boolean);

  if (!stops.length) {
    return { route: [], totalDistance: 0, estimatedMinutes: 0 };
  }

  // ── Greedy Nearest Neighbor TSP with urgency weighting ──
  const unvisited  = [...stops];
  const route      = [];
  let   current    = driverLocation;
  let   totalDist  = 0;

  while (unvisited.length > 0) {
    // Score each unvisited stop: effectiveDist = real distance + urgency penalty
    const scored = unvisited.map((stop) => {
      const realDist  = distance(current, stop);
      const urgency   = urgencyPenalty(stop.expiryTime);
      // Urgency is negative — reduces effective distance to pull urgent stops earlier
      const effective = realDist + urgency;
      return { stop, realDist, effective };
    });

    // Pick stop with lowest effective distance
    scored.sort((a, b) => a.effective - b.effective);
    const best = scored[0];

    route.push({
      ...best.stop,
      distanceFromPrev: parseFloat(best.realDist.toFixed(2)),
    });

    totalDist += best.realDist;
    current    = { lat: best.stop.lat, lng: best.stop.lng };
    unvisited.splice(unvisited.indexOf(best.stop), 1);
  }

  // Add NGO as final destination if provided
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

  // Estimate time: assume 30 km/h average urban speed
  const estimatedMinutes = Math.ceil((totalDist / 30) * 60);

  return {
    route,
    totalDistance:    parseFloat(totalDist.toFixed(2)),
    estimatedMinutes,
    stopCount:        route.length,
  };
};

export default optimizeRoute;