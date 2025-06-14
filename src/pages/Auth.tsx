import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check as CheckIcon, Building as BuildingIcon, ArrowLeft, Mail, Lock, User, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const REAL_ESTATE_COMPANIES = [
  "Noah Real Estate",
  "Gift Real Estate",
  "Flintstone Homes",
  "Afro-Tsion Real Estate",
  "Ayat Share Company",
  "Sunshine Real Estate",
  "Zemen Bank Real Estate",
  "Tsehay Real Estate",
  "Other"
] as const;

const signInSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const signUpSchema = signInSchema.extend({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  phoneNumber: z.string().min(10, { message: 'Valid phone number is required' }),
  company: z.string().min(1, { message: 'Company is required' }),
  otherCompany: z.string().optional(),
});

type SignInFormValues = z.infer<typeof signInSchema>;
type SignUpFormValues = z.infer<typeof signUpSchema>;
type FormValues = SignUpFormValues;

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtherCompany, setShowOtherCompany] = useState(false);
  const { signIn, signUp, user, userRole } = useAuth();
  const navigate = useNavigate();

  // Check localStorage for authMode on component mount
  useEffect(() => {
    const authMode = localStorage.getItem('authMode');
    if (authMode === 'signup') {
      setIsSignUp(true);
    } else if (authMode === 'signin') {
      setIsSignUp(false);
    }
    // Clear localStorage after using it
    localStorage.removeItem('authMode');
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(isSignUp ? signUpSchema : signInSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      company: '',
      otherCompany: '',
    },
  });

  useEffect(() => {
    // Reset form when switching between sign-in and sign-up
    reset();
  }, [isSignUp, reset]);

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      if (isSignUp) {
        // Sign up user with metadata
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              first_name: data.firstName,
              last_name: data.lastName,
              phone_number: data.phoneNumber,
              company: data.company === 'Other' ? data.otherCompany : data.company
            }
          }
        });
        
        if (signUpError) throw signUpError;
        
        if (!signUpData.user) {
          throw new Error('Failed to create user account');
        }

        // Add user role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: signUpData.user.id,
            role: 'agent'
          });

        if (roleError) throw roleError;
        
        // Create user profile with status 'active'
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: signUpData.user.id,
            user_id: signUpData.user.id,
            first_name: data.firstName,
            last_name: data.lastName,
            phone_number: data.phoneNumber,
            company: data.company === 'Other' ? data.otherCompany : data.company,
            status: 'active'
          });
        if (profileError) throw profileError;
        
        reset();
        // Redirect to agent dashboard
        navigate('/dashboard');
      } else {
        // Sign in
        const { error } = await signIn(data.email, data.password);
        
        if (error) throw error;
        
        // Navigate based on user role
        if (userRole === 'super_admin') {
          navigate('/admin');
        } else if (userRole === 'agent') {
          navigate('/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      // Show error message to user
      alert(error.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const company = watch('company');

  useEffect(() => {
    if (company === 'Other') {
      setShowOtherCompany(true);
    } else {
      setShowOtherCompany(false);
      setValue('otherCompany', '');
    }
  }, [company, setValue]);

  return (
    <div className="min-h-screen bg-[var(--portal-bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div 
          className="bg-[var(--portal-card-bg)] rounded-2xl shadow-xl p-8 border border-[var(--portal-border)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-8">
            <div className="h-12 w-12 rounded-xl bg-gold-500 flex items-center justify-center text-black shadow-lg">
              <BuildingIcon className="h-6 w-6" />
            </div>
          </div>

          <motion.h1 
            className="text-2xl font-bold text-center text-[var(--portal-text)] mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {isSignUp ? 'Create an Account' : 'Welcome Back'}
          </motion.h1>

          <motion.p 
            className="text-center text-[var(--portal-text-secondary)] mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {isSignUp ? 'Join our real estate platform today' : 'Sign in to access your dashboard'}
          </motion.p>

          <motion.form 
            className="space-y-6" 
            onSubmit={handleSubmit(onSubmit)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[var(--portal-label-text)] mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gold-500/50" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="dark-input w-full pl-10 py-3 rounded-xl border-[var(--portal-input-border)] focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all duration-200"
                    placeholder="your@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[var(--portal-label-text)] mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gold-500/50" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    {...register('password')}
                    className="dark-input w-full pl-10 py-3 rounded-xl border-[var(--portal-input-border)] focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all duration-200"
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              {isSignUp && (
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-[var(--portal-label-text)] mb-1">
                        First Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gold-500/50" />
                        </div>
                        <input
                          id="firstName"
                          type="text"
                          {...register('firstName')}
                          className="dark-input w-full pl-10 py-3 rounded-xl border-[var(--portal-input-border)] focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all duration-200"
                          placeholder="John"
                        />
                      </div>
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-[var(--portal-label-text)] mb-1">
                        Last Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gold-500/50" />
                        </div>
                        <input
                          id="lastName"
                          type="text"
                          {...register('lastName')}
                          className="dark-input w-full pl-10 py-3 rounded-xl border-[var(--portal-input-border)] focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all duration-200"
                          placeholder="Doe"
                        />
                      </div>
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-[var(--portal-label-text)] mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gold-500/50" />
                      </div>
                      <input
                        id="phoneNumber"
                        type="tel"
                        {...register('phoneNumber')}
                        className="dark-input w-full pl-10 py-3 rounded-xl border-[var(--portal-input-border)] focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all duration-200"
                        placeholder="+251 91 234 5678"
                      />
                    </div>
                    {errors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-500">{errors.phoneNumber.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-[var(--portal-label-text)] mb-1">
                      Real Estate Company
                    </label>
                    <select
                      id="company"
                      {...register('company')}
                      className="dark-input w-full px-4 py-3 rounded-xl border-[var(--portal-input-border)] focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all duration-200"
                    >
                      <option value="">Select your company</option>
                      {REAL_ESTATE_COMPANIES.map((company) => (
                        <option key={company} value={company}>
                          {company}
                        </option>
                      ))}
                    </select>
                    {errors.company && (
                      <p className="mt-1 text-sm text-red-500">{errors.company.message}</p>
                    )}
                  </div>

                  {showOtherCompany && (
                    <div>
                      <label htmlFor="otherCompany" className="block text-sm font-medium text-[var(--portal-label-text)] mb-1">
                        Company Name
                      </label>
                      <input
                        id="otherCompany"
                        type="text"
                        {...register('otherCompany')}
                        className="dark-input w-full px-4 py-3 rounded-xl border-[var(--portal-input-border)] focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 transition-all duration-200"
                        placeholder="Enter your company name"
                      />
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                className="w-full gradient-btn py-3 rounded-xl text-base font-medium shadow-lg shadow-gold-500/20 hover:shadow-gold-500/30 transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>{isSignUp ? 'Create Account' : 'Sign In'}</>
                )}
              </Button>
            </motion.div>
          </motion.form>

          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                reset();
              }}
              className="text-sm text-gold-400 hover:text-gold-500 transition-colors"
            >
              {isSignUp
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
