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

// Define allowed origins including Vercel deployment URLs
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3002",
  "https://practical-task-backend.vercel.app",
  "https://actowiz.vercel.app",
  "https://actowiz-git-main.vercel.app",
  "https://actowiz-staging.vercel.app",
  // Add Vercel preview deployments pattern
  /^https:\/\/actowiz.*\.vercel\.app$/
];

// CORS configuration for production and development
const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) {
      return callback(null, true);
    }

    // Check if the origin matches our allowed origins (including regex patterns)
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return allowedOrigin === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept'
  ]
};

app.use(cors(corsOptions));

// Socket.IO configuration with same CORS settings
const io = socketIo(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      
      const isAllowed = allowedOrigins.some(allowedOrigin => {
        if (allowedOrigin instanceof RegExp) {
          return allowedOrigin.test(origin);
        }
        return allowedOrigin === origin;
      });
      
      if (isAllowed) {
        callback(null, true);
      } else {
        console.log('Socket.IO - Blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ["GET", "POST"],
    transports: ['websocket', 'polling']
  },
  allowEIO3: true
});

app.use(express.json());

// Initialize Swagger documentation
setupSwagger(app);

// Attach Socket.IO to request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Health check route
app.get('/', (req, res) => {
  res.status(200).send('ok');
});

app.use('/api/auth', authRoutes);
app.use('/api/text', textRoutes);
app.use('/api/users', userRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
  
  socket.on('disconnect', (reason) => {
    console.log('Client disconnected:', socket.id, 'Reason:', reason);
  });
});

// Export app for testing
module.exports = app;

// Start server in development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 8000;
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}