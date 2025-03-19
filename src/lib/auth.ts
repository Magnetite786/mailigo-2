import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './supabase';

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      isLoading: true,
      error: null,

      checkSession: async () => {
        try {
          set({ isLoading: true, error: null });
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) throw error;
          
          if (session) {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            
            set({
              isAuthenticated: true,
              user,
              error: null
            });
          } else {
            set({
              isAuthenticated: false,
              user: null,
              error: null
            });
          }
        } catch (error) {
          console.error("Session check error:", error);
          set({
            isAuthenticated: false,
            user: null,
            error: error instanceof Error ? error.message : "Failed to check authentication status"
          });
        } finally {
          set({ isLoading: false });
        }
      },

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          set({
            isAuthenticated: true,
            user: data.user,
            error: null
          });
        } catch (error) {
          console.error("Login error:", error);
          set({
            isAuthenticated: false,
            user: null,
            error: error instanceof Error ? error.message : "Failed to login"
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true, error: null });
          const { error } = await supabase.auth.signOut();
          
          if (error) throw error;

          set({
            isAuthenticated: false,
            user: null,
            error: null
          });
        } catch (error) {
          console.error("Logout error:", error);
          set({
            error: error instanceof Error ? error.message : "Failed to logout"
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);

// Initialize session check
if (typeof window !== "undefined") {
  useAuth.getState().checkSession();
}

// Set up auth state change listener
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === "SIGNED_IN") {
    useAuth.setState({
      isAuthenticated: true,
      user: session?.user ?? null,
      error: null
    });
  } else if (event === "SIGNED_OUT") {
    useAuth.setState({
      isAuthenticated: false,
      user: null,
      error: null
    });
  }
}); 