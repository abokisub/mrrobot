import * as Yup from 'yup';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Stack, Alert, IconButton, InputAdornment, Typography, Divider, Button, Link } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// routes
import { PATH_AUTH } from '../../../routes/paths';
// hooks
import useAuth from '../../../hooks/useAuth';
import useIsMountedRef from '../../../hooks/useIsMountedRef';
// components
import Iconify from '../../../components/Iconify';
import { FormProvider, RHFTextField } from '../../../components/hook-form';

// ----------------------------------------------------------------------

const SocialButton = styled(Button)(({ theme }) => ({
  width: 56,
  height: 56,
  minWidth: 56,
  borderRadius: '50%',
  border: `1px solid ${theme.palette.grey[300]}`,
  backgroundColor: theme.palette.common.white,
  '&:hover': {
    backgroundColor: theme.palette.grey[50],
    borderColor: theme.palette.grey[400],
  },
}));

const SignInButton = styled(LoadingButton)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(1.5, 0),
  fontSize: '1rem',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: 'none',
  '&:hover': {
    boxShadow: 'none',
  },
}));

// ----------------------------------------------------------------------

export default function LoginForm() {
  const { login } = useAuth();
  const isMountedRef = useIsMountedRef();
  const [showPassword, setShowPassword] = useState(false);

  const LoginSchema = Yup.object().shape({
    email: Yup.string().required('Username, Email or Phone Number is required'),
    password: Yup.string().required('Password is required'),
  });

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
  });

  const {
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
    } catch (error) {
      if (isMountedRef.current) {
        setError('afterSubmit', error);
      }
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2.5}>
        {!!errors.afterSubmit && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {errors.afterSubmit.message}
          </Alert>
        )}

        {/* Email/Phone Input */}
        <RHFTextField
          name="email"
          label="Phone Number"
          placeholder="Phone Number/ Email"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: 'background.paper',
            },
          }}
        />

        {/* Password Input */}
        <RHFTextField
          name="password"
          label="Enter Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: 'background.paper',
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  sx={{ color: 'text.secondary' }}
                >
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Forgot Password Link */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Link
            component={RouterLink}
            to={PATH_AUTH.resetPassword}
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            Forgot Password?
          </Link>
        </Box>

        {/* Sign In Button */}
        <SignInButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
        >
          Sign In
        </SignInButton>

        {/* Divider with "Or sign in with" */}
        <Box sx={{ position: 'relative', my: 1.5 }}>
          <Divider />
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              px: 2,
              backgroundColor: 'background.default',
              color: 'text.secondary',
            }}
          >
            Or sign in with
          </Typography>
        </Box>

        {/* Social Login Buttons */}
        <Stack direction="row" spacing={2} justifyContent="center">
          <SocialButton>
            <Iconify icon="eva:apple-fill" width={24} height={24} />
          </SocialButton>
          <SocialButton>
            <Iconify icon="eva:google-fill" width={24} height={24} />
          </SocialButton>
          <SocialButton>
            <Iconify icon="eva:facebook-fill" width={24} height={24} />
          </SocialButton>
        </Stack>
      </Stack>
    </FormProvider>
  );
}
