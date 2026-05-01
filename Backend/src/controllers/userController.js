export const getNearbyUsers = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Coordinates are required' });
    }

    // SIMULATION: Return a random count of nearby verified users (0-10)
    // In a real production app, this would query a Redis geospatial index
    // or a MongoDB $near query on a Users collection.
    const count = Math.floor(Math.random() * 11);

    res.json({
      count,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      radiusMeters: 500,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching nearby users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
