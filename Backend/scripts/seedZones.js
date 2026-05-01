import fs from "fs";
import csv from "csv-parser";
import mongoose from "mongoose";
import Zone from "../src/models/Zone.js";
import dotenv from "dotenv";

dotenv.config();

await mongoose.connect(process.env.MONGO_DB);

const zones = [];

fs.createReadStream("src/data/bengaluru_zones_50.csv")
  .pipe(csv())
  .on("data", (row) => {
    zones.push({
      area: row.area,
      street: row.street,
      lat: Number(row.lat),
      lng: Number(row.lng),
      area_type: row.area_type,
      crime_density: Number(row.crime_density),
      lighting_score: Number(row.lighting_score),
      activity_level: Number(row.activity_level),
    });
  })
  .on("end", async () => {
    await Zone.deleteMany(); // reset
    await Zone.insertMany(zones);
    console.log("🔥 Zones inserted:", zones.length);
    process.exit();
  });