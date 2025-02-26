# Actowiz API

This is the backend API for the Actowiz application, providing endpoints for authentication, text submissions, and user management.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=8000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

3. Start the server:
   ```
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## API Documentation

The API is documented using OpenAPI 3.0 (Swagger). You can access the interactive documentation at:

```
http://localhost:8000/api-docs
```

The Swagger UI provides:

- An overview of all available API endpoints
- Request and response models
- The ability to test API endpoints directly from the browser
- Authentication instructions for protected routes

## API Endpoints

The API is organized into the following main categories:

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate a user and receive a JWT token
- `GET /api/auth/user` - Get details of the currently authenticated user

### Text Submissions

- `POST /api/text/submit` - Submit text (protected)
- `GET /api/text/submissions` - Get all text submissions (protected)

### User Management (Admin only)

- `GET /api/users` - Get all users
- `GET /api/users/statistics` - Get system statistics
- `GET /api/users/:id` - Get a specific user by ID
- `PUT /api/users/:id/role` - Update a user's role
- `DELETE /api/users/:id` - Delete a user

## Real-time Notifications

The API uses Socket.io to emit events when texts are submitted. Clients can connect to the WebSocket server and listen for the following events:

- `text-alert` - Sent when a new text is submitted, containing the text content and user information

## Authentication

Protected routes require a valid JWT token sent in the Authorization header:

```
Authorization: Bearer your_jwt_token
```

Admin-only routes additionally require that the authenticated user has the "admin" role.

## Error Handling

The API returns appropriate HTTP status codes:
- 200/201: Successful operations
- 400: Bad request (e.g., invalid input, validation errors)
- 401: Unauthorized (missing or invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Resource not found
- 500: Server error 