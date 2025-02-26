const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const textRoutes = require('./routes/textRoutes');
const userRoutes = require('./routes/userRoutes');
const setupSwagger = require('./swagger');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3002",
  "https://practical-task-backend.vercel.app",
  "https://actowiz.vercel.app",
  "https://actowiz-git-main.vercel.app",
  "https://actowiz-staging.vercel.app"
];

// Simple CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Configure Socket.io with CORS
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

// Basic security headers
app.use((req, res, next) => {
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
  next();
});

app.use(express.json());

// Initialize Swagger documentation
setupSwagger(app);

app.use((req, res, next) => {
  req.io = io;
  next();
});

// Add this simple health check route before your other routes
app.get('/', (req, res) => {
  res.status(200).send('ok');
});

app.use('/api/auth', authRoutes);
app.use('/api/text', textRoutes);
app.use('/api/users', userRoutes);

io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Add this export at the end of your file
module.exports = app;

// Keep your server.listen for local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 8000;
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}