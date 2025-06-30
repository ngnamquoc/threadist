from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from typing import List, Optional
import os
import tempfile

from .config import Config
from .models import (
    RedditPost, SubredditInfo, StoryRecommendation, 
    AudioStreamResponse, SearchRequest, UserProfile
)
from .services.reddit_service import RedditService
from .services.elevenlabs_service import ElevenLabsService
from .services.supabase_service import SupabaseService
from .services.recommendation_service import RecommendationService

# Initialize FastAPI app
app = FastAPI(
    title="Threadist API",
    description="API for Threadist - Reddit stories with AI narration",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
reddit_service = RedditService()
elevenlabs_service = ElevenLabsService()
supabase_service = SupabaseService()
recommendation_service = RecommendationService()

@app.on_event("startup")
async def startup_event():
    """Validate configuration on startup"""
    try:
        Config.validate()
        print("✅ Configuration validated successfully")
    except ValueError as e:
        print(f"❌ Configuration error: {e}")
        raise e

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Threadist API is running!", "version": "1.0.0"}

# Reddit API Routes
@app.get("/api/reddit/search", response_model=List[RedditPost])
async def search_stories(
    query: str = Query(..., description="Search query"),
    subreddit: Optional[str] = Query(None, description="Limit search to specific subreddit"),
    limit: int = Query(25, ge=1, le=100, description="Number of results to return")
):
    """Search for stories on Reddit"""
    try:
        stories = await reddit_service.search_stories(query, subreddit, limit)
        return stories
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching stories: {str(e)}")

@app.get("/api/reddit/subreddit/{subreddit}/stories", response_model=List[RedditPost])
async def get_subreddit_stories(
    subreddit: str,
    limit: int = Query(25, ge=1, le=100),
    sort: str = Query("hot", regex="^(hot|new|top|rising)$")
):
    """Get stories from a specific subreddit"""
    try:
        stories = await reddit_service.get_subreddit_stories(subreddit, limit, sort)
        return stories
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting subreddit stories: {str(e)}")

@app.get("/api/reddit/subreddit/{subreddit}/info", response_model=SubredditInfo)
async def get_subreddit_info(subreddit: str):
    """Get information about a subreddit"""
    try:
        info = await reddit_service.get_subreddit_info(subreddit)
        if not info:
            raise HTTPException(status_code=404, detail="Subreddit not found")
        return info
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting subreddit info: {str(e)}")

@app.get("/api/reddit/subreddits/search", response_model=List[SubredditInfo])
async def search_subreddits(
    query: str = Query(..., description="Search query"),
    limit: int = Query(10, ge=1, le=50)
):
    """Search for subreddits"""
    try:
        subreddits = await reddit_service.search_subreddits(query, limit)
        return subreddits
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching subreddits: {str(e)}")

# Recommendation Routes
@app.get("/api/recommendations/stories", response_model=List[StoryRecommendation])
async def get_recommended_stories(
    user_id: str = Query(..., description="User ID"),
    limit: int = Query(10, ge=1, le=50)
):
    """Get personalized story recommendations"""
    try:
        recommendations = await recommendation_service.get_recommended_stories(user_id, limit)
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting recommendations: {str(e)}")

@app.get("/api/recommendations/trending", response_model=List[StoryRecommendation])
async def get_trending_stories(
    limit: int = Query(10, ge=1, le=50)
):
    """Get trending stories across popular subreddits"""
    try:
        recommendations = await recommendation_service.get_trending_stories(limit)
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting trending stories: {str(e)}")

# ElevenLabs TTS Routes
@app.post("/api/tts/generate", response_model=AudioStreamResponse)
async def generate_audio(text: str = Query(..., description="Text to convert to speech")):
    """Generate audio from text using ElevenLabs"""
    try:
        if len(text) > 5000:  # Limit text length
            raise HTTPException(status_code=400, detail="Text too long (max 5000 characters)")
        
        audio_path = await elevenlabs_service.text_to_speech(text)
        
        return AudioStreamResponse(
            audio_url=f"/api/tts/audio/{os.path.basename(audio_path)}",
            text_length=len(text)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating audio: {str(e)}")

@app.get("/api/tts/audio/{filename}")
async def get_audio_file(filename: str):
    """Serve generated audio files"""
    try:
        # In production, you'd want to store files in a proper file storage service
        temp_dir = tempfile.gettempdir()
        file_path = os.path.join(temp_dir, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Audio file not found")
        
        return FileResponse(
            file_path,
            media_type="audio/mpeg",
            filename=filename
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error serving audio file: {str(e)}")

@app.get("/api/tts/voices")
async def get_available_voices():
    """Get list of available ElevenLabs voices"""
    try:
        voices = await elevenlabs_service.get_available_voices()
        return voices
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting voices: {str(e)}")

# User Profile Routes
@app.get("/api/user/{user_id}/profile", response_model=UserProfile)
async def get_user_profile(user_id: str):
    """Get user profile and interests"""
    try:
        profile = await supabase_service.get_user_profile(user_id)
        if not profile:
            raise HTTPException(status_code=404, detail="User not found")
        return profile
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting user profile: {str(e)}")

@app.get("/api/user/{user_id}/interests")
async def get_user_interests(user_id: str):
    """Get user interests"""
    try:
        interests = await supabase_service.get_user_interests(user_id)
        return interests
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting user interests: {str(e)}")

@app.post("/api/user/{user_id}/interests")
async def add_user_interest(
    user_id: str,
    csid: str = Query(..., description="Category subreddit ID"),
    weight: int = Query(1, ge=1, le=10, description="Interest weight")
):
    """Add a user interest"""
    try:
        success = await supabase_service.add_user_interest(user_id, csid, weight)
        if not success:
            raise HTTPException(status_code=400, detail="Failed to add interest")
        return {"message": "Interest added successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding interest: {str(e)}")

@app.delete("/api/user/{user_id}/interests/{csid}")
async def remove_user_interest(user_id: str, csid: str):
    """Remove a user interest"""
    try:
        success = await supabase_service.remove_user_interest(user_id, csid)
        if not success:
            raise HTTPException(status_code=400, detail="Failed to remove interest")
        return {"message": "Interest removed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error removing interest: {str(e)}")

# Categories and Subreddits Routes
@app.get("/api/categories")
async def get_categories():
    """Get all interest categories"""
    try:
        categories = await supabase_service.get_interest_categories()
        return categories
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting categories: {str(e)}")

@app.get("/api/categories/{category_id}/subreddits")
async def get_category_subreddits(category_id: str):
    """Get subreddits for a specific category"""
    try:
        subreddits = await supabase_service.get_category_subreddits(category_id)
        return subreddits
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting category subreddits: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=Config.HOST,
        port=Config.PORT,
        reload=Config.DEBUG
    ) 