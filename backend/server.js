const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require("./config/db");
const userRoutes = require('./routes/userRoutes');
const commentRoutes = require("./routes/commentRoutes");
const postRoutes = require("./routes/postRoutes"); // Import the user routes
const cookieParser = require('cookie-parser');
const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());
connectDB();
app.use('/api/users', userRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/posts", postRoutes);
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
