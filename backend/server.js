const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);

// ── Socket.io ──────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: ['https://menufy-admin-app.vercel.app', 'https://menufy-customer-app.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
});

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['https://menufy-admin-app.vercel.app', 'https://menufy-customer-app.vercel.app'],
}));
app.use(express.json());

// Make io available to route handlers via req.app.get('io')
app.set('io', io);

// ── MongoDB ────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅  MongoDB connected'))
  .catch((err) => console.error('❌  MongoDB connection error:', err));

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/upload',    require('./routes/upload'));
app.use('/api/menu',      require('./routes/menu'));
app.use('/api/orders',    require('./routes/orders'));
app.use('/api/analytics', require('./routes/analytics'));

// ── Socket.io events ───────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`🔌  Client connected:    ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`🔌  Client disconnected: ${socket.id}`);
  });
});

// ── Start ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀  Server running on http://localhost:${PORT}`);
});
