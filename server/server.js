const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./authRoutes");
const Document = require("./Document"); // Ensure Document model is required
const app = express();

// Connect to MongoDB
mongoose.connect("mongodb+srv://pavankamthane:pavan@main.7mnfj.mongodb.net/Collab", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Middleware
app.use(express.json()); // Middleware to parse JSON
app.use(cors({
  origin: "http://localhost:3000", // Allow requests from the React app
}));

// Use authentication routes
app.use("/api/auth", authRoutes);

// Start the HTTP server
const port = process.env.PORT || 3001;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get('/',(req,res)=>{
  res.send('Hello from server')
})

// Set up Socket.io
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const defaultValue = "";

io.on("connection", socket => {
  socket.on("get-document", async documentId => {
    const document = await findOrCreateDocument(documentId);
    socket.join(documentId);
    socket.emit("load-document", document.data);

    socket.on("send-changes", delta => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    socket.on("save-document", async data => {
      await Document.findByIdAndUpdate(documentId, { data });
    });
  });
});

async function findOrCreateDocument(id) {
  if (id == null) return;

  const document = await Document.findById(id);
  if (document) return document;
  return await Document.create({ _id: id, data: defaultValue });
}
