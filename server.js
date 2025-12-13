const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const bodyParser = require("body-parser");
const colors = require("colors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const authRoutes = require('./routes/authRoute');
const openaiRoutes = require("./routes/openaiRoutes");
const errorHandler = require("./middlewares/errorMiddleware");

const helmet = require('helmet');
const passport = require("./config/passport");
const app = express();
app.set("trust proxy", 1);
app.use(passport.initialize());
connectDB();
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      fontSrc: ["'self'", "data:"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
    },
  })
);
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://quantum-chat-frontend.onrender.com"
  ],
  credentials: true
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(errorHandler);
// Search Route
app.get("/api/v1/search", require("./middlewares/authMiddleware").requireSignIn, require("./controllers/searchController").globalSearch);

const PORT = process.env.PORT || 8080;
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/openai", require("./routes/openaiRoutes"));
app.use("/api/v1/chat", require("./routes/chatRoutes"));
app.use("/api/v1/files", require("./routes/fileRoutes"));
app.use("/api/v1/studio", require("./routes/studioRoutes")); // Studio Routes
app.use("/uploads", express.static("uploads")); // Serve uploaded files
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Server Running in ${process.env.DEV_MODE} on ${PORT}`.bgCyan.white);
});
