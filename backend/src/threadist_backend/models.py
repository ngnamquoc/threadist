from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

class RedditPost(BaseModel):
    id: str
    title: str
    content: str
    author: str
    subreddit: str
    score: int
    num_comments: int
    created_utc: float
    url: str
    is_self: bool
    selftext: Optional[str] = None
    
    @property
    def is_story(self) -> bool:
        """Simple heuristic to determine if a post is a story"""
        if not self.is_self or not self.selftext:
            return False
        
        # Check if it's a story based on content length and keywords
        text = self.selftext.lower()
        story_keywords = ['story', 'tale', 'experience', 'happened', 'incident', 'event']
        
        # Must be at least 200 characters and contain story-related keywords
        return len(self.selftext) > 200 and any(keyword in text for keyword in story_keywords)

class SubredditInfo(BaseModel):
    name: str
    display_name: str
    description: str
    subscribers: int
    url: str
    is_nsfw: bool

class StoryRecommendation(BaseModel):
    post: RedditPost
    score: float
    reason: str

class AudioStreamResponse(BaseModel):
    audio_url: str
    duration: Optional[float] = None
    text_length: int

class SearchRequest(BaseModel):
    query: str
    subreddit: Optional[str] = None
    limit: int = Field(default=25, ge=1, le=100)

class UserInterest(BaseModel):
    interest_id: str
    csid: str
    user_id: str
    weight: int = 1

class CategorySubreddit(BaseModel):
    csid: str
    category_id: Optional[str] = None
    subreddit: str

class InterestCategory(BaseModel):
    category_id: str
    slug: str
    label: str
    emoji: Optional[str] = None
    description: Optional[str] = None

class UserProfile(BaseModel):
    user_id: str
    email: str
    interests: List[UserInterest] = [] 