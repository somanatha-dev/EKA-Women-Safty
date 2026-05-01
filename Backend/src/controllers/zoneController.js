import Zone from '../models/Zone.js';

function softmax(arr) {
  const max = Math.max(...arr);
  const exps = arr.map(x => Math.exp(x - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sum);
}

function predictZone(z) {
  const x1 = z.crime_density;
  const x2 = z.lighting_score;
  const x3 = z.activity_level;

  // Scores for each class
  const green =
    -0.11314768 * x1 +
    -0.51671443 * x2 +
     0.55811847 * x3 +
    -1.2898877;

  const yellow =
    -0.65602043 * x1 +
    -0.70807477 * x2 +
     0.67833945 * x3 +
     1.71754786;

  const red =
     0.76916811 * x1 +
     1.2247892  * x2 +
    -1.23645792 * x3 +
    -0.42766016;

  const probs = softmax([green, yellow, red]);

  const maxIndex = probs.indexOf(Math.max(...probs));

  const zones = ["GREEN", "YELLOW", "RED"];

  return {
    zone: zones[maxIndex],
    probabilities: {
      green: probs[0],
      yellow: probs[1],
      red: probs[2],
    }
  };
}

function applyCrowdAdjustment(prob, crowdCount) {
  const crowdFactor = 1 - Math.min(crowdCount / 10, 1);
  return prob * (0.7 + 0.3 * crowdFactor);
}

export const getZones = async (req, res) => {
  try {
    const zones = await Zone.find();

    const result = zones.map(zone => {
      const z = zone._doc || zone.toObject?.() || zone;
      const prediction = predictZone(z);

      const adjustedRed = applyCrowdAdjustment(
        prediction.probabilities.red,
        0 // Baseline risk without crowd adjustment for global map
      );

      let finalZone = prediction.zone;

      if (adjustedRed > 0.6) finalZone = "RED";
      else if (adjustedRed > 0.35) finalZone = "YELLOW";
      else finalZone = "GREEN";

      return {
        ...z,
        zone: finalZone,
        confidence: prediction.probabilities,
        risk: adjustedRed 
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching zones:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const predictLocation = async (req, res) => {
  try {
    const { lat, lng, crowd } = req.body;
    
    console.log("Received:", req.body);
    console.log("Request:", lat, lng, crowd);

    if (lat === undefined || lng === undefined || crowd === undefined) {
      return res.status(400).json({ message: 'lat, lng, and crowd are required' });
    }

    const zones = await Zone.find();
    if (!zones.length) {
      return res.status(404).json({ message: 'No zones found in database' });
    }

    // 1. Find nearest zone using Euclidean distance
    let nearestZone = null;
    let minDistance = Infinity;

    zones.forEach(z => {
      const dLat = z.lat - lat;
      const dLng = z.lng - lng;
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      if (dist < minDistance) {
        minDistance = dist;
        nearestZone = z;
      }
    });

    console.log("Nearest zone:", nearestZone.area || 'Unknown');

    // 2. Run prediction
    const zObj = nearestZone._doc || nearestZone.toObject?.() || nearestZone;
    const prediction = predictZone(zObj);

    // 3. Apply crowd adjustment
    const adjustedRed = applyCrowdAdjustment(prediction.probabilities.red, crowd);

    let finalZone = prediction.zone;
    if (adjustedRed > 0.6) finalZone = "RED";
    else if (adjustedRed > 0.35) finalZone = "YELLOW";
    else finalZone = "GREEN";

    console.log("Final risk:", adjustedRed);

    res.json({
      zone: finalZone,
      currentRisk: adjustedRed,
      safety: finalZone === "RED" ? "Dangerous" : finalZone === "YELLOW" ? "Moderate" : "Safe",
      crowd: crowd
    });

  } catch (error) {
    console.error('Error predicting location:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};