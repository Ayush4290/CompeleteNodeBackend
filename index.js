import express from "express";
import { configDotenv } from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cors from "cors";
import { loggers } from "winston";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/database.js";

configDotenv();
connectDB();

const app = express();
app.use(helmet());
app.use(compression());
app.use(
  morgan("combined", {
    stream: { write: (message) => loggers.info(message.trim()) },
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(cors());

app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static("uploads"));

app.use(rateLimit());

//Godel  ErrorHandle

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server is running in port ${PORT} `);
});
