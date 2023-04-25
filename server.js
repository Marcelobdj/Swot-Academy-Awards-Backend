const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
const connectToMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
};

connectToMongoDB();

// Routes
app.get("/", (req, res) => {
    res.send("Swot Academy Awards API");
});

// Start server
const PORT = process.env.PORT || 7000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
    console.error("Unhandled promise rejection:", err);
    process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
    console.error("Uncaught exception:", err);
    process.exit(1);
});