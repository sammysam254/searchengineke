# Deployment Guide

## Prerequisites

1. **Install Git:**
   - Download from [git-scm.com](https://git-scm.com/)
   - Or use: `winget install Git.Git`

2. **Create GitHub Account:**
   - Sign up at [github.com](https://github.com)

3. **Create Netlify Account:**
   - Sign up at [netlify.com](https://netlify.com)

## Step-by-Step Deployment

### 1. Initialize Git Repository

```bash
git init
git add .
git commit -m "Initial commit: Social Search Engine"
```

### 2. Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click "New repository"
3. Name it: `social-search-engine`
4. Keep it public
5. Don't initialize with README (we already have one)
6. Click "Create repository"

### 3. Push to GitHub

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/social-search-engine.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### 4. Deploy to Netlify

1. **Go to Netlify:**
   - Visit [app.netlify.com](https://app.netlify.com)
   - Click "New site from Git"

2. **Connect GitHub:**
   - Choose "GitHub"
   - Authorize Netlify to access your repositories
   - Select your `social-search-engine` repository

3. **Configure Build Settings:**
   - **Build command:** `cd client && npm install && npm run build`
   - **Publish directory:** `client/build`
   - **Functions directory:** `netlify/functions`

4. **Deploy:**
   - Click "Deploy site"
   - Wait for deployment to complete (2-3 minutes)
   - Your site will be live at `https://random-name.netlify.app`

### 5. Customize Domain (Optional)

1. In Netlify dashboard, go to "Site settings"
2. Click "Change site name"
3. Choose a custom name like `my-search-engine`
4. Your site will be available at `https://my-search-engine.netlify.app`

## Troubleshooting

### Common Issues:

1. **Build fails:**
   - Check that Node.js version is 18+ in Netlify settings
   - Verify all dependencies are in package.json

2. **Functions not working:**
   - Ensure functions are in `netlify/functions/` directory
   - Check function logs in Netlify dashboard

3. **CORS errors:**
   - Functions include CORS headers
   - Should work automatically

### Testing Your Deployment:

1. Visit your Netlify URL
2. Try searching for "javascript"
3. Test both web and social search
4. Check browser console for errors

## Updating Your Site

After making changes:

```bash
git add .
git commit -m "Update: description of changes"
git push
```

Netlify will automatically redeploy your site within minutes.

## Performance Tips

1. **Optimize Images:** Use WebP format for better performance
2. **Enable Caching:** Netlify automatically handles this
3. **Monitor Usage:** Check Netlify analytics for traffic patterns

Your search engine is now live and accessible worldwide! 🚀