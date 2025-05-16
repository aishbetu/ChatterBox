# ChatterBox

A real-time chat application featuring authentication, REST APIs, and live messaging with Socket.IO. This repository includes both the **backend** and **frontend** codebases.

---

## Table of Contents

1. [Overview](#overview)
2. [Environment Setup](#environment-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Running the Application](#running-the-application)
6. [REST API Endpoints](#rest-api-endpoints)
7. [Socket.IO Events](#socketio-events)
8. [Project Structure](#project-structure)

---

## Overview

* **Backend**: Node.js, Express, MongoDB (via Mongoose), JWT-based auth, Socket.IO for real-time features.
* **Frontend**: React with TypeScript, Vite, Axios for HTTP, ChatScope UI Kit for chat components, Socket.IO client.

---

## Environment Setup

**Backend** and **frontend** each require an `.env` file containing sensitive keys (database URI, JWT secret, API URLs, etc.).

---

## Backend Setup

1. Navigate to the `backend` folder and install dependencies:

   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` (example: `.env.example`) with keys for:

   * HTTP server port
   * MongoDB connection string
   * JWT secret and expiration
3. Start the development server:

   ```bash
   npm run dev
   ```

The server listens on the configured port and exposes REST and WebSocket endpoints.

---

## Frontend Setup

1. In the `frontend` folder, install dependencies:

   ```bash
   cd frontend
   npm install
   ```
2. Create a `.env` file specifying the base API URL (e.g. pointing to the backend’s `/api`).
3. Run the development server:

   ```bash
   npm run dev
   ```

The Vite server will proxy API requests and serve the React app.

---

## Running the Application

1. Ensure MongoDB is running.
2. Launch the **backend**: `npm run dev` in the backend directory.
3. Launch the **frontend**: `npm run dev` in the frontend directory.
4. Open the app in your browser and begin chatting!

---

## REST API Endpoints

All endpoints are prefixed with `/api`:

* **Authentication** (`/api/auth`)

  * `POST /signup`: Register a new user
  * `POST /login`: Obtain JWT

* **Chat** (`/api/chat`)

  * `GET /users`: List other users with last message and unread count
  * `GET /messages/:userId`: Retrieve message history with a specific user

Protected routes require an `Authorization: Bearer <JWT>` header.

---

## Socket.IO Events

Clients connect to the Socket.IO server at the same host as the backend, passing the JWT for authentication:

```js
const socket = io(BACKEND_URL, { auth: { token } });
```

**Server → Client**:

* `onlineUsers`: Array of currently online user IDs
* `receiveMessage`: A new chat message object
* `typing`: `{ from, typing }` to show typing indicators
* `messageRead`: `{ messageId, by, at }` when a message is read
* `messageReadAck`: Acknowledgement of the client’s `messageRead` event

**Client → Server**:

* `sendMessage`: `{ to, text }` to send a new message
* `typing`: `{ to, typing }` to indicate typing status
* `messageRead`: `{ messageId, from, to }` to mark a message as read

---

## Project Structure

```
root/
├── backend/         # Express server, MongoDB models, routes, Socket.IO setup
│   ├── controllers/ # REST API handlers
│   ├── models/      # Mongoose schemas
│   ├── routes/      # Express routers
│   ├── utils/       # Middleware (auth, socket auth)
│   └── index.js     # App entry point
└── frontend/        # React + Vite application
    ├── src/
    │   ├── api/         # Axios service modules
    │   ├── components/  # UI components (ChatScope wrappers)
    │   ├── context/     # Auth and Socket providers
    │   ├── pages/       # React page components (Login, Chat, etc.)
    │   ├── routes/      # React Router setup
    │   ├── App.tsx
    │   └── main.tsx     # App bootstrap
    └── .env            # Vite environment variables
```

---

Happy chatting! 🚀