require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = "feedback.json";
const UPLOADS_DIR = path.join(__dirname, "uploads");

// Connect to MongoDB
connectDB();

// Ensure the uploads/ folder exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ 
  storage, 
  limits: { fileSize: 1 * 1024 * 1024 } // Limit file size to 1MB
});

app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

// Authentication Routes
app.use("/auth", authRoutes);

const readData = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE));
  } catch (err) {
    console.error("Error reading file:", err);
    return [];
  }
};

const writeData = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing file:", err);
  }
};

// Submit Feedback API
app.post("/submit-feedback", upload.single("image"), (req, res) => {
  try {
    const { category, description, location } = req.body;
    if (!category || !description) {
      return res.status(400).json({ error: "Category and description are required" });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : null;
    let data = readData();

    const newFeedback = {
      id: uuidv4(),
      category,
      description,
      location: location || "Not provided",
      image,
      status: "Pending",
      date: new Date().toISOString(),
    };

    data.push(newFeedback);
    writeData(data);

    res.status(201).json({ message: "Feedback submitted", feedback: newFeedback });
  } catch (err) {
    console.error("Error submitting feedback:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get Feedback API
app.get("/feedback", (req, res) => {
  try {
    res.json(readData());
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
