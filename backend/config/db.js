const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {});
        console.log("MongoDB Connected...");
    } catch (err) {
        console.error("some error in db_connection", err);
        process.exit(1);
    }
};

module.exports = connectDB;
