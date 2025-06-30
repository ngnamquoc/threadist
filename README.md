# Threadist

Threadist is a multi-platform app that crawls Reddit stories based on user interests and tells these interesting tales to users with amazing narrating voices using AI-powered text-to-speech.

## Features

- **Spotify-like UI**: Beautiful, modern interface inspired by Spotify's design
- **Reddit Story Discovery**: Browse and search stories from popular subreddits
- **AI Narration**: Convert Reddit stories to audio using ElevenLabs TTS
- **Personalized Recommendations**: Get story recommendations based on your interests
- **Audio Player**: Full-featured audio player with play/pause/stop controls
- **User Authentication**: Secure signup/login with Supabase
- **Interest Management**: Select and manage your story interests

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **Supabase**: Database and authentication
- **ElevenLabs**: AI text-to-speech
- **Reddit API**: Story content
- **Redis**: Caching and background tasks

### Frontend
- **React Native**: Cross-platform mobile app
- **Expo**: Development platform
- **TypeScript**: Type safety
- **Expo AV**: Audio playback

## Prerequisites

Before running this application, you'll need:

1. **Python 3.8+** for the backend
2. **Node.js 16+** for the frontend
3. **Expo CLI** for React Native development
4. **Redis** (optional, for caching)

## Environment Variables

### Backend (.env file in backend directory)

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# ElevenLabs Configuration
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Reddit API Configuration
REDDIT_CLIENT_ID=your_reddit_client_id_here
REDDIT_CLIENT_SECRET=your_reddit_client_secret_here
REDDIT_USER_AGENT=Threadist/1.0

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True
```

### Frontend (.env file in frontend directory)

```bash
# Backend API URL (for development)
REACT_APP_API_URL=http://localhost:8000

# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd threadist
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with your environment variables
cp env.example .env
# Edit .env with your actual values

# Run the backend server
python run.py
```

The backend will be available at `http://localhost:8000`
API documentation will be available at `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file with your environment variables
cp env.example .env
# Edit .env with your actual values

# Start the development server
npm start
```

### 4. Database Setup

Make sure your Supabase database has the required tables. The SQL schema is provided in the project description.

## API Endpoints

### Reddit API
- `GET /api/reddit/search` - Search for stories
- `GET /api/reddit/subreddit/{subreddit}/stories` - Get stories from a subreddit
- `GET /api/reddit/subreddit/{subreddit}/info` - Get subreddit information
- `GET /api/reddit/subreddits/search` - Search for subreddits

### Recommendations
- `GET /api/recommendations/stories` - Get personalized recommendations
- `GET /api/recommendations/trending` - Get trending stories

### Text-to-Speech
- `POST /api/tts/generate` - Generate audio from text
- `GET /api/tts/audio/{filename}` - Get generated audio file
- `GET /api/tts/voices` - Get available voices

### User Management
- `GET /api/user/{user_id}/profile` - Get user profile
- `GET /api/user/{user_id}/interests` - Get user interests
- `POST /api/user/{user_id}/interests` - Add user interest
- `DELETE /api/user/{user_id}/interests/{csid}` - Remove user interest

## Getting API Keys

### Reddit API
1. Go to https://www.reddit.com/prefs/apps
2. Create a new app
3. Select "script" as the app type
4. Note down the client ID and client secret

### ElevenLabs
1. Go to https://elevenlabs.io/
2. Sign up for an account
3. Go to your profile settings
4. Copy your API key

### Supabase
1. Go to https://supabase.com/
2. Create a new project
3. Go to Settings > API
4. Copy the URL and anon key

## Development

### Backend Development

```bash
cd backend
python run.py
```

The server will run with hot reload enabled in debug mode.

### Frontend Development

```bash
cd frontend
npm start
```

This will start the Expo development server. You can:
- Press `w` to open in web browser
- Press `a` to open in Android emulator
- Press `i` to open in iOS simulator
- Scan the QR code with Expo Go app on your phone

## Project Structure

```
threadist/
├── backend/
│   ├── services/
│   │   ├── reddit_service.py
│   │   ├── elevenlabs_service.py
│   │   ├── supabase_service.py
│   │   └── recommendation_service.py
│   ├── main.py
│   ├── config.py
│   ├── models.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── services/
│   │   └── styles/
│   ├── App.tsx
│   └── package.json
├── helpful-code/
│   └── elevenlabs-example.ts
└── README.md
```

## Troubleshooting

### Common Issues

1. **Backend won't start**: Check that all environment variables are set correctly
2. **Frontend can't connect to backend**: Make sure the backend is running and the API URL is correct
3. **Audio not playing**: Check that ElevenLabs API key is valid and you have sufficient credits
4. **Reddit API errors**: Verify your Reddit API credentials and rate limits

### Debug Mode

Set `DEBUG=True` in your backend `.env` file to enable detailed logging.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues, please:
1. Check the troubleshooting section
2. Look at the API documentation at `http://localhost:8000/docs`
3. Create an issue in the repository 