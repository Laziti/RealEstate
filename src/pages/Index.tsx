
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Hero from '@/components/Hero';

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

  // Show hero for non-authenticated users
  if (!user) {
    return <Hero />;
  }

  // Loading state for authenticated users while redirect happens
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
};

export default Index;
