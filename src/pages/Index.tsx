import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, CheckCircle, Link as LinkIcon, Home, DollarSign } from 'lucide-react';
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

  // Fallback error message for invalid/missing role or status
  const showRoleStatusError = user && (!userRole || !['super_admin', 'agent'].includes(userRole) || (userRole === 'agent' && !['approved', 'pending_approval'].includes(userStatus)));

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--portal-bg)] to-[var(--portal-card-bg)] text-[var(--portal-text)] overflow-hidden">
      {/* Hero Section */}
      <section className="min-h-screen relative flex items-center justify-center">
        {/* Enhanced Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Main gradient overlay */}
          <div className="absolute inset-0 bg-gradient-radial from-gold-500/5 to-transparent opacity-70"></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'linear-gradient(var(--portal-border) 1px, transparent 1px), linear-gradient(90deg, var(--portal-border) 1px, transparent 1px)', 
            backgroundSize: '40px 40px',
            opacity: 0.1
          }}></div>
          
          {/* Animated gradient circles */}
          <motion.div 
            className="absolute w-[1000px] h-[1000px] rounded-full bg-gradient-to-br from-gold-500/10 to-transparent -top-[400px] left-1/2 transform -translate-x-1/2 blur-3xl"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <motion.div 
            className="absolute w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-gold-500/5 to-transparent -bottom-[300px] left-1/2 transform -translate-x-1/2 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          
          {/* Floating elements with 3D effect */}
          <div className="absolute inset-0">
          {/* Left side floating elements */}
          <motion.div
              className="absolute w-32 h-32 rounded-2xl bg-gradient-to-br from-gold-500/20 to-gold-500/5 top-[15%] left-[10%] backdrop-blur-sm border border-gold-500/10"
              style={{ transform: 'perspective(1000px) rotateX(10deg) rotateY(-10deg)' }}
            animate={{ 
              y: [0, -30, 0],
                rotateZ: [0, 5, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
            
          <motion.div
              className="absolute w-20 h-20 rounded-xl bg-gradient-to-tr from-gold-500/10 to-transparent bottom-[25%] left-[15%] backdrop-blur-sm border border-gold-500/10"
              style={{ transform: 'perspective(1000px) rotateX(-5deg) rotateY(10deg)' }}
            animate={{
                y: [0, 40, 0],
                rotateZ: [0, -3, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
          
          {/* Right side floating elements */}
          <motion.div
              className="absolute w-24 h-24 rounded-2xl bg-gradient-to-bl from-gold-500/15 to-transparent top-[20%] right-[12%] backdrop-blur-sm border border-gold-500/10"
              style={{ transform: 'perspective(1000px) rotateX(5deg) rotateY(10deg)' }}
            animate={{
                y: [0, 30, 0],
                rotateZ: [0, -5, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          </div>
        </div>
        
        <div className="container mx-auto px-6 lg:px-8 relative z-10 py-20">
          <div className="max-w-3xl mx-auto">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div 
                className="inline-block mb-6 px-6 py-2 rounded-full bg-gradient-to-r from-gold-500/20 to-gold-500/10 border border-gold-500/20 backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-gold-400 font-semibold text-sm">The Ultimate Real Estate Platform</span>
              </motion.div>
              
              <motion.h1 
                className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Your Name. Your Listings.{" "}
                <span className="relative">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-gold-300">Your Clients.</span>
                  <motion.span 
                    className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-gold-500 to-gold-300 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.8, delay: 1.2 }}
                  ></motion.span>
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl text-[var(--portal-text-secondary)] mb-10 max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Create your profile, list under your name, and share your link with clients.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-6 justify-center mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                {showRoleStatusError && (
                  <div className="bg-red-100 text-red-700 rounded-lg px-4 py-3 mb-4 w-full text-center">
                    <strong>Account Issue:</strong> Your account role or status is not recognized.<br />
                    Please contact support or try signing out and in again.
                  </div>
                )}
                {!user ? (
                  <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/auth">
                    <Button 
                      size="lg" 
                        className="bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-600 hover:to-gold-500 text-black px-10 py-6 rounded-xl shadow-xl shadow-gold-500/20 hover:shadow-gold-500/30 transition-all duration-300 w-full sm:w-auto font-semibold text-base"
                        onClick={() => {
                          localStorage.setItem('authMode', 'signup');
                        }}
                    >
                      Get Started Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                    <Link to="/auth">
                      <Button 
                        size="lg" 
                        variant="outline"
                        className="border-2 border-gold-500 text-gold-500 hover:bg-gold-500/10 px-10 py-6 rounded-xl transition-all duration-300 w-full sm:w-auto font-semibold text-base"
                        onClick={() => {
                          localStorage.setItem('authMode', 'signin');
                        }}
                      >
                        Sign In
                      </Button>
                    </Link>
                  </motion.div>
                  </>
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
              </motion.div>
              
              <motion.div 
                className="flex flex-wrap justify-center gap-4 text-[var(--portal-text-secondary)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1 }}
              >
                <motion.div 
                  className="flex items-center px-5 py-2 rounded-full bg-gold-500/5 border border-gold-500/10"
                  whileHover={{ y: -3, backgroundColor: 'rgba(255, 215, 0, 0.1)' }}
                >
                  <LinkIcon className="h-4 w-4 text-gold-500 mr-2" />
                  <span className="font-medium text-sm">Personalized Agent Link</span>
                </motion.div>
                
                <motion.div 
                  className="flex items-center px-5 py-2 rounded-full bg-gold-500/5 border border-gold-500/10"
                  whileHover={{ y: -3, backgroundColor: 'rgba(255, 215, 0, 0.1)' }}
                >
                  <Home className="h-4 w-4 text-gold-500 mr-2" />
                  <span className="font-medium text-sm">100 Listings/6 Month</span>
                </motion.div>
                
                <motion.div 
                  className="flex items-center px-5 py-2 rounded-full bg-gold-500/5 border border-gold-500/10"
                  whileHover={{ y: -3, backgroundColor: 'rgba(255, 215, 0, 0.1)' }}
                >
                  <DollarSign className="h-4 w-4 text-gold-500 mr-2" />
                  <span className="font-medium text-sm">5000 ETB/6 Month</span>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
