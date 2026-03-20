const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hamo_employees")
.then(()=> console.log("MongoDB Connected"))
.catch(err=> console.log("MongoDB Connection Error: ", err));

module.exports = mongoose;