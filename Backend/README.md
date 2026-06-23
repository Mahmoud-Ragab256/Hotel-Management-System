# Hotel Management System

![Node.js](https://img.shields.io/badge/Node.js-Backend-informational)
![Express](https://img.shields.io/badge/Express.js-API-informational)
![TypeScript](https://img.shields.io/badge/TypeScript-Core-informational)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-informational)
![React](https://img.shields.io/badge/React-Frontend-informational)
![Vite](https://img.shields.io/badge/Vite-Build_Tool-informational)

A full-stack hotel management platform designed to organize hotel operations through a structured backend API and a React-based dashboard interface.

---

## Overview

Hotel Management System provides a clean administrative workflow for managing core hotel operations such as guests, employees, rooms, room categories, bookings, invoices, services, service orders, reviews, notifications, and authentication.

The project is divided into two main applications:

<<<<<<<< HEAD:Backend/README.md
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
- Avatar upload & retrieval for guest profiles via Cloudinary
- Password reset flow via email OTP
- Secure registration & login with JWT authentication

### 🔐 Admin Dashboard
- Full CRUD operations on rooms, categories, services, and reservations
- Employee & guest account management with avatar upload support
- Room image management — upload up to 10 images per room via Cloudinary
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
| File Upload | Multer + Cloudinary |
| Dev Tools | Nodemon, tsx |
========
| Part | Description |
|---|---|
| Backend | REST API built with Node.js, Express, TypeScript, and MongoDB |
| Frontend | Admin dashboard built with React and Vite |
>>>>>>>> origin/add-frontend:README.md

---

## Tech Stack

<<<<<<<< HEAD:Backend/README.md
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
│   │   ├── upload.middleware.ts
│   │   ├── cloudinary.ts
│   │   └── sendEmail.ts
│   └── index.ts
├── Documentation/
├── .gitignore
├── nodemon.json
├── package.json
├── tsconfig.json
└── README.md
========
### Backend

| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express.js | API framework |
| TypeScript | Static typing |
| MongoDB | Database |
| Mongoose | Database modeling |
| JWT | Authentication |
| Bcrypt | Password hashing |
| Joi | Request validation |
| Multer | File upload handling |
| Cloudinary | Image storage |
| Nodemailer | Email service |
| Helmet | HTTP security headers |
| Morgan | Request logging |
| Express Rate Limit | API request protection |

### Frontend

| Technology | Purpose |
|---|---|
| React.js | User interface |
| Vite | Development and build tool |
| React Router | Application routing |
| Axios | API communication |
| CSS | Styling |

---

## Project Structure

```txt
hotel-management-system/
│
├── Backend/
│   ├── Documentation/
│   │
│   ├── src/
│   │   ├── DB/
│   │   │   ├── Models/
│   │   │   └── connection.ts
│   │   │
│   │   ├── Modules/
│   │   │   ├── client/
│   │   │   ├── dashboard/
│   │   │   └── index.routes.ts
│   │   │
│   │   ├── utils/
│   │   ├── index.ts
│   │   ├── seedAdmin.ts
│   │   └── seedDatabase.ts
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── data/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
└── .gitignore
>>>>>>>> origin/add-frontend:README.md
```

---

## Core Modules

### Authentication

The system includes authentication flows for dashboard users and guests, including login and password recovery logic.

### Guests

Guest records can be managed through the system, including profile data and booking-related information.

### Employees

The dashboard supports employee management with roles, shifts, salary data, and account status.

### Rooms

Rooms can be managed with details such as room number, category, status, floor, images, and smart device metadata.

### Room Categories

Room categories define pricing, capacity, amenities, images, and descriptions for different room types.

### Bookings

The booking module handles reservation creation, updates, cancellation, and booking status tracking.

### Invoices

Invoices are connected to bookings and include payment status, payment method, total amount, and paid amount.

### Services

Hotel services such as room service, spa, laundry, restaurant, and transport can be managed through the dashboard.

### Service Orders

Service orders track guest service requests and their current processing status.

### Reviews

Guest reviews can be created, reviewed, approved, rejected, or managed by the dashboard.

### Notifications

The system supports notifications for guests and employees based on booking, payment, service, review, system, and promotion events.

---

## API Route Groups

### Main Route

```txt
GET /
```

### Client Routes

| Route Group | Purpose |
|---|---|
| `/client/auth` | Guest authentication |
| `/client/landing` | Landing page data |
| `/client/rooms` | Room browsing and search |
| `/client/booking` | Guest booking operations |
| `/client/profile` | Guest profile operations |

### Dashboard Routes

| Route Group | Purpose |
|---|---|
| `/dashboard/auth` | Dashboard authentication |
| `/dashboard/guests` | Guests management |
| `/dashboard/employees` | Employees management |
| `/dashboard/room-categories` | Room categories management |
| `/dashboard/rooms` | Rooms management |
| `/dashboard/bookings` | Bookings management |
| `/dashboard/invoices` | Invoices management |
| `/dashboard/services` | Services management |
| `/dashboard/service-orders` | Service orders management |
| `/dashboard/reviews` | Reviews management |
| `/dashboard/notifications` | Notifications management |

---

## Backend Highlights

<<<<<<<< HEAD:Backend/README.md
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

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```
========
- Modular API architecture
- TypeScript-based codebase
- MongoDB models using Mongoose
- Authentication middleware
- Role-based authorization middleware
- File upload support
- Email service integration
- Centralized route grouping
- Initial database seeding logic
>>>>>>>> origin/add-frontend:README.md

---

## Frontend Highlights

- React dashboard interface
- Protected routes
- Sidebar-based dashboard navigation
- Reusable UI components
- API service layer
- Authentication service layer
- Organized pages for hotel management modules

---

## Repository Notes

<<<<<<<< HEAD:Backend/README.md
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
 
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/available` | Get all currently available rooms | 🔒 Protected |
| `POST` | `/search` | Search rooms by filters (type, price, date…) | 🔒 Protected |
| `GET` | `/:id` | Get full details for a specific room | 🔒 Protected |
 
---
 
#### Bookings — `/api/client/booking`
 
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/` | Create a new booking | 🔒 Protected |
| `GET` | `/:id` | Get booking details by ID | 🔒 Protected |
| `GET` | `/user/:guestId` | Get all bookings belonging to a guest | 🔒 Protected |
| `PUT` | `/:id/cancel` | Cancel a booking | 🔒 Protected |
 
---
 
#### Profile — `/api/client/profile`
 
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/me` | Get the current logged-in guest's profile | 🔒 Protected |
| `GET` | `/me/avatar` | Get the current guest's avatar image | |
| `PUT` | `/:id` | Update guest profile info + upload avatar (`multipart/form-data`, field: `avatar`) | |
| `GET` | `/:id/bookings` | Get a guest's full booking history | |
| `GET` | `/:id/reviews` | Get all reviews submitted by a guest | |

---
 
### 🖥️ Dashboard API
 
> 🔒 **All Dashboard routes are Protected** — a valid JWT must be sent in the `Authorization: Bearer <token>` header for every request.
 
#### Auth — `/api/dashboard/auth`
 
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/login` | Employee / Admin login | |
| `POST` | `/forgot-password` | Send a password reset OTP | |
| `POST` | `/reset-code` | Verify the reset OTP code | |
| `POST` | `/reset-password` | Set a new password | |
 
---
 
#### Bookings — `/api/dashboard/booking`
 
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/` | Get all bookings | 🔒 Protected |
| `GET` | `/:id` | Get a booking by ID | 🔒 Protected |
| `POST` | `/` | Create a new booking | 🔒 Protected |
| `PUT` | `/:id` | Update booking details | 🔒 Protected |
| `PUT` | `/:id/cancel` | Cancel a booking | 🔒 Protected |
| `DELETE` | `/:id` | Permanently delete a booking | 🔒 Protected |
 
---
 
#### Employees — `/api/dashboard/employee`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Get all employees |
| `GET` | `/:id` | Get an employee by ID |
| `GET` | `/:id/avatar` | Get an employee's avatar image |
| `POST` | `/register` | Create a new employee account |
| `POST` | `/login` | Employee login |
| `PUT` | `/:id` | Update employee details + upload avatar (`multipart/form-data`, field: `avatar`) |
| `DELETE` | `/:id` | Delete an employee |

---
 
#### Guests — `/api/dashboard/guest`
 
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/` | Get all registered guests | 🔒 Protected |
| `GET` | `/:id` | Get a guest by ID | 🔒 Protected |
| `POST` | `/register` | Create a guest account | 🔒 Protected |
| `POST` | `/login` | Guest login | |
| `PUT` | `/:id` | Update guest details | 🔒 Protected |
| `DELETE` | `/:id` | Delete a guest | 🔒 Protected |
 
---
 
#### Invoices — `/api/dashboard/invoice`
 
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/` | Get all invoices | 🔒 Protected |
| `GET` | `/:id` | Get an invoice by ID | 🔒 Protected |
| `GET` | `/booking/:bookingId` | Get the invoice linked to a specific booking | 🔒 Protected |
| `POST` | `/` | Create a new invoice | 🔒 Protected |
| `PUT` | `/:id` | Update an invoice | 🔒 Protected |
| `DELETE` | `/:id` | Delete an invoice | 🔒 Protected |
 
---
 
#### Notifications — `/api/dashboard/notification`
 
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/` | Get all notifications | 🔒 Protected |
| `GET` | `/:id` | Get a notification by ID | 🔒 Protected |
| `GET` | `/recipient/:recipientId` | Get all notifications for a recipient | 🔒 Protected |
| `GET` | `/recipient/:recipientId/unread` | Get unread notifications for a recipient | 🔒 Protected |
| `POST` | `/` | Create a new notification | 🔒 Protected |
| `PUT` | `/:id/read` | Mark a single notification as read | 🔒 Protected |
| `PUT` | `/recipient/:recipientId/read-all` | Mark all of a recipient's notifications as read | 🔒 Protected |
| `DELETE` | `/:id` | Delete a notification | 🔒 Protected |
 
---
 
#### Reviews — `/api/dashboard/review`
 
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/` | Get all reviews | 🔒 Protected |
| `GET` | `/approved` | Get only approved reviews | 🔒 Protected |
| `GET` | `/:id` | Get a review by ID | 🔒 Protected |
| `POST` | `/` | Create a new review | 🔒 Protected |
| `PUT` | `/:id` | Update a review | 🔒 Protected |
| `PUT` | `/:id/approve` | Approve a pending review | 🔒 Protected |
| `DELETE` | `/:id` | Delete a review | 🔒 Protected |
 
---
 
#### Rooms — `/api/dashboard/room`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Get all rooms |
| `GET` | `/available` | Get available rooms only |
| `GET` | `/:id` | Get a room by ID |
| `GET` | `/:id/images` | Get all images for a room |
| `POST` | `/` | Create a new room |
| `PUT` | `/:id` | Update room details |
| `PUT` | `/:id/images` | Upload room images (`multipart/form-data`, field: `images`, max: 10) |
| `DELETE` | `/:id` | Delete a room |

---
 
#### Room Categories — `/api/dashboard/room-category`
 
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/` | Get all room categories | 🔒 Protected |
| `GET` | `/:id` | Get a category by ID | 🔒 Protected |
| `POST` | `/` | Create a new category | 🔒 Protected |
| `PUT` | `/:id` | Update a category | 🔒 Protected |
| `DELETE` | `/:id` | Delete a category | 🔒 Protected |
 
---
 
#### Services — `/api/dashboard/service`
 
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/` | Get all services | 🔒 Protected |
| `GET` | `/available` | Get currently available services | 🔒 Protected |
| `GET` | `/:id` | Get a service by ID | 🔒 Protected |
| `POST` | `/` | Create a new service | 🔒 Protected |
| `PUT` | `/:id` | Update a service | 🔒 Protected |
| `DELETE` | `/:id` | Delete a service | 🔒 Protected |
 
---
 
#### Service Orders — `/api/dashboard/service-order`
 
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/` | Get all service orders | 🔒 Protected |
| `GET` | `/:id` | Get a service order by ID | 🔒 Protected |
| `POST` | `/` | Create a new service order | 🔒 Protected |
| `PUT` | `/:id` | Update a service order | 🔒 Protected |
| `DELETE` | `/:id` | Delete a service order | 🔒 Protected |

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

## 🤝 Contributing

Contributions are welcome! If you'd like to improve this project:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<div align="center">

Made with ❤️ as a **DEPI Graduation Project**

</div>
========
This repository contains the source code for both the backend and frontend applications.  
Sensitive configuration values are intentionally excluded from the documentation and repository.
>>>>>>>> origin/add-frontend:README.md
