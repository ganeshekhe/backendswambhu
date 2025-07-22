// require("dotenv").config();

// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const path = require("path");

// const authRoutes = require("./routes/authRoutes");
// const serviceRoutes = require("./routes/serviceRoutes");
// const userRoutes = require("./routes/userRoutes");
// const applicationRoutes = require("./routes/applicationRoutes");
// const noticeRoutes = require("./routes/noticeRoutes");
// const heroRoutes = require("./routes/heroRoutes");
// const uploadRoutes = require("./routes/uploads"); // ✅ GridFS File Upload Routes

// const app = express();
// const PORT = process.env.PORT || 5000;

// // ✅ Middleware
// app.use(cors());
// app.use(express.json());

// // ❌ Remove Static Uploads Folder (GridFS will handle all files)
// // app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // ✅ Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/services", serviceRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/applications", applicationRoutes);
// app.use("/api/notices", noticeRoutes);
// app.use("/api/heroslides", heroRoutes);
// app.use("/api/uploads", uploadRoutes);
// app.use("/api/users", uploadRoutes); // ✅ New GridFS Upload Route

// // ✅ Test Route
// app.get("/", (req, res) => {
//   res.send("✅ Maha e-Seva Backend (GridFS Version) Running");
// });

// // ✅ MongoDB Connection
// mongoose
//   .connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => {
//     console.log("✅ MongoDB Connected");
//     app.listen(PORT, () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.error("❌ MongoDB Connection Error:", err);
//   });


require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const Grid = require("gridfs-stream");

// ✅ Import Routes
const authRoutes = require("./routes/authRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const userRoutes = require("./routes/userRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const heroRoutes = require("./routes/heroRoutes");
const uploadRoutes = require("./routes/uploads"); // ✅ GridFS Upload Route
// const fileRoutes = require("./routes/fileRoutes");
const fileRoutes = require("./routes/files");
const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ❌ Remove static disk uploads (we use GridFS now)
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// app.use("/certificates", express.static(path.join(__dirname, "certificates")));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/heroslides", heroRoutes);
app.use("/api/uploads", uploadRoutes); // ✅ Main GridFS Upload Route
// app.use("/api/files", fileRoutes);
app.use("/api/files", fileRoutes);
// ✅ Default Route
app.get("/", (req, res) => {
  res.send("✅ Maha e-Seva Backend (GridFS Version) Running");
});

// ✅ MongoDB Connection + GridFS Init
let gfs;
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    const conn = mongoose.connection;
    conn.once("open", () => {
      gfs = Grid(conn.db, mongoose.mongo);
      gfs.collection("uploads");
      console.log("✅ GridFS initialized");
    });

    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
  });
