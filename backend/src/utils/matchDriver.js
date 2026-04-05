// backend/utils/matchDriver.js
// THE BRAIN — Auto-assigns best driver to a donation
// Uses: distance + priority weight + time window urgency


import Driver   from "../models/Driver.js";
import Donation from "../models/Donation.js";


// ── Priority weight (lower = more urgent) ─────────────────
const PRIORITY_WEIGHT = { high: 1, medium: 2, low: 3 };

// ── Haversine distance in km ──────────────────────────────
const haversine = (coord1, coord2) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(coord2[1] - coord1[1]);
  const dLon = toRad(coord2[0] - coord1[0]);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(coord1[1])) *
    Math.cos(toRad(coord2[1])) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ── Time urgency score ────────────────────────────────────
// Returns extra score if food expires within 3 hours of estimated travel time
const timeUrgencyScore = (expiryTime, travelTimeHours) => {
  const hoursLeft = (new Date(expiryTime) - new Date()) / 3600000;
  const timeAfterTravel = hoursLeft - travelTimeHours;
  if (timeAfterTravel < 0) return 999; // driver can't make it — penalize heavily
  if (timeAfterTravel < 1) return 3;   // very urgent
  if (timeAfterTravel < 3) return 1;   // urgent
  return 0;                             // comfortable
};

// ── Main matching function ────────────────────────────────
const matchDriver = async (donation, ngoId, io) => {
  try {
    // Step 1: Get donor coordinates from donation
    const donorCoords = donation.donor?.location?.coordinates ||
                        donation.donorId?.location?.coordinates || [0, 0];

    // Step 2: Find all available drivers for this NGO
    const drivers = await Driver.find({
      ngoId,
      isAvailable: true,
    });

    if (!drivers.length) {
      console.log("matchDriver: No available drivers for NGO", ngoId);
      return null;
    }

    // Step 3: Filter by capacity
    const capable = drivers.filter((d) => d.capacity >= donation.quantity);
    if (!capable.length) {
      console.log("matchDriver: No drivers with sufficient capacity");
      return null;
    }

    // Step 4: Score each driver
    const scored = capable.map((driver) => {
      const driverCoords = driver.location.coordinates; // [lng, lat]

      // Distance from driver to donor pickup point (km)
      const dist = haversine(driverCoords, donorCoords);

      // Approx travel time (assume 30 km/h avg urban speed)
      const travelHours = dist / 30;

      // Time urgency
      const urgency = timeUrgencyScore(donation.expiryTime, travelHours);

      // Priority weight
      const pWeight = PRIORITY_WEIGHT[donation.priority] || 3;

      // Combined score — LOWER is better
      const score = dist + pWeight + urgency;

      return { driver, dist, score, travelHours };
    });

    // Step 5: Sort by score ascending — best driver first
    scored.sort((a, b) => a.score - b.score);
    const best = scored[0];

    // Step 6: CONCURRENCY SAFE assignment
    // findOneAndUpdate with driverId: null ensures only ONE driver gets assigned
    // even if two processes try simultaneously
    const updated = await Donation.findOneAndUpdate(
      { _id: donation._id, driverId: null }, // ← guard: only if not yet assigned
      {
        driverId:   best.driver._id,
        status:     "assigned",
        assignedAt: new Date(),
      },
      { new: true }
    );

    if (!updated) {
      // Another process already assigned a driver — safe to ignore
      console.log("matchDriver: Donation already assigned (concurrency guard triggered)");
      return null;
    }

    // Step 7: Mark driver as unavailable
    await Driver.findByIdAndUpdate(best.driver._id, {
      isAvailable:       false,
      currentDonationId: donation._id,
    });

    // Step 8: Notify driver via Socket.IO
    if (io) {
      io.to(`driver_${best.driver._id}`).emit("donationAssigned", {
        donation: updated,
        message:  `You have been assigned to pick up: ${donation.title}`,
        distance: `${best.dist.toFixed(1)} km`,
        estimatedTime: `${Math.ceil(best.travelHours * 60)} minutes`,
      });
    }

    console.log(`matchDriver: Assigned driver ${best.driver.name} (score: ${best.score.toFixed(2)})`);
    return { driver: best.driver, donation: updated, score: best.score };

  } catch (err) {
    console.error("matchDriver error:", err.message);
    return null;
  }
};

export default matchDriver;