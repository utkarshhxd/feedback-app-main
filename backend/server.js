const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = 5000;
const DATA_FILE = "feedback.json";

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads")); // Serve uploaded images

const readData = () => {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE));
};

const writeData = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

app.post("/submit-feedback", upload.single("image"), (req, res) => {
  const { category, description, location } = req.body; // Accept location
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  let data = readData();
  const newFeedback = {
    id: data.length + 1,
    category,
    description,
    location: location || "Not provided", // Store location
    image,
    status: "Pending",
    date: new Date().toISOString(),
  };
  data.push(newFeedback);
  writeData(data);

  res.json({ message: "Feedback submitted", feedback: newFeedback });
});

app.get("/feedback", (req, res) => {
  res.json(readData()); // Return feedback with location
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
