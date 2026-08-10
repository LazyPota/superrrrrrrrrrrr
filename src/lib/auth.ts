import { supabase } from './supabase';
import { User } from '../types';

export async function registerWithSupabase(userData: {
  name: string;
  email: string;
  password: string;
  major: string;
  batch: string;
}) {
  if (!supabase) {
    return { ok: false, error: 'Supabase client is not configured.' };
  }

  const { name, email, password, major, batch } = userData;

  // 1. Sign up user with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, major, batch },
    },
  });

  if (authError) {
    return { ok: false, error: authError.message };
  }

  const userProfile = {
    id: authData.user?.id,
    name,
    email,
    major,
    batch,
  };

  // 2. Insert user profile into 'users' table
  try {
    const { error: profileError } = await supabase
      .from('users')
      .upsert([userProfile], { onConflict: 'email' });

    if (profileError) {
      console.warn('Profile sync warning:', profileError.message);
    }
  } catch (e) {
    // Ignore if offline
  }

  return { ok: true, user: userProfile };
}

export async function loginWithSupabase(email: string, password: string) {
  if (!supabase) {
    return { ok: false, error: 'Supabase client is not configured.' };
  }

  // 1. Sign in with Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { ok: false, error: error.message === 'Invalid login credentials' ? 'Email atau password salah.' : error.message };
  }

  const authUser = data.user;

  // 2. Fetch profile metadata from 'users' table
  let profile = {
    name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
    email: authUser.email || email,
    major: authUser.user_metadata?.major || 'General',
    batch: authUser.user_metadata?.batch || '2024',
  };

  try {
    const { data: dbUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (dbUser) {
      profile = {
        name: dbUser.name,
        email: dbUser.email,
        major: dbUser.major,
        batch: dbUser.batch,
      };
    }
  } catch (e) {
    // Fallback to metadata
  }

  return { ok: true, user: profile };
}

export async function logoutWithSupabase() {
  if (supabase) {
    await supabase.auth.signOut();
  }
}

export async function getCurrentSupabaseUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}
