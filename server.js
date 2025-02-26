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

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Origin blocked by CORS:', origin);
      callback(null, true);  // Temporarily allow all origins for debugging
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods'
  ],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400 // 24 hours
}));

// Configure Socket.io with CORS
const io = socketIo(server, {
  cors: {
    origin: function(origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(null, true);  // Temporarily allow all origins for debugging
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  }
});

// Security headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
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