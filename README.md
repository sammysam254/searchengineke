# INFINITUM Search Engine 🚀

**Infinite Search. Infinite Possibilities.**

A modern, beautiful search engine with 3D animated logo, trending searches, and dynamic content. Built with React and powered by Google Custom Search API.

## 🌟 Live Demos

- **Netlify**: [https://searchke.netlify.app](https://searchke.netlify.app)
- **Vercel**: Deploy your own → [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sammysam254/searchengineke)

## ✨ Features

- 🎨 **Stunning 3D Animated Logo** - Floating infinity symbol with gradients
- 🤖 **AI Mode** - Ask questions and get intelligent responses like Google's AI
- 🔥 **Trending Searches** - Updates every hour with dynamic content
- 🌟 **Suggested Websites** - Curated recommendations refreshed every 30 minutes
- 🚀 **Beautiful Loading Animations** - Smooth spinners and progress bars
- 📱 **Fully Responsive** - Works perfectly on all devices
- ⚡ **Lightning Fast** - Optimized for performance
- 🌐 **Multi-Platform** - Deploy on Netlify or Vercel
- 🧠 **Smart AI Responses** - Knowledge base with contextual understanding
- 💡 **Follow-up Questions** - AI suggests related queries
- 📚 **Source Attribution** - Links to relevant sources and references

## 🚀 Quick Deploy

### Deploy to Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sammysam254/searchengineke)

### Deploy to Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/sammysam254/searchengineke)

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Modern CSS with responsive design
- Fetch API for HTTP requests

**Backend:**
- Netlify Functions (Node.js serverless)
- Axios for HTTP requests
- Cheerio for web scraping

**Deployment:**
- Frontend: Netlify
- Backend: Netlify Functions
- Version Control: GitHub

## 🚀 Quick Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/social-search-engine)

## 📦 Local Development

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/social-search-engine.git
cd social-search-engine
```

2. **Install dependencies:**
```bash
npm install
cd client && npm install
```

3. **Start development servers:**
```bash
npm run dev
```

The frontend will run on `http://localhost:3000` and the backend on `http://localhost:5000`.

## 🌐 Deployment

### GitHub Setup

1. Create a new repository on GitHub
2. Push your code:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/social-search-engine.git
git push -u origin main
```

### Netlify Deployment

1. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Build Settings:**
   - Build command: `cd client && npm install && npm run build`
   - Publish directory: `client/build`
   - Functions directory: `netlify/functions`

3. **Deploy:**
   - Netlify will automatically deploy your site
   - Your search engine will be live at `https://your-app-name.netlify.app`

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   └── App.js         # Main application
│   └── package.json       # Frontend dependencies
├── netlify/
│   └── functions/         # Serverless functions
│       ├── search-web.js  # Web search endpoint
│       ├── search-social.js # Social media search
│       └── search-all.js  # Combined search
├── server/                # Original Express server (for local dev)
├── netlify.toml           # Netlify configuration
└── package.json           # Root dependencies
```

## 🔍 API Endpoints

### Web Search
```
GET /.netlify/functions/search-web?q=query&page=1
```

### Social Media Search
```
GET /.netlify/functions/search-social?q=query&platform=github&page=1
```

### Combined Search
```
GET /.netlify/functions/search-all?q=query&page=1
```

## 🎯 Search Capabilities

### Web Search
- Uses DuckDuckGo for web scraping
- Returns titles, URLs, and snippets
- No API keys required

### Social Media Platforms

#### GitHub
- User profile search
- Repository information
- Public data only

#### Reddit
- Post and comment search
- Uses Reddit's JSON API
- No authentication required

## 🚧 Limitations

1. **Rate Limits**: Some platforms have strict rate limiting
2. **Scraping Restrictions**: Some sites may block automated requests
3. **Data Freshness**: Results depend on platform availability

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚖️ Legal Notice

This tool is for educational and research purposes. Users are responsible for complying with platform terms of service and applicable laws when using this search engine.

## 🔧 Environment Variables

No environment variables are required for basic functionality. The app works out of the box with public APIs and web scraping.

## 📞 Support

If you have any questions or run into issues, please [open an issue](https://github.com/yourusername/social-search-engine/issues) on GitHub.