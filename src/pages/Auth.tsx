import React from 'react'; // Removed useState, useEffect
// import { useNavigate, Link } from 'react-router-dom'; // Link not used, useNavigate might be needed later for redirection after AuthHero's own logic
// import { useAuth } from '@/contexts/AuthContext'; // Might be needed later for wiring up AuthHero
// import { Button } from '@/components/ui/button'; // Button from ui is not directly used by Auth page now
// import { z } from 'zod'; // Related to old form
// import { useForm } from 'react-hook-form'; // Related to old form
// import { zodResolver } from '@hookform/resolvers/zod'; // Related to old form
// import { Check as CheckIcon, Building as BuildingIcon, ArrowLeft, Mail, Lock, User, Phone } from 'lucide-react'; // Icons for old form
// import { motion } from 'framer-motion'; // Framer motion for old form animations
// import { supabase } from '@/integrations/supabase/client'; // Supabase client for old form logic
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Select for old form

import AuthHero from '@/components/public/AuthHero';

// const REAL_ESTATE_COMPANIES = [ // Related to old form
//   "Noah Real Estate",
//   "Gift Real Estate",
//   "Flintstone Homes",
//   "Afro-Tsion Real Estate",
//   "Ayat Share Company",
//   "Sunshine Real Estate",
//   "Zemen Bank Real Estate",
//   "Tsehay Real Estate",
//   "Other"
// ] as const;

// const signInSchema = z.object({ // Related to old form
//   email: z.string().email({ message: 'Invalid email address' }),
//   password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
// });

// const signUpSchema = signInSchema.extend({ // Related to old form
//   firstName: z.string().min(1, { message: 'First name is required' }),
//   lastName: z.string().min(1, { message: 'Last name is required' }),
//   phoneNumber: z.string().min(10, { message: 'Valid phone number is required' }),
//   company: z.string().min(1, { message: 'Company is required' }),
//   otherCompany: z.string().optional(),
// });

// type SignInFormValues = z.infer<typeof signInSchema>; // Related to old form
// type SignUpFormValues = z.infer<typeof signUpSchema>; // Related to old form
// type FormValues = SignUpFormValues; // Related to old form

const Auth = () => {
  // const [isSignUp, setIsSignUp] = useState(false); // Logic moved to AuthHero or will be handled differently
  // const [isLoading, setIsLoading] = useState(false); // Logic moved to AuthHero or will be handled differently
  // const [showOtherCompany, setShowOtherCompany] = useState(false); // Related to old form
  // const { signIn, signUp, user, userRole } = useAuth(); // Might be needed later
  // const navigate = useNavigate(); // Might be needed later

  // useEffect(() => { // Related to old form's tab switching
  //   const authMode = localStorage.getItem('authMode');
  //   if (authMode === 'signup') {
  //     setIsSignUp(true);
  //   } else if (authMode === 'signin') {
  //     setIsSignUp(false);
  //   }
  //   localStorage.removeItem('authMode');
  // }, []);

  // const { // Related to old form
  //   register,
  //   handleSubmit,
  //   formState: { errors },
  //   reset,
  //   watch,
  //   setValue,
  // } = useForm<FormValues>({
  //   resolver: zodResolver(isSignUp ? signUpSchema : signInSchema),
  //   defaultValues: {
  //     email: '',
  //     password: '',
  //     firstName: '',
  //     lastName: '',
  //     phoneNumber: '',
  //     company: '',
  //     otherCompany: '',
  //   },
  // });

  // useEffect(() => { // Related to old form
  //   reset();
  // }, [isSignUp, reset]);

  // const onSubmit = async (data: FormValues) => { // This logic needs to be integrated with AuthHero later
  //   setIsLoading(true);
  //   try {
  //     if (isSignUp) {
  //       // ... old sign up logic
  //     } else {
  //       // ... old sign in logic
  //     }
  //   } catch (error: any) {
  //     console.error('Authentication error:', error);
  //     alert(error.message || 'An error occurred during authentication');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const company = watch('company'); // Related to old form

  // useEffect(() => { // Related to old form
  //   if (company === 'Other') {
  //     setShowOtherCompany(true);
  //   } else {
  //     setShowOtherCompany(false);
  //     setValue('otherCompany', '');
  //   }
  // }, [company, setValue]);

  return (
    // The AuthHero component is designed to be full-page, so we might not need these outer divs,
    // or AuthHero's own root div will act as the primary container.
    // For now, let AuthHero manage its own background and layout.
    <AuthHero />
  );
};

export default Auth;
