# Café Restaurant System — Setup Guide

## Project Structure

```
cafe-1/
├── backend/          # Express + Mongoose + Socket.io + Cloudinary
├── admin/            # Admin Dashboard (Vite + React + Tailwind)
└── customer/         # Customer Menu Website (Vite + React + Tailwind)
```

## 1. Backend Setup

```bash
cd backend
cp .env.template .env
# Fill in MONGODB_URI and Cloudinary credentials in .env
npm run dev           # Starts on http://localhost:5000
```

## 2. Admin Dashboard

```bash
cd admin
# Edit .env if backend runs on a different port
npm run dev           # Starts on http://localhost:5173
```

## 3. Customer Website

```bash
cd customer
# Edit VITE_WHATSAPP_NUMBER in .env with your real number (e.g. 919876543210)
npm run dev           # Starts on http://localhost:5174
```

## Environment Variables

### `backend/.env`
| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From Cloudinary dashboard |
| `PORT` | Server port (default: 5000) |

### `customer/.env`
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend URL (default: http://localhost:5000) |
| `VITE_WHATSAPP_NUMBER` | Your WhatsApp number with country code, no + or spaces (e.g. 919876543210) |

## API Reference

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/menu` | List food items (optional `?is_available=true`) |
| `POST` | `/api/menu` | Create food item |
| `PUT` | `/api/menu/:id` | Update food item |
| `DELETE` | `/api/menu/:id` | Delete food item |
| `POST` | `/api/upload` | Upload image → returns `{ secure_url }` |
| `GET` | `/api/orders` | List all orders |
| `POST` | `/api/orders` | Create order (emits `new_order` via Socket.io) |
| `PATCH` | `/api/orders/:id/status` | Update order status |
| `PATCH` | `/api/orders/:id/payment` | Toggle payment_done |
| `GET` | `/api/analytics` | Today's revenue, order count, popular item |

## Socket.io Events

| Event | Direction | Payload |
|---|---|---|
| `new_order` | Server → Clients | Full order object |
| `order_updated` | Server → Clients | Updated order object |
# cafe-software-demo
