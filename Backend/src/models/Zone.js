import mongoose from "mongoose";

const zoneSchema = new mongoose.Schema({
  area: String,
  street: String,
  lat: Number,
  lng: Number,
  area_type: String,
  crime_density: Number,
  lighting_score: Number,
  activity_level: Number,
});

export default mongoose.model("Zone", zoneSchema);