import httpx
import base64
from typing import List, Optional
from ..models import RedditPost, SubredditInfo
from ..config import Config

class RedditService:
    def __init__(self):
        self.client_id = Config.REDDIT_CLIENT_ID
        self.client_secret = Config.REDDIT_CLIENT_SECRET
        self.user_agent = Config.REDDIT_USER_AGENT
        self.access_token = None
        
    async def _get_access_token(self) -> str:
        """Get Reddit OAuth access token"""
        if self.access_token:
            return self.access_token
            
        auth_string = f"{self.client_id}:{self.client_secret}"
        auth_bytes = auth_string.encode('ascii')
        auth_b64 = base64.b64encode(auth_bytes).decode('ascii')
        
        headers = {
            'Authorization': f'Basic {auth_b64}',
            'User-Agent': self.user_agent,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        data = {
            'grant_type': 'client_credentials'
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                'https://www.reddit.com/api/v1/access_token',
                headers=headers,
                data=data
            )
            response.raise_for_status()
            token_data = response.json()
            self.access_token = token_data['access_token']
            return self.access_token
    
    async def search_stories(self, query: str, subreddit: Optional[str] = None, limit: int = 25) -> List[RedditPost]:
        """Search for stories on Reddit"""
        token = await self._get_access_token()
        
        headers = {
            'Authorization': f'Bearer {token}',
            'User-Agent': self.user_agent
        }
        
        # Build search URL
        if subreddit:
            url = f"https://oauth.reddit.com/r/{subreddit}/search"
        else:
            url = "https://oauth.reddit.com/search"
        
        params = {
            'q': query,
            'limit': limit,
            'sort': 'relevance',
            't': 'all',
            'type': 'link'
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
            
            posts = []
            for child in data['data']['children']:
                post_data = child['data']
                
                # Only include self posts (text posts)
                if post_data.get('is_self', False):
                    post = RedditPost(
                        id=post_data['id'],
                        title=post_data['title'],
                        content=post_data.get('selftext', ''),
                        author=post_data['author'],
                        subreddit=post_data['subreddit'],
                        score=post_data['score'],
                        num_comments=post_data['num_comments'],
                        created_utc=post_data['created_utc'],
                        url=post_data['url'],
                        is_self=post_data['is_self'],
                        selftext=post_data.get('selftext')
                    )
                    
                    # Only include posts that are stories
                    if post.is_story:
                        posts.append(post)
            
            return posts
    
    async def get_subreddit_stories(self, subreddit: str, limit: int = 25, sort: str = 'hot') -> List[RedditPost]:
        """Get stories from a specific subreddit"""
        token = await self._get_access_token()
        
        headers = {
            'Authorization': f'Bearer {token}',
            'User-Agent': self.user_agent
        }
        
        url = f"https://oauth.reddit.com/r/{subreddit}/{sort}"
        params = {
            'limit': limit
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
            
            posts = []
            for child in data['data']['children']:
                post_data = child['data']
                
                # Only include self posts (text posts)
                if post_data.get('is_self', False):
                    post = RedditPost(
                        id=post_data['id'],
                        title=post_data['title'],
                        content=post_data.get('selftext', ''),
                        author=post_data['author'],
                        subreddit=post_data['subreddit'],
                        score=post_data['score'],
                        num_comments=post_data['num_comments'],
                        created_utc=post_data['created_utc'],
                        url=post_data['url'],
                        is_self=post_data['is_self'],
                        selftext=post_data.get('selftext')
                    )
                    
                    # Only include posts that are stories
                    if post.is_story:
                        posts.append(post)
            
            return posts
    
    async def get_subreddit_info(self, subreddit: str) -> Optional[SubredditInfo]:
        """Get information about a subreddit"""
        token = await self._get_access_token()
        
        headers = {
            'Authorization': f'Bearer {token}',
            'User-Agent': self.user_agent
        }
        
        url = f"https://oauth.reddit.com/r/{subreddit}/about"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            if response.status_code == 404:
                return None
            response.raise_for_status()
            data = response.json()
            
            subreddit_data = data['data']
            return SubredditInfo(
                name=subreddit_data['display_name'],
                display_name=subreddit_data['display_name'],
                description=subreddit_data.get('public_description', ''),
                subscribers=subreddit_data['subscribers'],
                url=subreddit_data['url'],
                is_nsfw=subreddit_data.get('over18', False)
            )
    
    async def search_subreddits(self, query: str, limit: int = 10) -> List[SubredditInfo]:
        """Search for subreddits"""
        token = await self._get_access_token()
        
        headers = {
            'Authorization': f'Bearer {token}',
            'User-Agent': self.user_agent
        }
        
        url = "https://oauth.reddit.com/subreddits/search"
        params = {
            'q': query,
            'limit': limit
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
            
            subreddits = []
            for child in data['data']['children']:
                subreddit_data = child['data']
                subreddit = SubredditInfo(
                    name=subreddit_data['display_name'],
                    display_name=subreddit_data['display_name'],
                    description=subreddit_data.get('public_description', ''),
                    subscribers=subreddit_data['subscribers'],
                    url=subreddit_data['url'],
                    is_nsfw=subreddit_data.get('over18', False)
                )
                subreddits.append(subreddit)
            
            return subreddits 