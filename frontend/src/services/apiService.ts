import { AuthUser } from './authService';

// Types for API responses
export interface RedditPost {
  id: string;
  title: string;
  content: string;
  author: string;
  subreddit: string;
  score: number;
  num_comments: number;
  created_utc: number;
  url: string;
  is_self: boolean;
  selftext?: string;
}

export interface SubredditInfo {
  name: string;
  display_name: string;
  description: string;
  subscribers: number;
  url: string;
  is_nsfw: boolean;
}

export interface StoryRecommendation {
  post: RedditPost;
  score: number;
  reason: string;
}

export interface AudioStreamResponse {
  audio_url: string;
  duration?: number;
  text_length: number;
}

export interface UserInterest {
  interest_id: string;
  csid: string;
  user_id: string;
  weight: number;
}

export interface InterestCategory {
  category_id: string;
  slug: string;
  label: string;
  emoji?: string;
  description?: string;
}

export interface CategorySubreddit {
  csid: string;
  category_id?: string;
  subreddit: string;
}

export interface UserProfile {
  user_id: string;
  email: string;
  interests: UserInterest[];
}

class ApiService {
  private baseUrl: string;

  constructor() {
    // Use environment variable for backend URL, fallback to localhost
    this.baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
    console.log('ApiService initialized with baseUrl:', this.baseUrl);
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log('Making API request to:', url);
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API response data length:', Array.isArray(data) ? data.length : 'Not an array');
      return data;
    } catch (error: any) {
      console.error('API request failed:', error);
      
      // Check if it's a network error (backend not running)
      if (error.message === 'Network request failed' || error.code === 'NETWORK_ERROR') {
        throw new Error(`Backend server is not available at ${this.baseUrl}. Please make sure the backend server is running.`);
      }
      throw error;
    }
  }

  // Reddit API endpoints
  async searchStories(
    query: string,
    subreddit?: string,
    limit: number = 25
  ): Promise<RedditPost[]> {
    const params = new URLSearchParams({
      query,
      limit: limit.toString(),
    });
    
    if (subreddit) {
      params.append('subreddit', subreddit);
    }

    return this.makeRequest<RedditPost[]>(`/api/reddit/search?${params}`);
  }

  async getSubredditStories(
    subreddit: string,
    limit: number = 25,
    sort: 'hot' | 'new' | 'top' | 'rising' = 'hot',
    page: number = 1
  ): Promise<RedditPost[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      sort,
      page: page.toString(),
    });

    return this.makeRequest<RedditPost[]>(`/api/reddit/subreddit/${subreddit}/stories?${params}`);
  }

  async getSubredditInfo(subreddit: string): Promise<SubredditInfo> {
    return this.makeRequest<SubredditInfo>(`/api/reddit/subreddit/${subreddit}/info`);
  }

  async searchSubreddits(query: string, limit: number = 10): Promise<SubredditInfo[]> {
    const params = new URLSearchParams({
      query,
      limit: limit.toString(),
    });

    return this.makeRequest<SubredditInfo[]>(`/api/reddit/subreddits/search?${params}`);
  }

  // Recommendation endpoints
  async getRecommendedStories(userId: string, limit: number = 10, page: number = 1): Promise<StoryRecommendation[]> {
    const params = new URLSearchParams({
      user_id: userId,
      limit: limit.toString(),
      page: page.toString(),
    });

    return this.makeRequest<StoryRecommendation[]>(`/api/recommendations/stories?${params}`);
  }

  async getTrendingStories(limit: number = 10, page: number = 1): Promise<StoryRecommendation[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      page: page.toString(),
    });

    return this.makeRequest<StoryRecommendation[]>(`/api/recommendations/trending?${params}`);
  }

  // Category and Subreddit story endpoints
  async getHotStories(limit: number = 10, page: number = 1): Promise<StoryRecommendation[]> {
    // Use trending stories as hot stories since /api/reddit/hot doesn't exist
    console.log('Using trending stories as fallback for hot stories');
    return this.getTrendingStories(limit, page);
  }

  async getCategoryStories(
    categoryId: string, 
    userId?: string, 
    limit: number = 10, 
    page: number = 1
  ): Promise<StoryRecommendation[]> {
    // For now, fallback to recommended stories for the user
    // TODO: Implement proper category-based recommendations on backend
    if (userId) {
      console.log(`Using recommended stories as fallback for category ${categoryId}`);
      return this.getRecommendedStories(userId, limit, page);
    } else {
      console.log(`Using trending stories as fallback for category ${categoryId}`);
      return this.getTrendingStories(limit, page);
    }
  }

  async getFollowedSubredditsStories(
    userId: string, 
    limit: number = 10, 
    page: number = 1
  ): Promise<StoryRecommendation[]> {
    // For now, fallback to recommended stories
    // TODO: Implement proper followed subreddits endpoint on backend
    console.log(`Using recommended stories as fallback for followed subreddits`);
    return this.getRecommendedStories(userId, limit, page);
  }

  async getSubredditRecommendations(
    subreddit: string, 
    userId?: string,
    limit: number = 10, 
    page: number = 1
  ): Promise<StoryRecommendation[]> {
    // Convert direct subreddit stories to recommendation format
    try {
      console.log(`Getting subreddit stories for ${subreddit} and converting to recommendations`);
      const posts = await this.getSubredditStories(subreddit, limit, 'hot', page);
      return posts.map(post => ({
        post,
        score: post.score,
        reason: `Popular story from r/${subreddit}`
      }));
    } catch (error) {
      console.error(`Error getting subreddit recommendations for ${subreddit}:`, error);
      throw error;
    }
  }

  // TTS endpoints
  async generateAudio(text: string): Promise<AudioStreamResponse> {
    const params = new URLSearchParams({ text });
    
    return this.makeRequest<AudioStreamResponse>(`/api/tts/generate?${params}`, {
      method: 'POST',
    });
  }

  async streamAudio(text: string, voiceId?: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/tts/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice_id: voiceId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    // Convert blob to base64 data URL for React Native compatibility
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  getAudioUrl(filename: string): string {
    return `${this.baseUrl}/api/tts/audio/${filename}`;
  }

  async getAvailableVoices(): Promise<any[]> {
    return this.makeRequest<any[]>(`/api/tts/voices`);
  }

  // User profile endpoints
  async getUserProfile(userId: string): Promise<UserProfile> {
    return this.makeRequest<UserProfile>(`/api/user/${userId}/profile`);
  }

  async getUserInterests(userId: string): Promise<UserInterest[]> {
    return this.makeRequest<UserInterest[]>(`/api/user/${userId}/interests`);
  }

  async addUserInterest(userId: string, csid: string, weight: number = 1): Promise<void> {
    const params = new URLSearchParams({
      csid,
      weight: weight.toString(),
    });

    await this.makeRequest(`/api/user/${userId}/interests?${params}`, {
      method: 'POST',
    });
  }

  async removeUserInterest(userId: string, csid: string): Promise<void> {
    await this.makeRequest(`/api/user/${userId}/interests/${csid}`, {
      method: 'DELETE',
    });
  }

  // Categories and subreddits endpoints
  async getCategories(): Promise<InterestCategory[]> {
    return this.makeRequest<InterestCategory[]>(`/api/categories`);
  }

  async getCategorySubreddits(categoryId: string): Promise<CategorySubreddit[]> {
    return this.makeRequest<CategorySubreddit[]>(`/api/categories/${categoryId}/subreddits`);
  }
}

export const apiService = new ApiService();