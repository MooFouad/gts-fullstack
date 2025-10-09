# GTS Dashboard

A fullstack application for managing Vehicles, Home Rents, and Electricity records with notification features.

## 🏗️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **Security**: Helmet, express-mongo-sanitize, express-rate-limit
- **Validation**: express-validator
- **Notifications**: Nodemailer, Web Push
- **Excel Import/Export**: xlsx, multer

### Frontend
- **React 19** with Vite
- **UI**: Tailwind CSS, Lucide React
- **State Management**: Custom hooks
- **Offline Support**: Service Workers, IndexedDB
- **PWA**: Web Push Notifications

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account OR local MongoDB installation
- Gmail account with App Password (for email notifications)

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd fullstack
```

### 2. Backend Setup

```bash
cd backend
npm install
```

#### Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
# OR for local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/gts-dashboard

# Server Configuration
PORT=5000
NODE_ENV=development

# VAPID Keys for Push Notifications
# Generate keys using: node generate-vapid-keys.js
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=mailto:admin@yourdomain.com

# Email Configuration (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com

# App Configuration
APP_URL=http://localhost:5173
NOTIFICATION_DAYS_BEFORE=10
NOTIFICATION_CHECK_HOUR=9
```

#### Generate VAPID Keys

```bash
node generate-vapid-keys.js
```

Copy the generated keys to your `.env` file.

#### Start Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

#### Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your VAPID public key:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=GTS Dashboard
VITE_APP_VERSION=1.0.0

# MUST match backend VAPID_PUBLIC_KEY
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key

VITE_USE_API=true
```

#### Start Frontend Development Server

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 📧 Email Setup (Gmail)

To use email notifications:

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and generate a password
3. Use this app password in your backend `.env` file

## 🗄️ Database Seeding (Optional)

To populate the database with sample data:

```bash
cd backend
npm run seed
```

## 🔒 Security Features

- **Helmet.js**: HTTP security headers
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: All POST/PUT requests validated
- **NoSQL Injection Protection**: express-mongo-sanitize
- **CORS**: Configured for specific origins
- **Environment Variables**: Sensitive data not committed to git
- **Centralized Error Handling**: No stack trace exposure in production

## 📁 Project Structure

```
fullstack/
├── backend/
│   ├── config/
│   │   └── validateEnv.js       # Environment validation
│   ├── middleware/
│   │   ├── errorHandler.js      # Centralized error handling
│   │   └── validate.js          # Validation middleware
│   ├── models/
│   │   ├── Vehicle.js
│   │   ├── HomeRent.js
│   │   ├── Electricity.js
│   │   └── PushSubscription.js
│   ├── routes/
│   │   ├── vehicleRoutes.js
│   │   ├── homeRentRoutes.js
│   │   ├── electricityRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── importRoutes.js
│   ├── services/
│   │   ├── notificationService.js
│   │   └── notificationScheduler.js
│   ├── validators/
│   │   ├── vehicleValidator.js
│   │   ├── homeRentValidator.js
│   │   └── electricityValidator.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    │   ├── manifest.json
    │   └── sw.js               # Service Worker
    ├── src/
    │   ├── components/
    │   │   ├── common/         # Reusable components
    │   │   ├── electricity/
    │   │   ├── homeRents/
    │   │   ├── layout/
    │   │   └── vehicles/
    │   ├── hooks/
    │   │   ├── useApiState.js
    │   │   └── useDataManagement.js
    │   ├── services/
    │   │   ├── api.js
    │   │   ├── notificationService.js
    │   │   └── pushNotificationService.js
    │   ├── utils/
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env.example
    ├── package.json
    └── vite.config.js
```

## 🛠️ Available Scripts

### Backend

```bash
npm start        # Start production server
npm run dev      # Start development server with nodemon
npm run seed     # Seed database with sample data
```

### Frontend

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🌐 API Endpoints

### Vehicles

- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/:id` - Get single vehicle
- `POST /api/vehicles` - Create new vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle
- `GET /api/vehicles/count/total` - Get vehicle count

### Home Rents

- `GET /api/home-rents` - Get all home rents
- `GET /api/home-rents/:id` - Get single home rent
- `POST /api/home-rents` - Create new home rent
- `PUT /api/home-rents/:id` - Update home rent
- `DELETE /api/home-rents/:id` - Delete home rent

### Electricity

- `GET /api/electricity` - Get all electricity records
- `GET /api/electricity/:id` - Get single electricity record
- `POST /api/electricity` - Create new electricity record
- `PUT /api/electricity/:id` - Update electricity record
- `DELETE /api/electricity/:id` - Delete electricity record
- `GET /api/electricity/count/total` - Get electricity record count

### Notifications

- `POST /api/notifications/subscribe` - Subscribe to push notifications
- `POST /api/notifications/test-email` - Send test email
- `POST /api/notifications/send-push` - Send push notification

### Import/Export

- `POST /api/import/vehicles` - Import vehicles from Excel
- `POST /api/import/home-rents` - Import home rents from Excel
- `POST /api/import/electricity` - Import electricity records from Excel

## 🔔 Notifications

The app supports both email and push notifications:

- **Email Notifications**: Sent via Nodemailer (Gmail)
- **Push Notifications**: Using Web Push API
- **Scheduled Checks**: Daily checks for expiring items (configurable)

## 🐛 Troubleshooting

### MongoDB Connection Issues

- Check your MongoDB URI is correct
- Ensure IP whitelist includes your IP (for MongoDB Atlas)
- Verify network connectivity

### VAPID Keys Not Working

- Ensure the same VAPID keys are used in both backend and frontend
- Regenerate keys if needed: `node generate-vapid-keys.js`

### Email Not Sending

- Verify Gmail App Password is correct
- Check that 2FA is enabled on Gmail account
- Ensure EMAIL_USER and EMAIL_PASS are set correctly

### CORS Errors

- Verify frontend URL is allowed in backend CORS configuration
- Check ALLOWED_ORIGINS environment variable

## 📝 License

ISC

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## ⚠️ Important Security Notes

1. **NEVER** commit `.env` files to git
2. **ALWAYS** rotate credentials if exposed
3. Use strong passwords for MongoDB
4. Keep dependencies updated: `npm audit fix`
5. Review security settings before deploying to production

## 🚀 Deployment

### Backend Deployment (Heroku example)

```bash
heroku create your-app-name
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set VAPID_PUBLIC_KEY=your_key
# ... set all environment variables
git push heroku main
```

### Frontend Deployment (Vercel/Netlify)

1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables in deployment platform

## 📧 Support

For issues or questions, please open an issue on GitHub.
