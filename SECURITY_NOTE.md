# Security Note - Hardcoded API Credentials

## ⚠️ Important Security Information

This project currently uses **hardcoded API credentials** directly in the source code to work around Netlify's free plan limitations on environment variables.

### Current Setup:
- **Google API Key**: `AIzaSyBaBxSWkK54Q5QRhSZ3MgOkuGMOeevzpjM`
- **Search Engine ID**: `9665ae5d79a464466`
- **Location**: Embedded in `netlify/functions/search-google.js` and `netlify/functions/search-web.js`

## 🔒 Security Implications

### Risks:
1. **Public Visibility**: API keys are visible in your GitHub repository
2. **Quota Abuse**: Anyone can use your API key if they find it
3. **Cost Risk**: If upgraded to paid plan, others could generate charges

### Mitigations in Place:
1. **Free Tier Only**: Currently using Google's free tier (100 searches/day)
2. **Limited Scope**: API key only has Custom Search API access
3. **Rate Limiting**: Google enforces daily quotas automatically
4. **Monitoring**: You can monitor usage in Google Cloud Console

## 🛡️ Recommended Security Improvements

### For Production Use:

1. **Upgrade Netlify Plan**: 
   - Move to paid plan to use environment variables
   - Keep API keys secure and private

2. **API Key Restrictions**:
   - Restrict API key to specific domains in Google Cloud Console
   - Add HTTP referrer restrictions

3. **Alternative Approaches**:
   - Use server-side proxy to hide API keys
   - Implement API key rotation
   - Consider using OAuth for user-specific quotas

### Immediate Steps You Can Take:

1. **Monitor Usage**:
   - Check [Google Cloud Console](https://console.cloud.google.com/apis/api/customsearch.googleapis.com/metrics)
   - Set up quota alerts

2. **Restrict API Key**:
   - Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)
   - Edit your API key
   - Add "HTTP referrers" restriction
   - Add your Netlify domain: `https://your-site-name.netlify.app/*`

3. **Regenerate if Needed**:
   - If you suspect abuse, regenerate the API key
   - Update the hardcoded values in the functions

## 📊 Current Limitations

- **100 searches per day** (free tier)
- **Quota resets** at midnight Pacific Time
- **No cost risk** while on free tier
- **Public repository** means API key is visible

## 🚀 For Learning/Demo Purposes

This setup is **acceptable for**:
- ✅ Learning projects
- ✅ Demonstrations
- ✅ Portfolio pieces
- ✅ Free tier usage only

This setup is **NOT recommended for**:
- ❌ Production applications
- ❌ Commercial use
- ❌ High-traffic sites
- ❌ Paid API tiers

## 🔄 Future Improvements

When ready to make this production-ready:

1. **Move to paid Netlify plan** for environment variables
2. **Implement proper API key management**
3. **Add domain restrictions**
4. **Set up monitoring and alerts**
5. **Consider serverless alternatives** (Vercel, AWS Lambda, etc.)

## 📞 Support

If you notice unusual API usage or need help securing your setup:
1. Check Google Cloud Console for usage patterns
2. Regenerate API key if needed
3. Consider upgrading hosting plan for better security

Remember: This is a **development/demo setup**. For production use, always keep API keys secure and private! 🔐