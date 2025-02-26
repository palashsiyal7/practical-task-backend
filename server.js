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
  // Add a wildcard to allow requests from Vercel preview deployments
  /^https:\/\/actowiz-.*\.vercel\.app$/
];

// Function to validate origins against the list (including regex patterns)
const corsOriginValidator = (origin, callback) => {
  // Allow requests with no origin (like mobile apps, curl requests, etc)
  if (!origin) return callback(null, true);
  
  // Check if the origin matches any in our list (including regex patterns)
  const isAllowed = allowedOrigins.some(allowedOrigin => {
    if (allowedOrigin instanceof RegExp) {
      return allowedOrigin.test(origin);
    }
    return allowedOrigin === origin;
  });
  
  if (isAllowed) {
    return callback(null, true);
  }
  
  console.log(`Origin ${origin} not allowed by CORS`);
  callback(new Error('Not allowed by CORS'));
};

// Configure CORS for Express
app.use(cors({
  origin: corsOriginValidator,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Configure Socket.io with the same CORS settings
const io = socketIo(server, {
  cors: {
    origin: corsOriginValidator,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
  }
});

// Add security headers middleware
app.use((req, res, next) => {
  // Set referrer policy
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
  
  // Set CORS headers explicitly to ensure they're not overridden
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // For preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  }
  
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