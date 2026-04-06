const mongoose = require("mongoose");

// 🔥 Disable buffering globally (VERY IMPORTANT)
mongoose.set("bufferCommands", false);

const connectionString =
    process.env.MONGODB_URI || // ✅ FIXED NAME (important)
    "mongodb://127.0.0.1:27017/hamo_employees";

const connectDB = async () => {
    try {
        console.log("⏳ Connecting to MongoDB...");

        const conn = await mongoose.connect(connectionString, {
            serverSelectionTimeoutMS: 15000,
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err.message);

        // 🔥 VERY IMPORTANT: STOP SERVER if DB fails
        process.exit(1);
    }
};


// ✅ Runtime events (optional but good)
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