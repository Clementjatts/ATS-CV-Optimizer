# ATS CV Optimizer - Deployment Guide

## Deploying to cv.clementadegbenro.com

This guide will walk you through deploying your ATS CV Optimizer to a subdomain using Cloudflare Pages.

---

## Prerequisites

- ✅ GitHub repository: `https://github.com/Clementjatts/ATS-CV-Optimizer.git`
- ✅ Cloudflare account with domain `clementadegbenro.com`
- ✅ Firebase project configured (already done)
- ✅ Environment variables ready

---

## Step 1: Prepare Environment Variables

### 1.1 Create Environment File

Create a `.env` file in your project root with your Firebase and Gemini configuration:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyAPwSLZV8HQ9fDCOv_Xi97vsBuDYgM16-M
VITE_FIREBASE_AUTH_DOMAIN=ats-cv-optimizer-3a741.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ats-cv-optimizer-3a741
VITE_FIREBASE_STORAGE_BUCKET=ats-cv-optimizer-3a741.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=621330035833
VITE_FIREBASE_APP_ID=1:621330035833:web:2272ebeb6e25de9dd110a8

# Gemini API Key (replace with your actual key)
VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here
```

**Note:** Replace `your_actual_gemini_api_key_here` with your real Gemini API key.

### 1.2 Update Firebase Configuration

Update your `firebaseConfig.ts` to use environment variables:

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

---

## Step 2: Cloudflare Pages Setup

### 2.1 Access Cloudflare Pages

1. **Login to Cloudflare Dashboard**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Select your account

2. **Navigate to Pages**
   - Click on "Pages" in the left sidebar
   - Click "Create a project"

### 2.2 Connect GitHub Repository

1. **Connect to Git**
   - Choose "Connect to Git"
   - Select "GitHub" as your Git provider
   - Authorize Cloudflare to access your repositories

2. **Select Repository**
   - Find and select `Clementjatts/ATS-CV-Optimizer`
   - Click "Begin setup"

### 2.3 Configure Build Settings

**Project Name:** `ats-cv-optimizer`

**Production Branch:** `main`

**Build Command:**
```bash
npm run build
```

**Build Output Directory:**
```
dist
```

**Root Directory:** (leave empty)

### 2.4 Environment Variables

Add these environment variables in Cloudflare Pages:

| Variable Name | Value |
|---------------|-------|
| `VITE_FIREBASE_API_KEY` | `AIzaSyAPwSLZV8HQ9fDCOv_Xi97vsBuDYgM16-M` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `ats-cv-optimizer-3a741.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `ats-cv-optimizer-3a741` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `ats-cv-optimizer-3a741.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `621330035833` |
| `VITE_FIREBASE_APP_ID` | `1:621330035833:web:2272ebeb6e25de9dd110a8` |
| `VITE_GEMINI_API_KEY` | `your_actual_gemini_api_key` |

### 2.5 Deploy

1. Click "Save and Deploy"
2. Wait for the build to complete (usually 2-5 minutes)
3. Your site will be available at: `https://ats-cv-optimizer.pages.dev`

---

## Step 3: Custom Domain Setup

### 3.1 Add Custom Domain

1. **In Cloudflare Pages Dashboard**
   - Go to your project
   - Click "Custom domains" tab
   - Click "Set up a custom domain"

2. **Add Subdomain**
   - Enter: `cv.clementadegbenro.com`
   - Click "Continue"

### 3.2 DNS Configuration

Cloudflare will automatically create the necessary DNS records:

- **Type:** CNAME
- **Name:** cv
- **Target:** `ats-cv-optimizer.pages.dev`
- **Proxy status:** Proxied (orange cloud)

### 3.3 SSL Certificate

- Cloudflare will automatically provision an SSL certificate
- This may take 5-15 minutes
- Your site will be available at: `https://cv.clementadegbenro.com`

---

## Step 4: Firebase Configuration Updates

### 4.1 Update Authorized Domains

