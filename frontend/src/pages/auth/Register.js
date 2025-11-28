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
import { RegisterForm } from '../../sections/auth/register';

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

// ----------------------------------------------------------------------

export default function Register() {
  const mdUp = useResponsive('up', 'md');

  return (
    <Page title="Create account">
      <RootStyle>
        <HeaderStyle>
          <Logo sx={{ width: { xs: 50, md: 60 }, height: { xs: 50, md: 60 } }} />
        </HeaderStyle>

        {mdUp && (
          <LeftSectionStyle>
            <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
              <Typography variant="h2" sx={{ mb: 3, fontWeight: 700, color: 'text.primary' }}>
                Join {APP_NAME}
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.1rem' }}>
                Create your account and start enjoying seamless digital services today.
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
                    fontSize: { xs: '1.75rem', md: '2rem' }
                  }}
                >
                  Create account
                </Typography>
              </Box>

              {/* Register Form */}
              <RegisterForm />
            </Box>
          </Container>
        </ContentStyle>
      </RootStyle>
    </Page>
  );
}
