# Quick Start Guide

## 🚀 Get Threadist Running in 5 Minutes

### Prerequisites
- Python 3.8+
- Node.js 16+
- API keys (see below)

### 1. Get Your API Keys

You'll need these API keys to run the application:

#### Reddit API
1. Go to https://www.reddit.com/prefs/apps
2. Click "Create App" or "Create Another App"
3. Fill in:
   - **Name**: Threadist
   - **App type**: Script
   - **Description**: Threadist app for story discovery
4. Note down the **client ID** (under the app name) and **client secret**

#### ElevenLabs API
1. Go to https://elevenlabs.io/
2. Sign up for a free account
3. Go to Profile → API Key
4. Copy your API key

#### Supabase (Optional for full features)
1. Go to https://supabase.com/
2. Create a new project
3. Go to Settings → API
4. Copy the **URL** and **anon key**

### 2. Set Up Environment Variables

#### Backend Setup
```bash
cd backend
cp env.example .env
```

Edit `backend/.env` with your API keys:
```bash
# Required
ELEVENLABS_API_KEY=your_elevenlabs_key_here
REDDIT_CLIENT_ID=your_reddit_client_id_here
REDDIT_CLIENT_SECRET=your_reddit_client_secret_here

# Optional (for full features)
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

#### Frontend Setup
```bash
cd frontend
cp env.example .env
```

Edit `frontend/.env`:
```bash
REACT_APP_API_URL=http://localhost:8000
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Run the Application

#### Option A: Use the startup script (Recommended)
```bash
./start.sh
```

#### Option B: Manual startup

**Terminal 1 - Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm start
```

### 4. Test the Backend

After the backend is running, test it:
```bash
cd backend
python test_api.py
```

### 5. Access the Application

- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Frontend**: Check the Expo CLI output for the URL

### 6. What You Can Do

1. **Browse Stories**: View recommended and trending Reddit stories
2. **Search Stories**: Search for specific stories or topics
3. **Listen to Stories**: Click the play button to generate and play audio
4. **Audio Controls**: Use the mini player at the bottom for playback controls

### Troubleshooting

#### Backend won't start
- Check that all required environment variables are set
- Make sure Python 3.8+ is installed
- Verify API keys are correct

#### Frontend can't connect to backend
- Make sure backend is running on http://localhost:8000
- Check that REACT_APP_API_URL is set correctly

#### Audio not playing
- Verify ElevenLabs API key is valid
- Check that you have sufficient ElevenLabs credits
- Make sure the story content is not empty

#### Reddit API errors
- Verify Reddit API credentials
- Check Reddit API rate limits
- Make sure the user agent is set correctly

### Next Steps

1. **Set up Supabase** for full user authentication and interest management
2. **Customize the UI** by modifying the theme and components
3. **Add more features** like story bookmarks, playlists, etc.
4. **Deploy to production** using services like Vercel, Heroku, or AWS

### Support

If you encounter issues:
1. Check the troubleshooting section above
2. Look at the API documentation at http://localhost:8000/docs
3. Check the console logs for error messages
4. Verify all environment variables are set correctly

Happy storytelling! 🎧📖 