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
    // In development, this would point to your local backend
    // In production, this would be your deployed backend URL
    this.baseUrl = 'http://localhost:8000';
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
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
    sort: 'hot' | 'new' | 'top' | 'rising' = 'hot'
  ): Promise<RedditPost[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      sort,
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
  async getRecommendedStories(userId: string, limit: number = 10): Promise<StoryRecommendation[]> {
    const params = new URLSearchParams({
      user_id: userId,
      limit: limit.toString(),
    });

    return this.makeRequest<StoryRecommendation[]>(`/api/recommendations/stories?${params}`);
  }

  async getTrendingStories(limit: number = 10): Promise<StoryRecommendation[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });

    return this.makeRequest<StoryRecommendation[]>(`/api/recommendations/trending?${params}`);
  }

  // TTS endpoints
  async generateAudio(text: string): Promise<AudioStreamResponse> {
    const params = new URLSearchParams({ text });
    
    return this.makeRequest<AudioStreamResponse>(`/api/tts/generate?${params}`, {
      method: 'POST',
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