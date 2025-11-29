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
  
  // If user is fully authenticated (not in verify state), check if they still need verification
  if(isAuthenticated === true){
    // Check if user actually needs verification
    // If user has status field and it's 0, they still need verification
    // Also check if user has pending OTP
    const needsVerification = (user && (
      user.status === 0 || 
      user.status === '0' ||
      (user.otp && user.otp.trim() !== '')
    ));
    
    if (needsVerification) {
      // User is authenticated but still needs verification - allow access to verify page
      // This prevents bypass on page refresh when user status is still 0
      return <>{children}</>;
    }
    
    // User is fully verified - redirect to dashboard
    return <Navigate to={PATH_DASHBOARD.root} replace />;
  }
  
  // Only allow access if user is in verify state
  if(isAuthenticated !== 'verify'){
    return <Navigate to={PATH_AUTH.login} replace />;
  }

  return <>{children}</>;
}

