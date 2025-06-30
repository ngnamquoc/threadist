from supabase import create_client, Client
from typing import List, Optional, Dict, Any
from ..config import Config
from ..models import UserInterest, CategorySubreddit, InterestCategory, UserProfile

class SupabaseService:
    def __init__(self):
        self.supabase: Client = create_client(
            Config.SUPABASE_URL,
            Config.SUPABASE_SERVICE_ROLE_KEY
        )
    
    async def get_user_interests(self, user_id: str) -> List[UserInterest]:
        """Get user interests from database"""
        try:
            response = self.supabase.table('user_interests').select(
                'interest_id, csid, user_id, weight'
            ).eq('user_id', user_id).execute()
            
            interests = []
            for row in response.data:
                interest = UserInterest(
                    interest_id=row['interest_id'],
                    csid=row['csid'],
                    user_id=row['user_id'],
                    weight=row['weight']
                )
                interests.append(interest)
            
            return interests
        except Exception as e:
            print(f"Error getting user interests: {str(e)}")
            return []
    
    async def get_category_subreddits(self, category_id: Optional[str] = None) -> List[CategorySubreddit]:
        """Get category subreddits from database"""
        try:
            query = self.supabase.table('category_subreddits').select('csid, category_id, subreddit')
            
            if category_id:
                query = query.eq('category_id', category_id)
            
            response = query.execute()
            
            subreddits = []
            for row in response.data:
                subreddit = CategorySubreddit(
                    csid=row['csid'],
                    category_id=row['category_id'],
                    subreddit=row['subreddit']
                )
                subreddits.append(subreddit)
            
            return subreddits
        except Exception as e:
            print(f"Error getting category subreddits: {str(e)}")
            return []
    
    async def get_interest_categories(self) -> List[InterestCategory]:
        """Get all interest categories from database"""
        try:
            response = self.supabase.table('interest_categories').select(
                'category_id, slug, label, emoji, description'
            ).execute()
            
            categories = []
            for row in response.data:
                category = InterestCategory(
                    category_id=row['category_id'],
                    slug=row['slug'],
                    label=row['label'],
                    emoji=row['emoji'],
                    description=row['description']
                )
                categories.append(category)
            
            return categories
        except Exception as e:
            print(f"Error getting interest categories: {str(e)}")
            return []
    
    async def add_user_interest(self, user_id: str, csid: str, weight: int = 1) -> bool:
        """Add a user interest to database"""
        try:
            response = self.supabase.table('user_interests').insert({
                'user_id': user_id,
                'csid': csid,
                'weight': weight
            }).execute()
            
            return len(response.data) > 0
        except Exception as e:
            print(f"Error adding user interest: {str(e)}")
            return False
    
    async def remove_user_interest(self, user_id: str, csid: str) -> bool:
        """Remove a user interest from database"""
        try:
            response = self.supabase.table('user_interests').delete().eq(
                'user_id', user_id
            ).eq('csid', csid).execute()
            
            return len(response.data) > 0
        except Exception as e:
            print(f"Error removing user interest: {str(e)}")
            return False
    
    async def update_user_interest_weight(self, user_id: str, csid: str, weight: int) -> bool:
        """Update user interest weight"""
        try:
            response = self.supabase.table('user_interests').update({
                'weight': weight
            }).eq('user_id', user_id).eq('csid', csid).execute()
            
            return len(response.data) > 0
        except Exception as e:
            print(f"Error updating user interest weight: {str(e)}")
            return False
    
    async def get_user_profile(self, user_id: str) -> Optional[UserProfile]:
        """Get user profile from auth.users table"""
        try:
            response = self.supabase.auth.admin.get_user_by_id(user_id)
            
            if response.user:
                interests = await self.get_user_interests(user_id)
                return UserProfile(
                    user_id=user_id,
                    email=response.user.email,
                    interests=interests
                )
            
            return None
        except Exception as e:
            print(f"Error getting user profile: {str(e)}")
            return None
    
    async def has_user_completed_interests(self, user_id: str) -> bool:
        """Check if user has completed interest selection"""
        try:
            interests = await self.get_user_interests(user_id)
            return len(interests) > 0
        except Exception as e:
            print(f"Error checking user interests completion: {str(e)}")
            return False 