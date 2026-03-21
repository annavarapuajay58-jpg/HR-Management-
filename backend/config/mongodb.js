const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://seelamsrivani2004:Srivani%402004@cluster0.d67kzht.mongodb.net/hamo_employees?retryWrites=true&w=majority")
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log("MongoDB Connection Error: ", err));

module.exports = mongoose;