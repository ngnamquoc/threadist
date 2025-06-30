import { supabase } from '../lib/supabase';
import { Session, User, AuthError } from '@supabase/supabase-js';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

export interface AuthUser {
  id: string;
  email: string;
  email_confirmed_at?: string | null;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
    full_name?: string;
    interests?: string[];
    [key: string]: any;
  };
}

class AuthService {
  // Sign up with email and password
  async signUp(email: string, password: string): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'threadist://auth/callback', // Use your app's custom scheme
        },
      });

      if (error) {
        console.error('Sign up error:', error);
        return { user: null, error };
      }

      return { 
        user: data.user ? this.formatUser(data.user) : null, 
        error: null 
      };
    } catch (error: any) {
      console.error('Sign up exception:', error);
      return { 
        user: null, 
        error: { message: error.message || 'Sign up failed' } as AuthError 
      };
    }
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { user: null, error };
      }

      return { 
        user: data.user ? this.formatUser(data.user) : null, 
        error: null 
      };
    } catch (error: any) {
      console.error('Sign in exception:', error);
      return { 
        user: null, 
        error: { message: error.message || 'Sign in failed' } as AuthError 
      };
    }
  }

  // Sign in with Google using OAuth
  async signInWithGoogle(): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const redirectUri = makeRedirectUri({
        scheme: 'threadist', // Make sure this matches your app.json scheme
        path: 'auth/callback',
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Google sign in error:', error);
        return { user: null, error };
      }

      // Open the OAuth URL
      if (data.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUri
        );

        if (result.type === 'success') {
          // Extract tokens from the URL
          if (result.url) {
            const url = new URL(result.url);
            
            // Check for authorization code in query parameters (PKCE flow)
            const code = url.searchParams.get('code');
            
            if (code) {
              // Exchange the authorization code for tokens
              const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
              
              if (sessionError) {
                return { user: null, error: sessionError };
              }
              
              if (sessionData.session?.user) {
                return {
                  user: this.formatUser(sessionData.session.user),
                  error: null,
                };
              }
            } else {
              // Fallback: try to extract tokens from hash fragment
              const fragment = url.hash.substring(1);
              const params = new URLSearchParams(fragment);
              
              const accessToken = params.get('access_token');
              const refreshToken = params.get('refresh_token');
              
              if (accessToken) {
                // Set the session manually using the tokens
                const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken || '',
                });
                
                if (sessionError) {
                  return { user: null, error: sessionError };
                }
                
                if (sessionData.session?.user) {
                  return {
                    user: this.formatUser(sessionData.session.user),
                    error: null,
                  };
                }
              }
            }
          }
          
          // Fallback: try to get existing session with retries
          for (let i = 0; i < 3; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            const { data: sessionData } = await supabase.auth.getSession();
            
            if (sessionData.session?.user) {
              return {
                user: this.formatUser(sessionData.session.user),
                error: null,
              };
            }
          }
          
          return {
            user: null,
            error: { message: 'Failed to establish session after OAuth' } as AuthError,
          };
        } else {
          return {
            user: null,
            error: { message: 'Google sign in was cancelled' } as AuthError,
          };
        }
      }

      return { user: null, error: { message: 'No OAuth URL returned' } as AuthError };
    } catch (error: any) {
      console.error('Google sign in exception:', error);
      return { 
        user: null, 
        error: { message: error.message || 'Google sign in failed' } as AuthError 
      };
    }
  }

  // Sign out
  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        return { error };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Sign out exception:', error);
      return { error: { message: error.message || 'Sign out failed' } as AuthError };
    }
  }

  // Get current session
  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }

  // Get current user
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const session = await this.getCurrentSession();
      return session?.user ? this.formatUser(session.user) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: AuthUser | null, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user ? this.formatUser(session.user) : null;
      callback(user, session);
    });
  }

  // Format Supabase user to our AuthUser interface
  private formatUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email || '',
      email_confirmed_at: user.email_confirmed_at,
      user_metadata: user.user_metadata,
    };
  }

  // Check if user's email is confirmed
  isEmailConfirmed(user: AuthUser | null): boolean {
    return !!(user && user.email_confirmed_at);
  }

  // Resend confirmation email
  async resendConfirmation(email: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: 'threadist://auth/callback', // Use your app's custom scheme
        },
      });

      if (error) {
        console.error('Resend confirmation error:', error);
        return { error };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Resend confirmation exception:', error);
      return { error: { message: error.message || 'Failed to resend confirmation' } as AuthError };
    }
  }

  // Save user interests (you can store this in Supabase database)
  async saveUserInterests(userId: string, interests: string[]): Promise<{ error: AuthError | null }> {
    try {
      // For now, we'll update the user metadata
      // In a real app, you'd probably want to create a separate table for user interests
      const { error } = await supabase.auth.updateUser({
        data: { interests }
      });

      if (error) {
        console.error('Save interests error:', error);
        return { error };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Save interests exception:', error);
      return { error: { message: error.message || 'Failed to save interests' } as AuthError };
    }
  }
}

export const authService = new AuthService();
export default authService;
