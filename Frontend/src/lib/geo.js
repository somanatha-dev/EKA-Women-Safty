export function interpolateLngLat(p1, p2, t) {
  return {
    lng: p1.lng + (p2.lng - p1.lng) * t,
    lat: p1.lat + (p2.lat - p1.lat) * t,
  };
}

export function haversineMeters(p1, p2) {
  const R = 6371e3; // metres
  const phi1 = (p1.lat * Math.PI) / 180;
  const phi2 = (p2.lat * Math.PI) / 180;
  const dPhi = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLambda = ((p2.lng - p1.lng) * Math.PI) / 180;

  const a =
    Math.sin(dPhi / 2) * Math.sin(dPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) * Math.sin(dLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function calculateBearing(p1, p2) {
  const y = Math.sin(((p2.lng - p1.lng) * Math.PI) / 180) * Math.cos((p2.lat * Math.PI) / 180);
  const x =
    Math.cos((p1.lat * Math.PI) / 180) * Math.sin((p2.lat * Math.PI) / 180) -
    Math.sin((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.cos(((p2.lng - p1.lng) * Math.PI) / 180);
  const θ = Math.atan2(y, x);
  const brng = ((θ * 180) / Math.PI + 360) % 360;
  return brng;
}
