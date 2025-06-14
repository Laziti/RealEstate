import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles: Array<'super_admin' | 'agent'>;
  requiredStatus?: Array<string> | null;
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  requiredStatus = null 
}) => {
  const { user, userRole, userStatus, loading } = useAuth();
  const location = useLocation();

  // Show loading state
  if (loading) {
    return <LoadingScreen />;
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If user role doesn't have permission, redirect to appropriate dashboard
  if (userRole && !allowedRoles.includes(userRole)) {
    // Redirect super_admin to admin dashboard
    if (userRole === 'super_admin') {
      return <Navigate to="/admin" replace />;
    }
    // Redirect agent to agent dashboard or pending page depending on status
    if (userRole === 'agent') {
      if (userStatus === 'approved' || userStatus === 'active') {
        return <Navigate to="/dashboard" replace />;
      } else {
        return <Navigate to="/pending" replace />;
      }
    }
    // Fallback to login page
    return <Navigate to="/auth" replace />;
  }

  // If status check is required and status doesn't match, redirect
  if (requiredStatus !== null && userStatus && !requiredStatus.includes(userStatus)) {
    if (userRole === 'agent' && userStatus === 'pending_approval') {
      return <Navigate to="/pending" replace />;
    }
    
    if (userRole === 'agent' && (userStatus === 'approved' || userStatus === 'active')) {
      return <Navigate to="/dashboard" replace />;
    }
    
    if (userRole === 'super_admin') {
      return <Navigate to="/admin" replace />;
    }
    
    return <Navigate to="/auth" replace />;
  }

  // If authenticated and has permission with correct status, render children
  return <>{children}</>;
};

export default ProtectedRoute;
