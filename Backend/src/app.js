import express from "express";
import cors from "cors";
import zoneRoutes from "./routes/zoneRoutes.js";
import userRoutes from "./routes/userRoutes.js";

import "dotenv/config";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/zones", zoneRoutes);
app.use("/api", userRoutes);

export default app;