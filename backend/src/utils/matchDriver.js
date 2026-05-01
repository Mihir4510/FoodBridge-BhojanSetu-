// backend/utils/matchDriver.js
// CommonJS version (module.exports)
// THE BRAIN — finds best available driver for a donation
//
// HOW TO USE:
//   const matchDriver = require("../utils/matchDriver");
//   matchDriver(donation, ngoId, io).then(result => ...)

const Driver   = require("../models/driver.model");
const Donation = require("../models/donation.model");

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
const timeUrgencyScore = (expiryTime, travelTimeHours) => {
  const hoursLeft      = (new Date(expiryTime) - new Date()) / 3600000;
  const timeAfterTravel = hoursLeft - travelTimeHours;
  if (timeAfterTravel < 0) return 999; // driver can't make it
  if (timeAfterTravel < 1) return 3;
  if (timeAfterTravel < 3) return 1;
  return 0;
};

// ── Main matching function ────────────────────────────────
const matchDriver = async (donation, ngoId, io) => {
  try {
    const donorCoords =
      donation.donor?.location?.coordinates ||
      donation.donorId?.location?.coordinates ||
      [0, 0];

    // Step 1: Find all available drivers for this NGO
    const drivers = await Driver.find({
      ngoId,
      isAvailable: true,
    });

    if (!drivers.length) {
      console.log("matchDriver: No available drivers for NGO", ngoId);
      return null;
    }

    // Step 2: Filter by capacity
    const capable = drivers.filter((d) => d.capacity >= donation.quantity);
    if (!capable.length) {
      console.log("matchDriver: No drivers with sufficient capacity");
      return null;
    }

    // Step 3: Score each driver
    const scored = capable.map((driver) => {
      const driverCoords  = driver.location.coordinates;
      const dist          = haversine(driverCoords, donorCoords);
      const travelHours   = dist / 30; // assume 30 km/h
      const urgency       = timeUrgencyScore(donation.expiryTime, travelHours);
      const pWeight       = PRIORITY_WEIGHT[donation.priority] || 3;
      const score         = dist + pWeight + urgency;
      return { driver, dist, score, travelHours };
    });

    // Step 4: Sort — lowest score = best
    scored.sort((a, b) => a.score - b.score);
    const best = scored[0];

    // Step 5: CONCURRENCY SAFE atomic assignment
    // { driverId: null } guard prevents double-assignment
    const updated = await Donation.findOneAndUpdate(
      { _id: donation._id, driverId: null },
      {
        driverId:   best.driver._id,
        status:     "assigned",
        assignedAt: new Date(),
      },
      { new: true }
    );

    if (!updated) {
      console.log("matchDriver: Already assigned (concurrency guard)");
      return null;
    }

    // Step 6: Mark driver as unavailable
    await Driver.findByIdAndUpdate(best.driver._id, {
      isAvailable:       false,
      currentDonationId: donation._id,
    });

    // Step 7: Notify driver via Socket.IO
    if (io) {
      io.to(`driver_${best.driver._id}`).emit("donationAssigned", {
        donation:      updated,
        message:       `You have been assigned: ${donation.title}`,
        distance:      `${best.dist.toFixed(1)} km`,
        estimatedTime: `${Math.ceil(best.travelHours * 60)} min`,
      });
    }

    console.log(`matchDriver: Assigned ${best.driver.name} (score: ${best.score.toFixed(2)})`);
    return { driver: best.driver, donation: updated };

  } catch (err) {
    console.error("matchDriver error:", err.message);
    return null;
  }
};

module.exports = matchDriver;
