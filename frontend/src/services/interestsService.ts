import { supabase } from '../lib/supabase';

export interface InterestCategory {
  category_id: string;
  slug: string;
  label: string;
  emoji?: string;
  description?: string;
}

export interface CategorySubreddit {
  csid: string;
  category_id: string;
  subreddit: string;
}

export interface UserInterest {
  interest_id: string;
  csid: string;
  user_id: string;
  weight: number;
}

class InterestsService {
  // Fetch all interest categories
  async getInterestCategories(): Promise<{ categories: InterestCategory[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('interest_categories')
        .select('*')
        .order('label');

      if (error) {
        console.error('Get interest categories error:', error);
        return { categories: null, error };
      }

      return { categories: data, error: null };
    } catch (error: any) {
      console.error('Get interest categories exception:', error);
      return { categories: null, error: { message: error.message || 'Failed to fetch categories' } };
    }
  }

  // Fetch subreddits for specific categories
  async getCategorySubreddits(categoryIds: string[]): Promise<{ subreddits: CategorySubreddit[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('category_subreddits')
        .select('*')
        .in('category_id', categoryIds);

      if (error) {
        console.error('Get category subreddits error:', error);
        return { subreddits: null, error };
      }

      return { subreddits: data, error: null };
    } catch (error: any) {
      console.error('Get category subreddits exception:', error);
      return { subreddits: null, error: { message: error.message || 'Failed to fetch subreddits' } };
    }
  }

  // Save user interests
  async saveUserInterests(userId: string, categoryIds: string[]): Promise<{ error: any }> {
    try {
      // First, get all subreddits for the selected categories
      const { subreddits, error: subredditsError } = await this.getCategorySubreddits(categoryIds);
      
      if (subredditsError || !subreddits) {
        return { error: subredditsError || { message: 'Failed to fetch subreddits' } };
      }

      // Delete existing user interests
      const { error: deleteError } = await supabase
        .from('user_interests')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error('Delete user interests error:', deleteError);
        return { error: deleteError };
      }

      // Insert new user interests
      const userInterests = subreddits.map(subreddit => ({
        csid: subreddit.csid,
        user_id: userId,
        weight: 1
      }));

      const { error: insertError } = await supabase
        .from('user_interests')
        .insert(userInterests);

      if (insertError) {
        console.error('Insert user interests error:', insertError);
        return { error: insertError };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Save user interests exception:', error);
      return { error: { message: error.message || 'Failed to save interests' } };
    }
  }

  // Save user interests by specific subreddit CSIDs
  async saveUserInterestsBySubreddits(userId: string, subredditCSIDs: string[]): Promise<{ error: any }> {
    try {
      // Delete existing user interests
      const { error: deleteError } = await supabase
        .from('user_interests')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error('Delete user interests error:', deleteError);
        return { error: deleteError };
      }

      // Insert new user interests
      const userInterests = subredditCSIDs.map(csid => ({
        csid: csid,
        user_id: userId,
        weight: 1
      }));

      const { error: insertError } = await supabase
        .from('user_interests')
        .insert(userInterests);

      if (insertError) {
        console.error('Insert user interests error:', insertError);
        return { error: insertError };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Save user interests by subreddits exception:', error);
      return { error: { message: error.message || 'Failed to save interests' } };
    }
  }

  // Get user's selected interests
  async getUserInterests(userId: string): Promise<{ interests: UserInterest[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_interests')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Get user interests error:', error);
        return { interests: null, error };
      }

      return { interests: data, error: null };
    } catch (error: any) {
      console.error('Get user interests exception:', error);
      return { interests: null, error: { message: error.message || 'Failed to fetch user interests' } };
    }
  }

  // Get user's interests with category details and subreddits
  async getUserInterestsWithCategories(userId: string): Promise<{ 
    interestsData: Array<{
      category: InterestCategory;
      subreddits: string[];
    }> | null; 
    error: any 
  }> {
    try {
      const { data, error } = await supabase
        .from('user_interests')
        .select(`
          csid,
          weight,
          category_subreddits!inner (
            subreddit,
            category_id,
            interest_categories!inner (
              category_id,
              slug,
              label,
              emoji,
              description
            )
          )
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('Get user interests with categories error:', error);
        return { interestsData: null, error };
      }

      // Group by category
      const categoryMap = new Map<string, {
        category: InterestCategory;
        subreddits: string[];
      }>();

      data?.forEach((item: any) => {
        const category = item.category_subreddits.interest_categories;
        const subreddit = item.category_subreddits.subreddit;
        
        if (!categoryMap.has(category.category_id)) {
          categoryMap.set(category.category_id, {
            category: category,
            subreddits: []
          });
        }
        
        categoryMap.get(category.category_id)!.subreddits.push(subreddit);
      });

      const interestsData = Array.from(categoryMap.values());
      return { interestsData, error: null };
    } catch (error: any) {
      console.error('Get user interests with categories exception:', error);
      return { interestsData: null, error: { message: error.message || 'Failed to fetch user interests with categories' } };
    }
  }

  // Check if user has completed interest selection
  async hasUserCompletedInterestSelection(userId: string): Promise<{ hasCompleted: boolean; error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_interests')
        .select('interest_id')
        .eq('user_id', userId)
        .limit(1);

      if (error) {
        console.error('Check user interests completion error:', error);
        return { hasCompleted: false, error };
      }

      return { hasCompleted: data && data.length > 0, error: null };
    } catch (error: any) {
      console.error('Check user interests completion exception:', error);
      return { hasCompleted: false, error: { message: error.message || 'Failed to check interest completion' } };
    }
  }
}

export const interestsService = new InterestsService();
export default interestsService;
