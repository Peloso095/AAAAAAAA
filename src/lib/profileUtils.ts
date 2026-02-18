/**
 * Utility functions for profile management
 * Ensures profile exists before performing operations
 */
import { supabase } from '@/integrations/supabase/client';

/**
 * Ensures a profile exists for the given user_id
 * Creates one if it doesn't exist (fallback for when trigger fails)
 */
export async function ensureProfileExists(userId: string): Promise<boolean> {
  try {
    // First check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('[Profile] Error fetching profile:', fetchError);
    }

    if (existingProfile) {
      console.log('[Profile] Profile already exists');
      return true;
    }

    // Profile doesn't exist, create it
    console.log('[Profile] Creating missing profile for user:', userId);
    
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        full_name: null,
        avatar_url: null,
        level: 1,
        xp_points: 0,
        is_premium: false,
        is_admin: false,
      });

    if (insertError) {
      console.error('[Profile] Error creating profile:', insertError);
      return false;
    }

    console.log('[Profile] Profile created successfully');
    return true;
  } catch (error) {
    console.error('[Profile] Unexpected error:', error);
    return false;
  }
}

/**
 * Get or create profile for user
 * Returns the profile data
 */
export async function getOrCreateProfile(userId: string) {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('[Profile] Error fetching profile:', error);
    }

    if (profile) {
      return { profile, created: false };
    }

    // Try to create profile
    const created = await ensureProfileExists(userId);
    
    if (created) {
      // Fetch the newly created profile
      const { data: newProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      return { profile: newProfile, created: true };
    }

    return { profile: null, created: false };
  } catch (error) {
    console.error('[Profile] Unexpected error:', error);
    return { profile: null, created: false };
  }
}

/**
 * Update user profile with fallback
 */
export async function updateUserProfile(
  userId: string, 
  updates: {
    full_name?: string;
    avatar_url?: string;
    university?: string;
    semester?: number;
  }
): Promise<boolean> {
  try {
    // Ensure profile exists first
    await ensureProfileExists(userId);

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId);

    if (error) {
      console.error('[Profile] Error updating profile:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Profile] Unexpected error:', error);
    return false;
  }
}
