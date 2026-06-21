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

| Part | Description |
|---|---|
| Backend | REST API built with Node.js, Express, TypeScript, and MongoDB |
| Frontend | Admin dashboard built with React and Vite |

---

## Tech Stack

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

- Modular API architecture
- TypeScript-based codebase
- MongoDB models using Mongoose
- Authentication middleware
- Role-based authorization middleware
- File upload support
- Email service integration
- Centralized route grouping
- Initial database seeding logic

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

This repository contains the source code for both the backend and frontend applications.  
Sensitive configuration values are intentionally excluded from the documentation and repository.
