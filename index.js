import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import visitRoutes from "./routes/visit.routes.js";
import clientRoutes from "./routes/client.routes.js";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import emailRoutes from "./routes/email.routes.js";
import dailyRoutes from "./routes/daily.routes.js";
import starRoutes from "./routes/star.routes.js";
import { authMiddleware } from "./middleware/auth.middleware.js";
import taskRoutes from "./routes/task.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import onboardRoutes from "./routes/clientOnboarding.js";
import reviewRoutes from "./routes/review.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));

const corsOptions = process.env.NODE_ENV === "development" 
  ? {
      origin: "http://localhost:3000",
      credentials: true,
    }
  : {
      origin: "https://mamastops.visitflow.site",
      credentials: true,
    };

app.use(cors(corsOptions));
// Routes
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/visit", visitRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/daily", dailyRoutes);
app.use("/api/star",authMiddleware, starRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/onboard", onboardRoutes);
app.use("/api/reviews", reviewRoutes);
// Error handling middleware


const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ Database connected successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running at: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
