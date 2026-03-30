const mongoose = require("mongoose");

const connectionString =
    process.env.MONGODB_URI ||
    "mongodb://127.0.0.1:27017/hamo_employees";

const connectDB = async () => {
    try {
        console.log("⏳ Connecting to MongoDB...");

        const options = {
            serverSelectionTimeoutMS: 15000,
            bufferCommands: false,
        };

        await mongoose.connect(connectionString, options);

        console.log("✅ MongoDB Connected Successfully");
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err.message);
        console.error(
            "💡 TIP: Ensure IP 0.0.0.0/0 is whitelisted and MONGODB_URI is set"
        );

        // ❌ DON'T crash app
        // process.exit(1); ← REMOVED
    }
};


// ✅ Handle runtime events
mongoose.connection.on("connected", () => {
    console.log("🟢 MongoDB Runtime Connected");
});

mongoose.connection.on("error", (err) => {
    console.error("🚨 MongoDB Runtime Error:", err);
});

mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ MongoDB Disconnected");
});


module.exports = connectDB;