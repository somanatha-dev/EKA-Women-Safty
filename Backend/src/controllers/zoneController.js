import Zone from "../models/Zone.js";

const computeRisk = (z) => {
  let risk =
    0.5 * z.crime_density +
    0.3 * z.lighting_score +
    0.2 * (1 - z.activity_level);

  const hour = new Date().getHours();
  if (hour >= 21 || hour <= 5) risk += 0.2;

  return Math.min(1, Number(risk.toFixed(3)));
};

const classify = (risk) => {
  if (risk > 0.6) return "RED";
  if (risk > 0.35) return "YELLOW";
  return "GREEN";
};

export const getZones = async (req, res) => {
  const zones = await Zone.find();

  const result = zones.map((z) => {
    const risk = computeRisk(z);
    return { ...z._doc, risk, zone: classify(risk) };
  });

  res.json(result);
};