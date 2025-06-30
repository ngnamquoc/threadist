from typing import List, Dict, Any
from ..models import RedditPost, StoryRecommendation, UserInterest, CategorySubreddit
from .reddit_service import RedditService
from .supabase_service import SupabaseService

class RecommendationService:
    def __init__(self):
        self.reddit_service = RedditService()
        self.supabase_service = SupabaseService()
    
    async def get_recommended_stories(self, user_id: str, limit: int = 10) -> List[StoryRecommendation]:
        """Get personalized story recommendations based on user interests"""
        try:
            # Get user interests
            user_interests = await self.supabase_service.get_user_interests(user_id)
            
            if not user_interests:
                # If no interests, return popular stories from default subreddits
                return await self._get_default_stories(limit)
            
            # Get subreddits from user interests
            subreddits = []
            for interest in user_interests:
                category_subreddits = await self.supabase_service.get_category_subreddits(interest.csid)
                subreddits.extend([cs.subreddit for cs in category_subreddits])
            
            # Remove duplicates
            subreddits = list(set(subreddits))
            
            if not subreddits:
                return await self._get_default_stories(limit)
            
            # Get stories from user's interested subreddits
            all_stories = []
            stories_per_subreddit = max(1, limit // len(subreddits))
            
            for subreddit in subreddits[:5]:  # Limit to top 5 subreddits
                try:
                    stories = await self.reddit_service.get_subreddit_stories(
                        subreddit, 
                        limit=stories_per_subreddit,
                        sort='hot'
                    )
                    all_stories.extend(stories)
                except Exception as e:
                    print(f"Error getting stories from {subreddit}: {str(e)}")
                    continue
            
            # Score and rank stories
            recommendations = []
            for story in all_stories:
                score = self._calculate_story_score(story, user_interests)
                recommendation = StoryRecommendation(
                    post=story,
                    score=score,
                    reason=self._get_recommendation_reason(story, user_interests)
                )
                recommendations.append(recommendation)
            
            # Sort by score and return top recommendations
            recommendations.sort(key=lambda x: x.score, reverse=True)
            return recommendations[:limit]
            
        except Exception as e:
            print(f"Error getting recommended stories: {str(e)}")
            return await self._get_default_stories(limit)
    
    async def _get_default_stories(self, limit: int) -> List[StoryRecommendation]:
        """Get default stories from popular story subreddits"""
        default_subreddits = [
            'nosleep', 'tifu', 'relationship_advice', 'AmItheAsshole', 'entitledparents'
        ]
        
        all_stories = []
        stories_per_subreddit = max(1, limit // len(default_subreddits))
        
        for subreddit in default_subreddits:
            try:
                stories = await self.reddit_service.get_subreddit_stories(
                    subreddit,
                    limit=stories_per_subreddit,
                    sort='hot'
                )
                all_stories.extend(stories)
            except Exception as e:
                print(f"Error getting default stories from {subreddit}: {str(e)}")
                continue
        
        recommendations = []
        for story in all_stories:
            recommendation = StoryRecommendation(
                post=story,
                score=story.score,  # Use Reddit score as default
                reason=f"Popular story from r/{story.subreddit}"
            )
            recommendations.append(recommendation)
        
        recommendations.sort(key=lambda x: x.score, reverse=True)
        return recommendations[:limit]
    
    def _calculate_story_score(self, story: RedditPost, user_interests: List[UserInterest]) -> float:
        """Calculate a personalized score for a story based on user interests"""
        base_score = story.score
        
        # Boost score if story is from a subreddit the user is interested in
        interest_boost = 0
        for interest in user_interests:
            # This is a simplified scoring - in a real implementation,
            # you'd check if the story's subreddit matches the user's interests
            if interest.weight > 1:
                interest_boost += interest.weight * 10
        
        # Boost score for newer stories
        import time
        current_time = time.time()
        age_in_hours = (current_time - story.created_utc) / 3600
        recency_boost = max(0, 100 - age_in_hours)  # Newer stories get higher boost
        
        # Boost score for stories with more comments (engagement)
        engagement_boost = min(story.num_comments * 2, 100)
        
        final_score = base_score + interest_boost + recency_boost + engagement_boost
        return final_score
    
    def _get_recommendation_reason(self, story: RedditPost, user_interests: List[UserInterest]) -> str:
        """Generate a human-readable reason for the recommendation"""
        reasons = []
        
        if story.score > 1000:
            reasons.append("Highly upvoted")
        
        if story.num_comments > 50:
            reasons.append("Very engaging")
        
        # Check if it's from a subreddit the user is interested in
        for interest in user_interests:
            if interest.weight > 1:
                reasons.append("Matches your interests")
                break
        
        if not reasons:
            reasons.append("Popular story")
        
        return ", ".join(reasons)
    
    async def get_trending_stories(self, limit: int = 10) -> List[StoryRecommendation]:
        """Get trending stories across popular subreddits"""
        trending_subreddits = [
            'nosleep', 'tifu', 'relationship_advice', 'AmItheAsshole', 
            'entitledparents', 'maliciouscompliance', 'pettyrevenge'
        ]
        
        all_stories = []
        stories_per_subreddit = max(1, limit // len(trending_subreddits))
        
        for subreddit in trending_subreddits:
            try:
                stories = await self.reddit_service.get_subreddit_stories(
                    subreddit,
                    limit=stories_per_subreddit,
                    sort='top'  # Use top posts for trending
                )
                all_stories.extend(stories)
            except Exception as e:
                print(f"Error getting trending stories from {subreddit}: {str(e)}")
                continue
        
        recommendations = []
        for story in all_stories:
            recommendation = StoryRecommendation(
                post=story,
                score=story.score,
                reason=f"Trending in r/{story.subreddit}"
            )
            recommendations.append(recommendation)
        
        recommendations.sort(key=lambda x: x.score, reverse=True)
        return recommendations[:limit] 