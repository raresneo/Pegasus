# Pegasus Core - Professional Asset & Client Management

A versatile, AI-powered enterprise management system designed for businesses offering machine-based services. Pegasus Core integrates Client CRM, Asset Maintenance, Point of Sale (POS), and Advanced Scheduling into a unified platform.

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## 🚀 Key Features

- **Member Management (CRM)**: Comprehensive profiles, membership tracking, and history.
- **Smart Scheduling**: Booking system for classes, appointments, and asset usage.
- **Point of Sale (POS)**: Integrated product sales and inventory management.
- **Asset Management**: Track maintenance, usage, and status of business assets.
- **AI-Powered Insights**: Leveraging Google Gemini for intelligent reporting and copilot features.
- **Financial & Reports**: Detailed analytics on revenue, attendance, and growth.
- **Role-Based Access**: Secure access control for Admins, Trainers, and Members.
- **Communication Hub**: Integrated chat and notification system.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, TailwindCSS
- **Backend**: Node.js, Express.js
- **Database**: Firebase Firestore
- **AI Integration**: Google GenAI (Gemini)
- **Authentication**: JWT & Firebase Auth

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+ recommended)
- Firebase Project with Firestore enabled

### 1. Clone the repository
```bash
git clone https://github.com/raresneo/Pegasus.git
cd Pegasus
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file (or `.env.local`) in the root directory and configure the following variables:

```env
# AI Configuration
GEMINI_API_KEY=your_gemini_api_key

# Firebase & Server Configuration
FIREBASE_SERVICE_ACCOUNT='{...}' # JSON string of service account
JWT_SECRET=your_secure_jwt_secret
PORT=3000 # Optional, defaults to 3000
```

### 4. Running the Application

**Development Mode (Run both Frontend & Backend)**
```bash
npm run start:all
```

**Frontend Only**
```bash
npm run dev
```

**Backend Only**
```bash
npm run start:backend
```

## 🏗️ Project Structure

- `/api` - Backend API routes (Express.js) & Controllers
- `/components` - Reusable React components & UI logic
- `/pages` - Main application pages & layouts
- `/hooks` - Custom React hooks
- `/context` - Global state management (Auth, Notifications, etc.)
- `/lib` - Utility functions, API clients, and configurations

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Proprietary software. All rights reserved.
