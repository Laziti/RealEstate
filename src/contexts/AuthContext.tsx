import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Database } from '@/integrations/supabase/types';

type SignUpParams = {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
  career?: string;
  receiptFile?: File;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  userRole: 'super_admin' | 'agent' | null;
  userStatus: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'super_admin' | 'agent' | null>(null);
  const [userStatus, setUserStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // If session exists, fetch user role and status
        if (session?.user) {
          fetchUserRole(session.user.id);
          fetchUserStatus(session.user.id);
        } else {
          setUserRole(null);
          setUserStatus(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // If session exists, fetch user role and status
      if (session?.user) {
        fetchUserRole(session.user.id);
        fetchUserStatus(session.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user role from the database
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        setUserRole(null);
      } else {
        setUserRole(data.role as 'super_admin' | 'agent');
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      setUserRole(null);
    }
  };

  // Fetch user status from the database
  const fetchUserStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('status')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user status:', error);
        setUserStatus(null);
      } else {
        setUserStatus(data?.status ?? null);
      }
    } catch (error) {
      console.error('Error in fetchUserStatus:', error);
      setUserStatus(null);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }

      if (!data.session) {
        return { error: new Error('No session created') };
      }

      // Set session and user
      setSession(data.session);
      setUser(data.session.user);

      // Fetch user role and status
      await fetchUserRole(data.session.user.id);
      await fetchUserStatus(data.session.user.id);

      return { error: null };
    } catch (error) {
      console.error('Error in signIn:', error);
      return { error };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      return { error };
    } catch (error) {
      console.error('Error in signUp:', error);
      return { error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error in signOut:', error);
    }
  };

  // Completely rewritten refreshSession method
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Error refreshing token:', error);
        return;
      }
      
      // Update the session and user state with new data
      const newSession = data.session;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      // Update user role and status
      if (newSession?.user) {
        fetchUserRole(newSession.user.id);
        fetchUserStatus(newSession.user.id);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      userRole, 
      userStatus,
      loading, 
      signIn, 
      signUp, 
      signOut,
      refreshSession
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
