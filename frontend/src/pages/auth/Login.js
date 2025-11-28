import { Link as RouterLink } from 'react-router-dom';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Container, Stack, Typography, Link } from '@mui/material';
// routes
import { PATH_AUTH } from '../../routes/paths';
// hooks
import useResponsive from '../../hooks/useResponsive';
// components
import Page from '../../components/Page';
import Logo from '../../components/Logo';
import { APP_NAME } from '../../config';
// sections
import { LoginForm } from '../../sections/auth/login';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.default,
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
  },
}));

const HeaderStyle = styled('header')(({ theme }) => ({
  padding: theme.spacing(3, 2),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4, 5),
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9,
  },
}));

const ContentStyle = styled('div')(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2, 2),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(6, 4),
    width: '50%',
    marginLeft: 'auto',
  },
}));

const LeftSectionStyle = styled(Box)(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.up('md')]: {
    display: 'flex',
    width: '50%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.palette.grey[50],
    padding: theme.spacing(8),
  },
}));

const FooterStyle = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 2),
  textAlign: 'center',
  [theme.breakpoints.up('md')]: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing(2, 5),
  },
}));

// ----------------------------------------------------------------------

export default function Login() {
  const mdUp = useResponsive('up', 'md');

  return (
    <Page title="Login">
      <RootStyle>
        <HeaderStyle>
          <Logo sx={{ width: { xs: 50, md: 60 }, height: { xs: 50, md: 60 } }} />
        </HeaderStyle>

        {mdUp && (
          <LeftSectionStyle>
            <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
              <Typography variant="h2" sx={{ mb: 3, fontWeight: 700, color: 'text.primary' }}>
                Welcome to {APP_NAME}
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.1rem' }}>
                Your trusted platform for digital services. Buy data, airtime, pay bills, and more.
              </Typography>
            </Box>
          </LeftSectionStyle>
        )}

        <ContentStyle>
          <Container maxWidth="sm" sx={{ width: '100%' }}>
            <Box sx={{ maxWidth: 480, mx: 'auto' }}>
              {/* Title Section */}
              <Box sx={{ mb: 3, textAlign: { xs: 'center', md: 'left' } }}>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 0.5,
                    fontSize: { xs: '1.5rem', md: '1.75rem' }
                  }}
                >
                  Sign In {APP_NAME}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    fontSize: { xs: '0.875rem', md: '0.9rem' }
                  }}
                >
                  Hi! Welcome back, you've been missed
                </Typography>
              </Box>

              {/* Login Form */}
              <LoginForm />

              {/* Sign Up Link */}
              <Typography 
                variant="body2" 
                align="center" 
                sx={{ mt: 2.5, color: 'text.secondary' }}
              >
                Don't have an account yet?{' '}
                <Link 
                  component={RouterLink} 
                  to={PATH_AUTH.register}
                  sx={{ 
                    color: 'primary.main',
                    fontWeight: 600,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    }
                  }}
                >
                  Sign Up
                </Link>
              </Typography>
            </Box>
          </Container>
        </ContentStyle>

        <FooterStyle>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Powered by <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>KoboPoint</Box> Digital Media
          </Typography>
        </FooterStyle>
      </RootStyle>
    </Page>
  );
}
