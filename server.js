require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const Grid = require("gridfs-stream");
const http = require("http");
const { Server } = require("socket.io");

// ✅ Create express app and wrap with http server
const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "https://swambhu-sable.vercel.app",
  "https://swambhu-git-main-ganesh-ekhes-projects-0e48499e.vercel.app",
  "https://swambhu-krm4y27wg-ganesh-ekhes-projects-0e48499e.vercel.app",
];

// ✅ Initialize socket.io
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Allow non-browser requests like Postman
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

// ✅ CORS Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// ✅ Routes (Pass io to applicationRoutes)
const authRoutes = require("./routes/authRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const userRoutes = require("./routes/userRoutes");
const applicationRoutes = require("./routes/applicationRoutes")(io); // <-- important
const noticeRoutes = require("./routes/noticeRoutes");
const heroRoutes = require("./routes/heroRoutes");
const uploadRoutes = require("./routes/uploads");
const fileRoutes = require("./routes/files");

// ✅ Use routes
app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/applications", applicationRoutes); // already passed io
app.use("/api/notices", noticeRoutes);
app.use("/api/heroslides", heroRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/files", fileRoutes);

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("✅ Maha e-Seva Backend (GridFS + Socket.IO) Running");
});

// ✅ GridFS Setup
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

    // ✅ Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
  });

// ✅ Socket.IO Logic
io.on("connection", (socket) => {
  console.log("📡 New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});
