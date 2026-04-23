# CareTrip - Global Medical Care for Travelers

CareTrip is a specialized healthcare platform designed for international travelers to find verified, language-compatible medical care wherever they are. It bridges the gap between travelers and local healthcare providers, ensuring peace of mind during medical emergencies or planned procedures abroad.

---

## 🌟 Key Features

### 🔐 Advanced Authentication
- **Dual Auth Flow**: Seamless Google OAuth integration alongside traditional Email/Password login.
- **Role-Based Access Control (RBAC)**: Distinct interfaces and permissions for **Travelers**, **Doctors**, and **Admins**.
- **Secure Sessions**: JWT-based authentication with secure password hashing using Bcrypt.

### 🏥 Doctor Discovery & Verification
- **Global Search**: Find doctors by specialty, language, and price.
- **Verified Badge**: A rigorous multi-step onboarding process for doctors with manual Admin approval.
- **Interactive Maps**: Google Maps integration to find the nearest clinics and hospitals.

### 📅 Appointment Management
- **Smart Booking**: Select available slots directly from doctor profiles.
- **Dashboard Control**: Comprehensive management systems for travelers to track history and doctors to manage their schedule.

### 🚨 Emergency Support
- **One-Tap Helpline**: Immediate access to emergency services.
- **Clinic Finder**: Quick locator for the closest medical facilities in urgent situations.

### 💬 Engagement & Feedback
- **Review System**: Transparent traveler feedback to maintain high care standards.
- **Real-time Alerts**: Firebase Cloud Messaging (FCM) for booking confirmations and reminders.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js with Vite
- **Styling**: Tailwind CSS (Glassmorphism & Premium UI)
- **Auth**: `@react-oauth/google`
- **Navigation**: `react-router-dom`

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Security**: JWT, Google Auth Library, Bcrypt

---

## 📁 Project Structure

```text
MediTravel/
├── client/                # React Frontend (Vite)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components (Login, Dashboard, etc.)
│   │   └── App.jsx        # Root routing
├── server/                # Node.js Backend (Express)
│   ├── controllers/       # Business logic
│   ├── models/            # MongoDB Schemas
│   ├── routes/            # API Endpoints
│   └── server.js          # Entry point
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)
- Google Cloud Project (for OAuth)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd MediTravel
   ```

2. **Setup the Backend**:
   ```bash
   cd server
   npm install
   # Create a .env file (see Environment Variables below)
   npm run dev
   ```

3. **Setup the Frontend**:
   ```bash
   cd ../client
   npm install
   # Create a .env file (see Environment Variables below)
   npm run dev
   ```

---

## 🔑 Environment Variables

### Client (`client/.env`)
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Server (`server/.env`)
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
```

---