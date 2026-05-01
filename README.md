# CareTrip - Global Medical Care for Travelers

CareTrip is a specialized healthcare platform designed for international travelers to find verified, language-compatible medical care wherever they are. It bridges the gap between travelers and local healthcare providers, ensuring peace of mind during medical emergencies or planned procedures abroad.

## 🔗 Project Links

- **Live Demo**: [care-trip-frontend.vercel.app](https://care-trip-frontend.vercel.app/)
- **Figma Design**: [UI/UX Prototype](https://www.figma.com/proto/DSdKqksDFdXESRzpUY1ZLN/Untitled?node-id=151-3&viewport=782%2C-230%2C0.08&t=0Z5NodkmPsFaaEDC-0&scaling=scale-down&content-scaling=fixed&starting-point-node-id=151%3A3)
- **API Documentation**: [Postman Collection](https://documenter.getpostman.com/view/50841045/2sBXqKnzCC)

---

## 🌟 Key Features

### 🔐 Advanced Authentication & Session Management
- **Dual Auth Flow**: Seamless Google OAuth integration alongside traditional Email/Password login.
- **Role-Based Access Control (RBAC)**: Distinct interfaces and permissions for **Travelers**, **Doctors**, and **Admins**.
- **JWT Session Persistence**: 
  - **7-Day Sessions**: Tokens are valid for 7 days, allowing users to stay logged in across browser restarts.
  - **Auto-Restoration**: Redux store automatically initializes state from `localStorage` on boot.
  - **Axios Interceptors**: Every API request automatically carries the `Bearer` token via centralized middleware.

### 🏥 Doctor Discovery & Verification
- **Smart Search & Location Services**: 
  - **Mappls (MapmyIndia)** integration for high-precision reverse geocoding to detect user location.
  - **Google Maps** integration for visualizing nearby clinics and hospitals.
  - Comprehensive search by specialty, hospital name, or locality across India.
- **Verified Badge**: A rigorous multi-step onboarding process for doctors with manual Admin approval.

### 📅 Appointment Management
- **Smart Booking**: Select available slots directly from doctor profiles.
- **Automated Reminders**: **30-minute pre-appointment email reminders** powered by `node-cron` and `Resend`.
- **Dashboard Control**: Comprehensive management systems for travelers to track history and doctors to manage their schedule.

### 🚨 Emergency Support
- **SOS Features**: One-tap emergency access and WhatsApp SOS link generation with real-time location sharing.
- **Clinic Finder**: Quick locator for the closest medical facilities in urgent situations.

### 💬 Engagement & Feedback
- **Review System**: Transparent traveler feedback to maintain high care standards.
- **Premium UI/UX**: Dynamic loading animations, character-by-character reveals, and a modern glassmorphic design system.

---

## 🔍 SEO & Meta Management
The platform implements modern SEO best practices to ensure visibility and accessibility:
- **React Helmet Async**: Dynamic meta tag management for every page.
- **Dynamic Titles**: Page-specific titles (e.g., "Find Doctors | CareTrip", "My Bookings | CareTrip").
- **Meta Descriptions**: Optimized descriptions for better search engine indexing.
- **Semantic HTML**: Proper heading hierarchies and ARIA labels for accessibility.

---

## 🛡️ Routing & Security
### Role-Based Protected Routes
Routes are guarded by a centralized `ProtectedRoute` component that validates both the **presence of a token** and the **user's role**:
- `/dashboard/*` → Restricted to **Travelers**.
- `/doctor-dashboard` → Restricted to **Doctors**.
- `/admin-dashboard` → Restricted to **Admins**.
- **Automatic Redirection**: Logged-in users are automatically routed to their respective dashboards if they try to access the login page or unauthorized areas.

---

## 🩺 Trust & Verification System
To solve the problem of finding "Trusted Doctors," we implement a multi-layered verification process:
1.  **NMC Registration**: Doctors must provide their National Medical Commission (NMC) Registration Number during sign-up.
2.  **License Upload**: Secure storage and handling of medical certificates.
3.  **Manual Admin Audit**: Platform admins verify the registration number on the official **NMC National Medical Register (NMR)** portal.
4.  **NMC Web Search Integration**: Every doctor's profile includes a "Verify on NMC" link that directs users to their live government record.
5.  **Verified Badge**: Only successfully audited doctors receive the blue "CareTrip Verified" badge.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js 18 (Vite)
- **State Management**: Redux Toolkit (with persistence)
- **Styling**: Tailwind CSS & Vanilla CSS (Premium UI)
- **SEO**: `react-helmet-async`
- **Auth**: `@react-oauth/google`
- **Navigation**: `react-router-dom` v6
- **Maps**: Mappls API & Google Maps API

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Services**: `node-cron` (Scheduling), `Resend` (Email Service)
- **Security**: JWT (7-day sessions), Google Auth Library, Bcrypt

---

## 📁 Project Structure

```text
CareTrip/
├── client/                # React Frontend (Vite)
│   ├── src/
│   │   ├── components/    # Reusable UI (ProtectedRoute, MapplsMap, etc.)
│   │   ├── pages/         # Page views (Home, FindDoctors, Profile)
│   │   ├── services/      # API Interceptors & Axios instance
│   │   ├── store.js       # Redux state & localStorage persistence
│   │   └── App.jsx        # Root routing & SEO setup
├── server/                # Node.js Backend (Express)
│   ├── src/
│   │   ├── controllers/   # Business logic (Auth, Bookings, Admin)
│   │   ├── middleware/    # JWT & Role-based authentication
│   │   ├── models/        # MongoDB Schemas
│   │   ├── routes/        # API Endpoints
│   │   └── server.js      # Entry point
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Mappls (MapmyIndia) API Keys
- Google Cloud Console credentials

### Installation

1. **Clone & Install**:
   ```bash
   git clone <repository-url>
   cd CareTrip
   # Install both client and server dependencies
   cd client && npm install
   cd ../server && npm install
   ```

2. **Environment Configuration**:
   Create `.env` files in both `client/` and `server/` directories.

3. **Run Development**:
   - Backend: `npm run dev` (running on http://localhost:5000)
   - Frontend: `npm run dev` (running on http://localhost:5173)

---

## 🔑 Environment Variables

### Client (`client/.env`)
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_URL=http://localhost:5000/api
```

### Server (`server/.env`)
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
RESEND_API_KEY=your_resend_key
```
