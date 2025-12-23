import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./src/routes/auth.js";
import applicationRoutes from "./src/routes/applications.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Backend running"));

app.use("/auth", authRoutes);
app.use("/applications", applicationRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
