<div align="center">

# 🏨 Hotel Management System

### A Production-Ready RESTful API for Modern Hotel Operations

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

> **DEPI Graduation Project** — A robust backend system that handles everything from guest reservations to admin operations, built with scalability and security in mind.

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
  - [Client API](#-client-api)
  - [Dashboard API](#️-dashboard-api)
- [Scripts](#-scripts)
- [Security](#-security)
- [Contributing](#-contributing)

---

## 🌟 Overview

The **Hotel Management System** is a comprehensive RESTful API designed to digitize and streamline hotel operations. It serves two primary audiences:

- **Guests** — Seamless room browsing, booking, and service requests.
- **Admins & Staff** — Full control over rooms, reservations, invoicing, and role-based staff management.

Built with **TypeScript** on top of **Node.js/Express** and powered by **MongoDB**, the system is architected for reliability, security, and ease of extension.

---

## ✨ Features

### 🛎️ Guest Portal
- Browse available rooms with filtering and full-text search
- Make, view, update, and cancel reservations
- Full guest profile management with booking & review history
- Password reset flow via email OTP
- Secure registration & login with JWT authentication

### 🔐 Admin Dashboard
- Full CRUD operations on rooms, categories, services, and reservations
- Employee & guest account management
- Invoice generation and tracking per booking
- Review moderation (approve / reject)
- Notification system with unread tracking per recipient
- Role-based access control for staff operations

### 🛡️ Security & Performance
- Password hashing with **bcrypt**
- HTTP security headers via **Helmet**
- Request rate limiting with **express-rate-limit**
- Input validation with **Joi**
- CORS support for cross-origin requests
- Request logging via **Morgan**

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript 5.x |
| Runtime | Node.js 18+ |
| Framework | Express 4.x |
| Database | MongoDB + Mongoose 8.x |
| Authentication | JSON Web Tokens (JWT) |
| Validation | Joi |
| Security | Helmet, bcrypt, express-rate-limit |
| Email | Nodemailer |
| Dev Tools | Nodemon, tsx |

---

## 📁 Project Structure

```
Hotel-Management-System/
├── src/
│   ├── DB/
│   │   ├── connection.ts
│   │   └── Models/
│   │       ├── booking.model.ts
│   │       ├── employee.model.ts
│   │       ├── guest.model.ts
│   │       ├── invoice.model.ts
│   │       ├── notification.model.ts
│   │       ├── review.model.ts
│   │       ├── room.model.ts
│   │       ├── roomCategory.model.ts
│   │       ├── service.model.ts
│   │       └── serviceOrder.model.ts
│   ├── Modules/
│   │   ├── client/
│   │   │   ├── auth/
│   │   │   ├── booking/
│   │   │   ├── landing/
│   │   │   ├── profile/
│   │   │   ├── rooms/
│   │   │   └── client.routes.ts
│   │   ├── dashboard/
│   │   │   ├── auth/
│   │   │   ├── booking/
│   │   │   ├── employee/
│   │   │   ├── guest/
│   │   │   ├── invoice/
│   │   │   ├── notification/
│   │   │   ├── review/
│   │   │   ├── room/
│   │   │   ├── roomCategory/
│   │   │   ├── service/
│   │   │   ├── serviceOrder/
│   │   │   └── dashboard.routes.ts
│   │   └── index.routes.ts
│   ├── utils/
│   │   ├── auth.middleware.ts
│   │   └── sendEmail.ts
│   └── index.ts
├── Documentation/
├── .gitignore
├── nodemon.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) v9 or higher
- [MongoDB](https://www.mongodb.com/) (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/Mahmoud-Ragab256/Hotel-Management-System.git
cd Hotel-Management-System
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

```bash
cp .env.example .env
# Edit .env with your values — see Environment Variables section below
```

**4. Run in development mode**

```bash
npm run dev
```

**5. Build & run in production**

```bash
npm run build
npm start
```

---

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/hotel-management

# Authentication
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

---

## 📡 API Reference

**Base URL:** `http://localhost:3000/api`

> 🔒 Routes marked with **Protected** require a valid JWT in the `Authorization: Bearer <token>` header.

---

### 🧑‍💻 Client API

#### Auth — `/api/client/auth`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/register` | Register a new guest account |
| `POST` | `/login` | Login and receive a JWT token |
| `POST` | `/forgot-password` | Send a password reset OTP to email |
| `POST` | `/reset-code` | Verify the reset OTP code |
| `POST` | `/reset-password` | Set a new password after verification |

---

#### Landing — `/api/client`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/landing` | Get landing page data |
| `GET` | `/statistics` | Get general hotel statistics |
| `GET` | `/featured-categories` | Get featured room categories |

---

#### Rooms — `/api/client/rooms`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/available` | Get all currently available rooms |
| `POST` | `/search` | Search rooms by filters (type, price, date…) |
| `GET` | `/:id` | Get full details for a specific room |

---

#### Bookings — `/api/client/booking`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/` | Create a new booking |
| `GET` | `/:id` | Get booking details by ID |
| `GET` | `/user/:guestId` | Get all bookings belonging to a guest |
| `PUT` | `/:id/cancel` | Cancel a booking |

---

#### Profile — `/api/client/profile`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/me` | Get the current logged-in guest's profile | 🔒 Protected |
| `PUT` | `/:id` | Update guest profile info | |
| `GET` | `/:id/bookings` | Get a guest's full booking history | |
| `GET` | `/:id/reviews` | Get all reviews submitted by a guest | |

---

### 🖥️ Dashboard API

#### Auth — `/api/dashboard/auth`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/login` | Employee / Admin login |
| `POST` | `/forgot-password` | Send a password reset OTP |
| `POST` | `/reset-code` | Verify the reset OTP code |
| `POST` | `/reset-password` | Set a new password |

---

#### Bookings — `/api/dashboard/booking`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Get all bookings |
| `GET` | `/:id` | Get a booking by ID |
| `POST` | `/` | Create a new booking |
| `PUT` | `/:id` | Update booking details |
| `PUT` | `/:id/cancel` | Cancel a booking |
| `DELETE` | `/:id` | Permanently delete a booking |

---

#### Employees — `/api/dashboard/employee`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Get all employees |
| `GET` | `/:id` | Get an employee by ID |
| `POST` | `/register` | Create a new employee account |
| `POST` | `/login` | Employee login |
| `PUT` | `/:id` | Update employee details |
| `DELETE` | `/:id` | Delete an employee |

---

#### Guests — `/api/dashboard/guest`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Get all registered guests |
| `GET` | `/:id` | Get a guest by ID |
| `POST` | `/register` | Create a guest account |
| `POST` | `/login` | Guest login |
| `PUT` | `/:id` | Update guest details |
| `DELETE` | `/:id` | Delete a guest |

---

#### Invoices — `/api/dashboard/invoice`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Get all invoices |
| `GET` | `/:id` | Get an invoice by ID |
| `GET` | `/booking/:bookingId` | Get the invoice linked to a specific booking |
| `POST` | `/` | Create a new invoice |
| `PUT` | `/:id` | Update an invoice |
| `DELETE` | `/:id` | Delete an invoice |

---

#### Notifications — `/api/dashboard/notification`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Get all notifications |
| `GET` | `/:id` | Get a notification by ID |
| `GET` | `/recipient/:recipientId` | Get all notifications for a recipient |
| `GET` | `/recipient/:recipientId/unread` | Get unread notifications for a recipient |
| `POST` | `/` | Create a new notification |
| `PUT` | `/:id/read` | Mark a single notification as read |
| `PUT` | `/recipient/:recipientId/read-all` | Mark all of a recipient's notifications as read |
| `DELETE` | `/:id` | Delete a notification |

---

#### Reviews — `/api/dashboard/review`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Get all reviews |
| `GET` | `/approved` | Get only approved reviews |
| `GET` | `/:id` | Get a review by ID |
| `POST` | `/` | Create a new review |
| `PUT` | `/:id` | Update a review |
| `PUT` | `/:id/approve` | Approve a pending review |
| `DELETE` | `/:id` | Delete a review |

---

#### Rooms — `/api/dashboard/room`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Get all rooms |
| `GET` | `/available` | Get available rooms only |
| `GET` | `/:id` | Get a room by ID |
| `POST` | `/` | Create a new room |
| `PUT` | `/:id` | Update room details |
| `DELETE` | `/:id` | Delete a room |

---

#### Room Categories — `/api/dashboard/room-category`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Get all room categories |
| `GET` | `/:id` | Get a category by ID |
| `POST` | `/` | Create a new category |
| `PUT` | `/:id` | Update a category |
| `DELETE` | `/:id` | Delete a category |

---

#### Services — `/api/dashboard/service`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Get all services |
| `GET` | `/available` | Get currently available services |
| `GET` | `/:id` | Get a service by ID |
| `POST` | `/` | Create a new service |
| `PUT` | `/:id` | Update a service |
| `DELETE` | `/:id` | Delete a service |

---

#### Service Orders — `/api/dashboard/service-order`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Get all service orders |
| `GET` | `/:id` | Get a service order by ID |
| `POST` | `/` | Create a new service order |
| `PUT` | `/:id` | Update a service order |
| `DELETE` | `/:id` | Delete a service order |

---

## 📜 Scripts

```bash
# Start production server
npm start

# Start development server with hot reload
npm run dev

# Compile TypeScript to JavaScript
npm run build

# Compile TypeScript in watch mode
npm run build:watch
```

---

## 🛡️ Security

This project implements several security best practices:

- **Helmet** — Sets secure HTTP response headers
- **express-rate-limit** — Prevents brute-force and DoS attacks
- **bcrypt** — Secure password hashing (never stored in plain text)
- **JWT** — Stateless authentication with configurable expiry
- **Joi Validation** — Input sanitization and schema validation on all endpoints
- **CORS** — Configured to allow only trusted origins
- **Email OTP** — Secure forgot-password flow via Nodemailer

---

<div align="center">

Made with ❤️ as a **DEPI Graduation Project**

</div>