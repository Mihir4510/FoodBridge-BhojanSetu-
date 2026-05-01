export const calcDistance = (coord1, coord2) => {
  if (!coord1 || !coord2) return null;
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lng - coord1.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
    Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
};

export const toLatLng = (coordinates) => {
  if (!coordinates || coordinates.length < 2) return null;
  return { lat: coordinates[1], lng: coordinates[0] };
};