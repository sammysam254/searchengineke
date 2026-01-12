# INFINITUM Search Engine - Vercel Deployment Guide

## Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sammysam254/searchengineke)

## Manual Deployment Steps

### 1. Prerequisites
- GitHub account
- Vercel account (free)
- Node.js 18+ installed locally

### 2. Deploy to Vercel

#### Option A: One-Click Deploy
1. Click the "Deploy with Vercel" button above
2. Connect your GitHub account
3. Import the repository
4. Deploy automatically

#### Option B: Manual Deploy
1. Fork this repository to your GitHub account
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your forked repository
5. Configure build settings:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build:vercel`
   - **Output Directory**: `build`
6. Click "Deploy"

### 3. Environment Variables (Optional)
If you want to use your own Google API credentials:
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add:
   - `GOOGLE_API_KEY`: Your Google Custom Search API key
   - `GOOGLE_SEARCH_ENGINE_ID`: Your Custom Search Engine ID

### 4. Custom Domain (Optional)
1. Go to your Vercel project dashboard
2. Navigate to Settings → Domains
3. Add your custom domain
4. Follow Vercel's DNS configuration instructions

## API Endpoints

Once deployed, your search engine will have these API endpoints:

- **Web Search**: `https://your-app.vercel.app/api/search-web?q=query&page=1`
- **Combined Search**: `https://your-app.vercel.app/api/search-all?q=query&page=1`
- **Debug Info**: `https://your-app.vercel.app/api/debug`

## Features on Vercel

✅ **Automatic HTTPS**
✅ **Global CDN**
✅ **Serverless Functions**
✅ **Automatic Deployments**
✅ **Custom Domains**
✅ **Analytics**
✅ **Edge Functions**

## Performance Benefits

- **Fast Global Loading**: Vercel's Edge Network
- **Serverless Scaling**: Functions scale automatically
- **Optimized Builds**: Automatic optimization
- **Zero Configuration**: Works out of the box

## Troubleshooting

### Build Errors
- Ensure Node.js version is 18+
- Check that all dependencies are installed
- Verify `vercel.json` configuration

### API Errors
- Check function logs in Vercel dashboard
- Verify Google API credentials
- Test endpoints directly

### Domain Issues
- Verify DNS settings
- Check domain configuration in Vercel
- Allow time for DNS propagation

## Support

For deployment issues:
1. Check Vercel documentation
2. Review build logs in dashboard
3. Test API endpoints directly
4. Check browser console for errors

## Comparison: Netlify vs Vercel

| Feature | Netlify | Vercel |
|---------|---------|---------|
| Build Time | ~2-3 min | ~1-2 min |
| Function Cold Start | ~500ms | ~200ms |
| Free Tier | 300 build min/month | 100GB bandwidth |
| Custom Domains | ✅ | ✅ |
| Analytics | Basic | Advanced |
| Edge Functions | ✅ | ✅ |

Both platforms work great for INFINITUM Search Engine!