# Deployment Guide for Job Tracker App

This guide will help you deploy your Job Tracker application to make it publicly accessible.

## Table of Contents
1. [Quick Deploy Options](#quick-deploy-options)
2. [Option 1: Deploy to Render (Recommended)](#option-1-deploy-to-render-recommended)
3. [Option 2: Deploy to Railway](#option-2-deploy-to-railway)
4. [Option 3: Deploy to Vercel + Render](#option-3-deploy-to-vercel--render)
5. [Local Testing Before Deployment](#local-testing-before-deployment)

---

## Quick Deploy Options

| Platform | Frontend | Backend | Database | Free Tier | Best For |
|----------|----------|---------|----------|-----------|----------|
| **Render** | ✅ | ✅ | ✅ (SQLite) | Yes | All-in-one solution |
| **Railway** | ✅ | ✅ | ✅ (SQLite) | $5 credit | Quick setup |
| **Vercel + Render** | ✅ (Vercel) | ✅ (Render) | ✅ (Render) | Yes | Best performance |

---

## Option 1: Deploy to Render (Recommended)

Render offers free hosting for both frontend and backend with a PostgreSQL/SQLite database.

### Step 1: Prepare Your Code

1. **Initialize Git repository** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Push to GitHub**:
   - Create a new repository on GitHub
   - Follow the instructions to push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/job-tracker.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Create PostgreSQL Database on Render

1. In Render Dashboard, click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `job-tracker-db`
   - **Database**: `jobtracker` (or any name)
   - **User**: (auto-generated)
   - **Region**: Same as your backend
   - **Instance Type**: **Free**
3. Click **"Create Database"**
4. Wait for it to provision (1-2 minutes)
5. **Copy the "Internal Database URL"** (you'll need this)

### Step 3: Deploy Backend to Render

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `job-tracker-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

4. Add environment variables:
   - Click **"Environment"** tab
   - Add these variables:
     ```
     NODE_ENV=production
     PORT=5000
     DATABASE_URL=paste-your-internal-database-url-here
     ADMIN_USERNAME=your-chosen-admin-username
     ADMIN_PASSWORD=your-secure-admin-password
     ```
   - ⚠️ **IMPORTANT**:
     - Use the **Internal Database URL** from Step 2
     - Choose a strong password for `ADMIN_PASSWORD`
   - These credentials are stored securely on Render and NOT in your code

5. Click **"Create Web Service"**
6. **Copy your backend URL** (e.g., `https://job-tracker-backend.onrender.com`)

### Step 4: Deploy Frontend to Render

1. Click **"New +"** → **"Static Site"**
2. Connect the same GitHub repository
3. Configure:
   - **Name**: `job-tracker-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. Add environment variable:
   - Click **"Environment"** tab
   - Add:
     ```
     VITE_API_URL=https://job-tracker-backend.onrender.com
     ```
   (Replace with your actual backend URL from Step 2)

5. Click **"Create Static Site"**
6. **Your app will be live!** 🎉

### Step 5: Update Backend CORS

1. Go back to your backend service on Render
2. Add another environment variable:
   ```
   FRONTEND_URL=https://job-tracker-frontend.onrender.com
   ```
   (Replace with your actual frontend URL)

3. The backend will restart automatically

---

**🎉 Your app is now live with persistent PostgreSQL database!**

---

## Option 2: Deploy to Railway

Railway is super simple and provides $5 free credit per month.

### Step 1: Deploy Backend

1. Go to [railway.app](https://railway.app) and sign up
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Railway will auto-detect your Node.js app
5. Add environment variables in the Variables tab:
   ```
   NODE_ENV=production
   PORT=5000
   ```
6. Set the root directory to `backend` in Settings
7. Copy your backend URL

### Step 2: Deploy Frontend

1. Click **"New"** → **"GitHub Repo"** (same repo)
2. Add environment variables:
   ```
   VITE_API_URL=your-backend-url-from-railway
   ```
3. Set root directory to `frontend`
4. Set build command: `npm install && npm run build`
5. Set start command: `npx serve dist -p $PORT`
6. Done! 🚀

---

## Option 3: Deploy to Vercel + Render

Best performance: Vercel for frontend, Render for backend.

### Step 1: Deploy Backend to Render
Follow **Option 1, Step 2** above.

### Step 2: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add environment variable:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

6. Click **"Deploy"**
7. Update backend's `FRONTEND_URL` on Render with your Vercel URL

---

## Local Testing Before Deployment

Before deploying, test your app locally with production settings:

### Backend

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env`:
   ```
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

4. Start the server:
   ```bash
   npm start
   ```

### Frontend

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env`:
   ```
   VITE_API_URL=http://localhost:5000
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:5173

### Build and Preview (Production Mode)

```bash
cd frontend
npm run build
npm run preview
```

---

## Admin Account Setup

Your admin account credentials are set via **environment variables** on Render (not in the code).

After deployment, you can log in with:
- **Username**: Whatever you set for `ADMIN_USERNAME`
- **Password**: Whatever you set for `ADMIN_PASSWORD`

**✅ SECURE**: These credentials are stored securely in Render's environment variables and never exposed in your open-source code!

---

## Troubleshooting

### CORS Errors
- Make sure `FRONTEND_URL` in backend matches your actual frontend URL
- Check that both services are using HTTPS

### Database Not Persisting (Data Lost on Restart)
**Solution**: Add a persistent disk to your backend service:
1. Go to backend service → **Disks** → **Add Disk**
2. Mount Path: `/var/data`, Size: 1GB
3. Add environment variable: `DB_DIR=/var/data`
4. Redeploy - data will now persist!

### Build Fails
- Check that `package.json` has the correct dependencies
- Ensure Node version is >= 18.0.0

### API Not Connecting
- Verify `VITE_API_URL` is set correctly in frontend
- Check browser console for errors
- Test backend URL directly in browser

---

## Custom Domain (Optional)

### On Render:
1. Go to your service → **Settings** → **Custom Domain**
2. Add your domain
3. Update DNS records as instructed

### On Vercel:
1. Go to project → **Settings** → **Domains**
2. Add your domain
3. Follow DNS configuration instructions

---

## Cost Breakdown

### Free Tier (Recommended for Starting)
- **Render**: Free (with 750 hours/month)
- **Vercel**: Free (unlimited static deployments)
- **Total**: $0/month

### Paid Tier (For Production)
- **Render**: $7/month (always on, no cold starts)
- **Vercel Pro**: $20/month (better performance)
- **Total**: ~$27/month

---

## Next Steps

1. ✅ Deploy your app using one of the options above
2. 🔐 Change the default admin password
3. 📱 Test on mobile devices
4. 🎨 Customize branding
5. 📊 Add analytics (optional)
6. 🔔 Set up monitoring (optional)

Need help? Check the platform documentation:
- [Render Docs](https://render.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)

---

**Your Job Tracker is ready to go live! 🚀**
