import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext'; // Assuming useAuth provides setUser and userRole

const AuthHero: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'signIn' | 'signUp'>('signIn');
  const navigate = useNavigate();
  const { setUser, userRole } = useAuth(); // userRole might be useful for navigation logic

  // Form states
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signUpFullName, setSignUpFullName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  // Consider adding phone number and company if they are part of the simplified sign-up

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!signInEmail || !signInPassword) {
      setErrorMessage('Please fill in all fields for sign-in.');
      return;
    }
    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(signInEmail)) {
        setErrorMessage('Please enter a valid email address.');
        return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInEmail,
        password: signInPassword,
      });

      if (error) throw error;

      if (data.user) {
        // The onAuthStateChange listener in AuthContext should handle setting the user globally.
        // We might not need direct setUser(data.user) call here if AuthContext is robust.
        // For now, let's assume AuthContext handles it.
        // Navigate based on user role (if available and needed here, or let ProtectedRoute handle it)
        // For simplicity, navigate to a generic dashboard or home.
        // Actual user role might be fetched by AuthContext.
        navigate('/dashboard'); // Or determine based on role from data.user or AuthContext
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to sign in.');
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!signUpFullName || !signUpEmail || !signUpPassword) {
      setErrorMessage('Please fill in all fields for sign-up.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(signUpEmail)) {
        setErrorMessage('Please enter a valid email address for sign-up.');
        return;
    }
    if (signUpPassword.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
    }

    setIsLoading(true);
    try {
      const { data: signUpAuthData, error: signUpError } = await supabase.auth.signUp({
        email: signUpEmail,
        password: signUpPassword,
        options: {
          data: {
            full_name: signUpFullName,
            // Supabase by default takes first_name, last_name.
            // If we want 'full_name', the profiles table should reflect this.
            // Or we split it here:
            // first_name: signUpFullName.split(' ')[0],
            // last_name: signUpFullName.split(' ').slice(1).join(' ') || '',
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!signUpAuthData.user) throw new Error("Sign up successful, but no user data returned.");

      // Insert into 'profiles' table (and 'user_roles' if still used like in old Auth.tsx)
      // This part is crucial and was in the old Auth.tsx.
      // Assuming 'agent' role for all sign-ups here for simplicity, as per old logic.
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: signUpAuthData.user.id, // Ensure this is the UUID from auth.users
          user_id: signUpAuthData.user.id, // if profiles.user_id is different from profiles.id
          first_name: signUpFullName.split(' ')[0] || '', // Example: split full name
          last_name: signUpFullName.split(' ').slice(1).join(' ') || '', // Example: split full name
          // phone_number: '', // Add if you have this field
          // company: '', // Add if you have this field
          status: 'active' // Default status
        });

      if (profileError) {
        // This is tricky. User is created in auth, but profile creation failed.
        // For now, log and show generic error. Ideally, handle this more gracefully.
        console.error('Error creating profile:', profileError);
        throw new Error('Account created, but profile setup failed. Please contact support.');
      }

      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: signUpAuthData.user.id, role: 'agent' }); // Default role

      if (roleError) {
          console.error('Error setting user role:', roleError);
          // Similar to profile error, user created but role not set.
          throw new Error('Account created, but role assignment failed. Please contact support.');
      }


      // Navigate or show success message (e.g., "Check your email for verification")
      // Depending on your Supabase email verification settings.
      // If auto-verified or verification not required for login:
      alert('Sign up successful! You can now sign in.'); // Or navigate directly
      setActiveTab('signIn'); // Switch to sign-in tab
      setSignInEmail(signUpEmail); // Pre-fill email
      setSignInPassword(''); // Clear password for sign-in
      setSignUpFullName('');
      setSignUpEmail('');
      setSignUpPassword('');

    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to sign up.');
      console.error('Sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-yellow-900 text-white flex flex-col items-center justify-center p-4 transition-all duration-500">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-yellow-500">AuthHero</h1>
          <p className="text-gray-300">Your Gateway to Our Services</p>
        </div>

        <div className="flex mb-4 border-b border-gray-700">
          <button
            className={`flex-1 py-3 px-4 text-center font-semibold transition-colors duration-300 ${
              activeTab === 'signIn'
                ? 'text-yellow-500 border-b-2 border-yellow-500'
                : 'text-gray-400 hover:text-yellow-400 focus:outline-none focus:text-yellow-400'
            }`}
            onClick={() => { setActiveTab('signIn'); setErrorMessage(null); }}
          >
            Sign In
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center font-semibold transition-colors duration-300 ${
              activeTab === 'signUp'
                ? 'text-yellow-500 border-b-2 border-yellow-500'
                : 'text-gray-400 hover:text-yellow-400 focus:outline-none focus:text-yellow-400'
            }`}
            onClick={() => { setActiveTab('signUp'); setErrorMessage(null); }}
          >
            Sign Up
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-400 rounded-md text-center">
            {errorMessage}
          </div>
        )}

        <div className="bg-gray-800 p-6 sm:p-8 rounded-lg shadow-xl relative overflow-hidden min-h-[380px]"> {/* min-h to prevent layout shifts */}
          {/* Sign In Form */}
          <div
            className={`transition-opacity duration-500 ease-in-out ${
              activeTab === 'signIn' ? 'opacity-100' : 'opacity-0 absolute invisible pointer-events-none'
            }`}
          >
            <form onSubmit={handleSignIn}>
              <h2 className="text-2xl font-semibold text-center text-yellow-500 mb-6">Welcome Back!</h2>
              <div className="mb-4">
                <label htmlFor="email-signin" className="block text-sm font-medium text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email-signin"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  className="w-full p-3 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent placeholder-gray-500"
                  placeholder="you@example.com"
                  disabled={isLoading}
                />
              </div>
              <div className="mb-6">
                <label htmlFor="password-signin" className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password-signin"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  className="w-full p-3 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent placeholder-gray-500"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold p-3 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          </div>

          {/* Sign Up Form */}
          <div
            className={`transition-opacity duration-500 ease-in-out ${
              activeTab === 'signUp' ? 'opacity-100' : 'opacity-0 absolute invisible pointer-events-none'
            }`}
          >
            <form onSubmit={handleSignUp}>
              <h2 className="text-2xl font-semibold text-center text-yellow-500 mb-6">Create Your Account</h2>
              <div className="mb-4">
                <label htmlFor="name-signup" className="block text-sm font-medium text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name-signup"
                  value={signUpFullName}
                  onChange={(e) => setSignUpFullName(e.target.value)}
                  className="w-full p-3 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent placeholder-gray-500"
                  placeholder="John Doe"
                  disabled={isLoading}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email-signup" className="block text-sm font-medium text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email-signup"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  className="w-full p-3 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent placeholder-gray-500"
                  placeholder="you@example.com"
                  disabled={isLoading}
                />
              </div>
              <div className="mb-6">
                <label htmlFor="password-signup" className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password-signup"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  className="w-full p-3 bg-gray-700 text-white rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent placeholder-gray-500"
                  placeholder="•••••••• (min. 6 characters)"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold p-3 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthHero;
