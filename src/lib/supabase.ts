import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client with auto session persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
});

// Initialize database schema if needed
export const initializeSchema = async () => {
  try {
    // Check if email_config table exists
    const { error: checkError } = await supabase
      .from('email_config')
      .select('id')
      .limit(1);

    if (checkError && checkError.code === '42P01') {
      // Table doesn't exist, create it
      const { error: createError } = await supabase
        .rpc('init_email_config_schema');

      if (createError) {
        throw createError;
      }
    }
  } catch (error) {
    console.error('Schema initialization error:', error);
    // Don't throw, as this is not critical for app function
  }
};

// Auth helper functions
export const signUp = async ({ email, password, fullName }: { email: string; password: string; fullName: string }) => {
  // First, sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('Signup failed: No user data returned');

  try {
    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        { 
          id: authData.user.id, 
          full_name: fullName 
        }
      ]);

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Don't throw here, as the user is already created
      // The profile can be created later if needed
    }

    return authData;
  } catch (error) {
    console.error('Error in profile creation:', error);
    return authData; // Still return auth data as signup was successful
  }
};

export const signIn = async ({ email, password }: { email: string; password: string }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Email related functions
export const saveEmail = async (emailData: {
  subject: string;
  content: string;
  recipient_list: string[];
}) => {
  const { data, error } = await supabase
    .from('emails')
    .insert([{
      ...emailData,
      user_id: (await getCurrentUser())?.id,
    }])
    .select();

  if (error) throw error;
  return data[0];
};

export const getUserEmails = async () => {
  const { data, error } = await supabase
    .from('emails')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const updateEmail = async (id: string, updates: Partial<{
  subject: string;
  content: string;
  recipient_list: string[];
  status: string;
}>) => {
  const { data, error } = await supabase
    .from('emails')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data[0];
};

export const deleteEmail = async (id: string) => {
  const { error } = await supabase
    .from('emails')
    .delete()
    .eq('id', id);

  if (error) throw error;
}; 