1. **Go to Firebase Console**
   - Visit [console.firebase.google.com](https://console.firebase.google.com)
   - Select your project: `ats-cv-optimizer-3a741`

2. **Authentication Settings**
   - Go to "Authentication" → "Settings" → "Authorized domains"
   - Add: `cv.clementadegbenro.com`
   - Add: `ats-cv-optimizer.pages.dev`

### 4.2 Update Firestore Security Rules (Optional)

If you want to restrict access to your domain:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access only from your domain
    match /saved_cvs/{document} {
      allow read, write: if request.headers.origin == "https://cv.clementadegbenro.com";
    }
    
    match /uploaded_files/{document} {
      allow read, write: if request.headers.origin == "https://cv.clementadegbenro.com";
    }
    
    // Deny access to all other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Step 5: Testing Your Deployment

### 5.1 Verify Deployment

1. **Visit your site:** `https://cv.clementadegbenro.com`
2. **Test functionality:**
   - Upload a CV file
   - Enter a job description
   - Generate an optimized CV
   - Test CV management features

### 5.2 Performance Optimization

**Enable Cloudflare Features:**

1. **Speed Optimization**
   - Go to "Speed" tab in Cloudflare dashboard
   - Enable "Auto Minify" (HTML, CSS, JS)
   - Enable "Brotli" compression

2. **Caching**
   - Go to "Caching" tab
   - Set "Browser Cache TTL" to 1 month
   - Enable "Always Online"

---

## Step 6: Continuous Deployment

### 6.1 Automatic Deployments

- Every push to the `main` branch will trigger a new deployment
- Cloudflare Pages will automatically build and deploy your changes
- You can view deployment history in the Pages dashboard

### 6.2 Preview Deployments

- Pull requests will create preview deployments
- Useful for testing changes before merging to main

---

## Step 7: Monitoring and Analytics

### 7.1 Cloudflare Analytics

- View traffic statistics in Cloudflare dashboard
- Monitor performance metrics
- Track bandwidth usage

### 7.2 Firebase Analytics (Optional)

Add Firebase Analytics to track user interactions:

```typescript
// In your firebaseConfig.ts
import { getAnalytics } from "firebase/analytics";

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
```

---

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables are set correctly
   - Verify all dependencies are in `package.json`
   - Check build logs in Cloudflare Pages dashboard

2. **Firebase Connection Issues**
   - Verify Firebase configuration
   - Check authorized domains
   - Ensure API keys are correct

3. **Domain Not Working**
   - Wait for DNS propagation (up to 24 hours)
   - Check DNS records in Cloudflare
   - Verify SSL certificate is active

### Support Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

---

## Security Considerations

### 7.1 Environment Variables

- Never commit `.env` files to Git
- Use Cloudflare Pages environment variables
- Rotate API keys regularly

### 7.2 Firebase Security

- Review Firestore security rules
- Implement proper authentication if needed
- Monitor Firebase usage and costs

---

## Cost Estimation

### Cloudflare Pages
- **Free tier:** 500 builds/month, 20,000 requests/month
- **Pro tier:** $20/month for unlimited builds

### Firebase
- **Firestore:** Free tier includes 1GB storage, 50K reads/day
- **Storage:** Free tier includes 1GB storage, 10GB downloads/month
- **Functions:** Free tier includes 125K invocations/month

---

## Next Steps

1. ✅ Deploy to Cloudflare Pages
2. ✅ Set up custom domain
3. ✅ Configure environment variables
4. ✅ Test all functionality
5. 🔄 Monitor performance and usage
6. 🔄 Set up analytics and monitoring
7. 🔄 Consider implementing user authentication
8. 🔄 Add error tracking (Sentry, etc.)

---

## Quick Reference

**Your Site URL:** `https://cv.clementadegbenro.com`

**Cloudflare Pages URL:** `https://ats-cv-optimizer.pages.dev`

**GitHub Repository:** `https://github.com/Clementjatts/ATS-CV-Optimizer.git`

**Firebase Project:** `ats-cv-optimizer-3a741`

---

*Last updated: January 2025*
