import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 4000;

export const CLIENT_ORIGINS = (process.env.CLIENT_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim().replace(/\/$/, ""))
  .filter(Boolean);