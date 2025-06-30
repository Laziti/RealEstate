import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { user, userRole, userStatus } = useAuth();
  const navigate = useNavigate();

  // Redirect based on role
  useEffect(() => {
    if (user && userRole) {
      if (userRole === 'super_admin') {
        navigate('/admin');
      } else if (userRole === 'agent' && (userStatus === 'approved' || userStatus === 'active')) {
        navigate('/dashboard');
      } else if (userRole === 'agent' && userStatus === 'pending_approval') {
        navigate('/pending');
      }
    }
  }, [user, userRole, userStatus, navigate]);

  // Redirect to auth page immediately
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // This is now just a fallback in case there's an issue with the redirect
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--portal-bg)] to-[var(--portal-card-bg)] text-[var(--portal-text)] flex items-center justify-center">
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-4xl font-bold mb-6">Welcome to the Real Estate Portal</h1>
        
                {!user ? (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/auth">
                    <Button 
                      size="lg" 
                className="bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-600 hover:to-gold-500 text-black px-10 py-6 rounded-xl shadow-xl shadow-gold-500/20 hover:shadow-gold-500/30 transition-all duration-300 font-semibold text-base"
                    >
                Continue to Login
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  </motion.div>
                ) : (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={() => userRole === 'super_admin' ? navigate('/admin') : navigate('/dashboard')}
                      className="bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-600 hover:to-gold-500 text-black px-10 py-6 rounded-xl shadow-xl shadow-gold-500/20 hover:shadow-gold-500/30 transition-all duration-300 font-semibold text-base"
                  >
                    Go to Dashboard
                  </Button>
                  </motion.div>
                )}
        </div>
    </div>
  );
};

export default Index;
