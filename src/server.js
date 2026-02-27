import express from "express";
import { config } from "dotenv";
import { connectDB, disconnectDB } from "./config/db.js";

//Import routes
import movies from "../src/routes/movies.js";

config();
connectDB();

const app = express();

// API Routes
app.use("/movies", movies);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});

//Handle unhadled promise rejections
process.on("unhandleRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

//Handle uncaught exceptions
process.on("uncaughtException", async (err) => {
  console.error("Uncaught Exception:", err);
  await disconnectDB();
  process.exit(1);
});

//Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
});
