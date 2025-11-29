import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import swal from 'sweetalert';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Button, Link, Container, Typography } from '@mui/material';
// layouts
import LogoOnlyLayout from '../../layouts/LogoOnlyLayout';
// routes
import { PATH_AUTH, PATH_DASHBOARD } from '../../routes/paths';
// components
import Page from '../../components/Page';
import Iconify from '../../components/Iconify';
// sections
import { VerifyCodeForm } from '../../sections/auth/verify-code';
import axios from '../../utils/axios';
// hooks
import useAuth from '../../hooks/useAuth';

// ----------------------------------------------------------------------


const RootStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  height: '100%',
  alignItems: 'center',
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------
function Resend (email, onResendSuccess){
  swal({
    title: "Note",
    text: "Do You Want A New OTP?",
    icon: "info",
    button: {
      text: "Proceed",
      closeModal: false,
    },
    dangerMode: true,
  }) .then((willDelete) => {
    if (willDelete) {
  axios.get(`/api/user/resend/${email}/otp`,{
}).then(resp => {
    // Update expiration time in localStorage (60 seconds from now)
    const expirationTime = new Date(Date.now() + 60000).toISOString();
    localStorage.setItem('otp_expires_at', expirationTime);
    
    // Trigger custom event to notify VerifyCodeForm to reset expiration
    window.dispatchEvent(new CustomEvent('otpResent', { detail: { expiresAt: expirationTime } }));
    
    swal(resp.data.message);
    
    // Call callback if provided
    if (onResendSuccess) {
      onResendSuccess();
    }
}).catch(error => {
    if(error.message === ''){
      swal('Opps!','An Error Occured','error');
    }else{
    swal("Opps!", error.message, "error");
    }
});
} else {
  swal("Request Cancelled");
}
});
}
export default function VerifyCode() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Redirect logic - handled by RestGuard, but add safety check here too
  useEffect(() => {
    // Only redirect if authentication is fully initialized
    if (isAuthenticated === true) {
      // Check if user status is 0 (unverified) - this is the primary check
      const isUnverified = user && user.status === 0;
      
      // Also check if user still has pending OTP (needs verification)
      const hasPendingOtp = user && user.otp && user.otp.toString().trim() !== '';
      
      // If user is unverified (status === 0) OR has pending OTP, stay on verify page
      if (isUnverified || hasPendingOtp) {
        // User needs verification - stay on verify page
        return;
      }
      
      // User is fully verified with no pending OTP - redirect to dashboard
      // Small delay to prevent flash of verify page
      const timer = setTimeout(() => {
        navigate(PATH_DASHBOARD.general.app, { replace: true });
      }, 100);
      return () => clearTimeout(timer);
    } else if (isAuthenticated !== 'verify' && isAuthenticated !== false && isAuthenticated !== null) {
      // User is not in verify state and not authenticated, redirect to login
      navigate(PATH_AUTH.login, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);
  
  // Show loading if user data is not available yet
  if (!user || !user.email) {
    return (
      <Page title="Verify">
        <RootStyle>
          <LogoOnlyLayout />
          <Container>
            <Box sx={{ maxWidth: 480, mx: 'auto', textAlign: 'center', py: 5 }}>
              <Typography variant="h6">Loading...</Typography>
            </Box>
          </Container>
        </RootStyle>
      </Page>
    );
  }
  
  return (
    <Page title="Verify">
      <RootStyle>
        <LogoOnlyLayout />
        <Container>
          <Box sx={{ maxWidth: 480, mx: 'auto' }}>
            <Button
              size="small"
              component={RouterLink}
              to={PATH_AUTH.login}
              startIcon={<Iconify icon={'eva:arrow-ios-back-fill'} width={20} height={20} />}
              sx={{ mb: 3 }}
            >
              Back
            </Button>

            <Typography variant="h3" paragraph>
              Please check your email!
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              We have emailed a 6-digit confirmation code to {user?.email} (spam folder), or  {user?.phone} please enter the code in below box to verify
              your email.
            </Typography>

            <Box sx={{ mt: 5, mb: 3 }}>
              <VerifyCodeForm />
            </Box>

            <Typography variant="body2" align="center">
              Don't have a code? &nbsp;
              <Link variant="subtitle2" underline="none" onClick={() => {Resend(user?.email)}}>
                Resend code
              </Link>
            </Typography>
          </Box>
        </Container>
      </RootStyle>
    </Page>
  );
}
