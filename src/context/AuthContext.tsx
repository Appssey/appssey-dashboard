import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AuthState, User as LocalUser } from '../types/app.types';
import { supabase } from '../supabaseClient';

interface AuthContextType extends AuthState {
  login: (email: string, name: string) => Promise<void>;
  verifyCode: (code: string) => Promise<boolean>;
  logout: () => void;
}

interface ExtendedAuthState extends AuthState {
  lastEmail: string;
  lastName?: string;
}

const initialState: ExtendedAuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  lastEmail: '',
  lastName: '',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ExtendedAuthState>(initialState);

  // Helper to map Supabase user to local User type
  const mapSupabaseUser = (user: any, status?: string): LocalUser => {
    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.email || '',
      status,
    };
  };

  // Check user status by id
  const checkUserStatus = async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('status')
      .eq('id', userId)
      .single();
    if (error) return null;
    return data.status;
  };

  const login = async (email: string, name: string): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true, lastEmail: email, lastName: name }));
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: window.location.origin,
      },
    });
    setState((prev) => ({ ...prev, isLoading: false }));
    if (error) throw error;
  };

  const verifyCode = async (code: string): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true }));
    const { data, error } = await supabase.auth.verifyOtp({
      email: state.lastEmail,
      token: code,
      type: 'email',
    });
    setState((prev) => ({ ...prev, isLoading: false }));
    if (error || !data.user) return false;

    // --- Add user to custom users table if not exists ---
    if (data.user.email) {
      const { data: existing, error: fetchError } = await supabase
        .from('users')
        .select('id, status, name')
        .eq('email', data.user.email);
      if (existing && existing.length > 0) {
        const userStatus = existing[0].status;
        // If name is different, update it
        if (existing[0].name !== state.lastName) {
          await supabase
            .from('users')
            .update({ name: state.lastName })
            .eq('id', data.user.id);
        }
        if (userStatus !== 'active') {
          await supabase.auth.signOut();
          alert('Your account is deactivated or deleted. Please contact support.');
          return false;
        }
      } else {
        const { error: insertError } = await supabase.from('users').insert([
          {
            id: data.user.id,
            email: data.user.email,
            name: state.lastName || data.user.user_metadata?.name || data.user.email || '',
            status: 'active',
          }
        ]);
        if (insertError) {
          console.error(
            'Error inserting user into custom users table:',
            insertError,
            insertError.details,
            insertError.message
          );
        } else {
          console.log('User inserted into custom users table:', data.user.email);
        }
      }
    }
    // --- End add user logic ---

    // --- Check user status ---
    const status = await checkUserStatus(data.user.id);
    if (status !== 'active') {
      await supabase.auth.signOut();
      alert('Your account is deactivated. Please contact support.');
      return false;
    }
    // --- End check user status ---

    setState((prev) => ({
      ...prev,
      user: mapSupabaseUser(data.user, status),
      isAuthenticated: true,
      isLoading: false,
    }));
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setState(initialState);
  };

  // On mount, check session and user status
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const status = await checkUserStatus(session.user.id);
        if (status !== 'active') {
          await supabase.auth.signOut();
          setState(initialState);
          alert('Your account is deactivated. Please contact support.');
        }
      }
    };
    checkSession();
    // eslint-disable-next-line
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, verifyCode, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};