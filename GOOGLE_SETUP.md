# Google Custom Search Setup Guide

You have the Google API key, now you need to create a Custom Search Engine and get the Search Engine ID.

## 🔑 Your Current Setup
- ✅ **Google API Key**: `AIzaSyBaBxSWkK54Q5QRhSZ3MgOkuGMOeevzpjM`
- ❌ **Search Engine ID**: Not configured yet

## 📋 Step-by-Step Instructions

### Step 1: Create a Custom Search Engine

1. **Go to Google Programmable Search Engine**:
   - Visit: [https://programmablesearchengine.google.com/controlpanel/all](https://programmablesearchengine.google.com/controlpanel/all)
   - Sign in with your Google account

2. **Click "Add" to create a new search engine**

3. **Configure your search engine**:
   - **Name**: `My Search Engine` (or any name you prefer)
   - **What to search**: Select "Search the entire web"
   - **Search engine ID**: This will be generated automatically

4. **Click "Create"**

### Step 2: Get Your Search Engine ID

1. **After creating, you'll see your search engines listed**
2. **Click on your newly created search engine**
3. **Go to "Setup" or "Basics" tab**
4. **Copy the "Search engine ID"** - it looks like: `017576662512468239146:omuauf_lfve`

### Step 3: Add to Environment Variables

#### For Local Development:
Update your `.env` file:
```bash
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
```

#### For Netlify Deployment:
1. Go to your Netlify site dashboard
2. Click "Site settings"
3. Go to "Environment variables"
4. Add new variable:
   - **Key**: `GOOGLE_SEARCH_ENGINE_ID`
   - **Value**: Your search engine ID (e.g., `017576662512468239146:omuauf_lfve`)

### Step 4: Test Your Setup

1. **Deploy your changes** (Netlify will auto-deploy when you push to GitHub)
2. **Try searching** on your site
3. **You should now see real Google search results!**

## 🎯 What You'll Get

### With Google Custom Search API:
- ✅ **Real Google search results**
- ✅ **High-quality, relevant results**
- ✅ **Fast response times**
- ✅ **100 free searches per day**
- ✅ **Rich snippets and metadata**

### Free Tier Limits:
- **100 searches per day** for free
- **$5 per 1,000 additional queries** after free tier
- **10 results per search** maximum

## 🔧 Troubleshooting

### If you see "Setup Required" messages:
- Make sure you've created the Custom Search Engine
- Verify the Search Engine ID is correct
- Check that it's added to Netlify environment variables

### If you get "API Quota Exceeded":
- You've used your 100 free searches for today
- Wait until tomorrow or upgrade to paid plan
- Check usage at: [Google Cloud Console](https://console.cloud.google.com/apis/api/customsearch.googleapis.com/quotas)

### If you get "Invalid API Key":
- Verify your API key is correct
- Make sure Custom Search API is enabled in Google Cloud Console

## 🚀 Next Steps

1. **Create your Custom Search Engine** using the link above
2. **Copy the Search Engine ID**
3. **Add it to Netlify environment variables**
4. **Test your search engine**

Your search engine will then provide real Google search results instead of placeholder content!

## 📞 Need Help?

If you run into issues:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Make sure the Custom Search Engine is set to "Search the entire web"
4. Confirm the API key has Custom Search API enabled

Once configured, your search engine will be powered by Google's search results! 🎉