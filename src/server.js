import express from "express";

//Import routes
import movies from "../src/routes/movies.js";

const app = express();

// API Routes
app.use("/movies", movies);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
