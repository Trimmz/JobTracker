# 🎯 Job Application Tracker

A modern, full-stack web application for tracking job applications with user-specific status management and admin controls.

![Dark Theme](https://img.shields.io/badge/theme-dark-black)
![React](https://img.shields.io/badge/react-18.2.0-blue)
![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

### For Users
- 📊 **Personal Dashboard** - Track all your job applications in one place
- 🎨 **Status Management** - Update application status (Not Applied, Wishlist, Applied, Interview, Offer, Rejected)
- 📝 **Personal Notes** - Add private notes for each application
- 📈 **Statistics** - Visual breakdown of application statuses
- 🌓 **Dark Theme** - Modern, eye-friendly dark UI
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile

### For Admins
- ➕ **Job Management** - Create, edit, and delete job postings
- 👥 **Multi-user Support** - Each user has their own application status
- 🔧 **Admin Panel** - Dedicated interface for managing jobs

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/job-tracker.git
   cd job-tracker
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   ```

4. **Start the Backend Server**
   ```bash
   cd backend
   npm start
   ```
   Backend will run on `http://localhost:5000`

5. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔐 Default Credentials

- **Username**: `admin`
- **Password**: `password123`

⚠️ **Change these credentials immediately after first login!**

## 📁 Project Structure

```
job-tracker/
├── backend/               # Node.js + Express backend
│   ├── server.js         # Main server file
│   ├── db.js             # Database configuration
│   ├── package.json      # Backend dependencies
│   └── .env.example      # Environment variables template
├── frontend/             # React + Vite frontend
│   ├── src/
│   │   ├── MainApp.jsx          # Main job listing page
│   │   ├── AdminJobManager.jsx  # Admin panel
│   │   ├── LoginPage.jsx        # Login page
│   │   ├── SignupPage.jsx       # Signup page
│   │   ├── AuthContext.jsx      # Authentication context
│   │   ├── config.js            # API configuration
│   │   └── ...
│   ├── package.json     # Frontend dependencies
│   └── .env.example     # Environment variables template
├── DEPLOYMENT.md        # Deployment guide
└── README.md           # This file
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **SQLite3** - Database
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

## 🎨 Screenshots

### Main Dashboard
Beautiful dark-themed grid layout showing all available jobs with personal status tracking.

### Admin Panel
Dedicated interface for managing job postings with create, edit, and delete capabilities.

### Login/Signup
Clean authentication pages with modern design.

## 🔧 Configuration

### Backend Environment Variables (.env)
```env
PORT=5000
NODE_ENV=production
FRONTEND_URL=http://localhost:5173
DB_PATH=./applications.db
```

### Frontend Environment Variables (.env)
```env
VITE_API_URL=http://localhost:5000
```

## 📚 API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/signup` - User registration

### Jobs
- `GET /api/jobs` - Get all jobs (with user-specific status)
- `POST /api/jobs` - Create job (admin only)
- `PUT /api/jobs/:id` - Update job (admin only)
- `DELETE /api/jobs/:id` - Delete job (admin only)

### Applications
- `POST /api/jobs/:jobId/apply` - Update user's application status
- `PUT /api/applications/:jobId/status` - Update status

## 🚢 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

**Quick deploy options:**
- **Render** (Recommended) - Free tier available
- **Railway** - $5 free credit
- **Vercel + Render** - Best performance

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Your Name - [Your GitHub](https://github.com/YOUR_USERNAME)

## 🙏 Acknowledgments

- Built with React and Express
- UI inspired by modern dark theme designs
- Icons from Unicode emoji set

---

**Made with ❤️ for job seekers everywhere**
