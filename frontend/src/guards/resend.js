import PropTypes from 'prop-types';
import { Container, Alert, AlertTitle } from '@mui/material';
import { Navigate } from 'react-router-dom';
// hooks
import useAuth from '../hooks/useAuth';
import LoadingScreen from '../components/LoadingScreen';
import { PATH_DASHBOARD, PATH_AUTH } from '../routes/paths';
// components
// ----------------------------------------------------------------------

RestGuard.propTypes = {
  children: PropTypes.node,
};

export default function RestGuard({ children }) {
  const { isAuthenticated, isInitialized, user } = useAuth();
  if (!isInitialized) {
    return <LoadingScreen />;
  }
  
  // Check if user has a token (even if authentication state is not fully initialized)
  const hasToken = window.localStorage.getItem('accessToken') && 
                   window.localStorage.getItem('accessToken') !== 'undefined' && 
                   window.localStorage.getItem('accessToken') !== '';
  
  // Primary check: user status === 0 means unverified (must verify)
  const isUnverified = user && (user.status === 0 || user.status === '0');
  
  // Secondary check: user has pending OTP
  const hasPendingOtp = user && user.otp && user.otp.toString().trim() !== '';
  
  // If user has token and is unverified, allow access to verify page
  // This handles cases where authentication state might not be fully initialized yet
  if (hasToken && isUnverified) {
    return <>{children}</>;
  }
  
  // If user is fully authenticated (not in verify state), check if they still need verification
  if(isAuthenticated === true){
    // If user is unverified OR has pending OTP, allow access to verify page
    if (isUnverified || hasPendingOtp) {
      // User needs verification - allow access to verify page
      return <>{children}</>;
    }
    
    // User is fully verified - redirect to dashboard
    return <Navigate to={PATH_DASHBOARD.root} replace />;
  }
  
  // Allow access if user is in verify state
  if(isAuthenticated === 'verify'){
    return <>{children}</>;
  }
  
  // If user has token but authentication failed, still allow if status is 0
  // This handles edge cases during initialization
  if (hasToken && isUnverified) {
    return <>{children}</>;
  }
  
  // No token or not unverified - redirect to login
  return <Navigate to={PATH_AUTH.login} replace />;
}

