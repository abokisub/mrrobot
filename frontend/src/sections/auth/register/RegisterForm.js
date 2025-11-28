import * as Yup from 'yup';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { styled } from '@mui/material/styles';
import { 
  Stack, 
  IconButton, 
  InputAdornment, 
  Alert, 
  Box, 
  Typography, 
  LinearProgress,
  Button,
  FormControl,
  FormLabel,
  Link
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// hooks
import useAuth from '../../../hooks/useAuth';
import useIsMountedRef from '../../../hooks/useIsMountedRef';
// components
import Iconify from '../../../components/Iconify';
import { FormProvider, RHFTextField, RHFSelect, RHFRadioGroup } from '../../../components/hook-form';
// routes
import { PATH_AUTH } from '../../../routes/paths';

// ----------------------------------------------------------------------

const ProgressBarStyle = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: theme.palette.grey[200],
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    backgroundColor: '#00D9A5', // Green color
  },
}));

const StepButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(1.5, 3),
  fontSize: '1rem',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: 'none',
  '&:hover': {
    boxShadow: 'none',
  },
}));

const BackButton = styled(StepButton)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.grey[300]}`,
  '&:hover': {
    backgroundColor: theme.palette.grey[50],
    borderColor: theme.palette.grey[400],
  },
}));

const NextButton = styled(StepButton)(({ theme }) => ({
  backgroundColor: '#00D9A5', // Green color
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: '#00C594',
  },
}));

const PasswordStrengthBar = styled(Box)(({ strength }) => ({
  height: 4,
  borderRadius: 2,
  marginTop: 4,
  backgroundColor: strength === 'weak' ? '#f44336' : strength === 'medium' ? '#ff9800' : '#4caf50',
  width: strength === 'weak' ? '33%' : strength === 'medium' ? '66%' : '100%',
}));

// ----------------------------------------------------------------------

const STEPS = ['Personal', 'Address', 'Contact', 'Review'];

// Nigerian States
const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

export default function RegisterForm() {
  const { register } = useAuth();
  const { name = '' } = useParams();
  const navigate = useNavigate();
  const isMountedRef = useIsMountedRef();

  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('weak');
  const [passwordsMatch, setPasswordsMatch] = useState(false);

  // Step 1 Schema
  const Step1Schema = Yup.object().shape({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    username: Yup.string()
      .required('Username is required')
      .min(3, 'Username must be at least 3 characters')
      .max(12, 'Username must not exceed 12 characters')
      .matches(/^[a-zA-Z0-9]+$/, 'Username can only contain letters and numbers'),
    gender: Yup.string().required('Gender is required'),
  });

  // Step 2 Schema
  const Step2Schema = Yup.object().shape({
    state: Yup.string().required('State is required'),
    city: Yup.string().required('City is required'),
    streetAddress: Yup.string().required('Street address is required'),
  });

  // Step 3 Schema
  const Step3Schema = Yup.object().shape({
    phone: Yup.string()
      .required('Phone number is required')
      .matches(/^0[0-9]{10}$/, 'Phone number must start with 0 and be 11 digits'),
    password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters'),
    confirmPassword: Yup.string()
      .required('Confirm password is required')
      .oneOf([Yup.ref('password')], 'Passwords must match'),
    email: Yup.string()
      .required('Email is required')
      .email('Invalid email address'),
    pin: Yup.string()
      .required('Transaction PIN is required')
      .matches(/^[0-9]{4}$/, 'PIN must be 4 digits'),
  });

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      gender: '',
      state: '',
      city: '',
      streetAddress: '',
      phone: '',
      password: '',
      confirmPassword: '',
      email: '',
      pin: '',
      ref: name || '',
    },
  });

  const {
    watch,
    trigger,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  // Calculate password strength
  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return 'weak';
    if (pwd.length < 8) return 'weak';
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    const strengthCount = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
    if (strengthCount <= 2) return 'weak';
    if (strengthCount === 3) return 'medium';
    return 'strong';
  };

  // Watch password changes
  const passwordValue = watch('password');
  const confirmPasswordValue = watch('confirmPassword');

  // Update password strength when password changes
  useEffect(() => {
    if (passwordValue) {
      setPasswordStrength(calculatePasswordStrength(passwordValue));
    }
    if (passwordValue && confirmPasswordValue) {
      setPasswordsMatch(passwordValue === confirmPasswordValue);
    } else {
      setPasswordsMatch(false);
    }
  }, [passwordValue, confirmPasswordValue]);

  const handleNext = async () => {
    let isValid = false;
    let fieldsToValidate = [];
    
    if (activeStep === 0) {
      fieldsToValidate = ['firstName', 'lastName', 'username', 'gender'];
      isValid = await trigger(fieldsToValidate);
    } else if (activeStep === 1) {
      fieldsToValidate = ['state', 'city', 'streetAddress'];
      isValid = await trigger(fieldsToValidate);
    } else if (activeStep === 2) {
      fieldsToValidate = ['phone', 'password', 'confirmPassword', 'email', 'pin'];
      isValid = await trigger(fieldsToValidate);
    }

    // Only proceed if all fields are valid
    if (isValid) {
      // Double-check that all required fields have values
      const values = methods.getValues();
      let allFieldsFilled = true;
      
      if (activeStep === 0) {
        allFieldsFilled = 
          values.firstName?.trim() !== '' &&
          values.lastName?.trim() !== '' &&
          values.username?.trim() !== '' &&
          values.gender !== '';
      } else if (activeStep === 1) {
        allFieldsFilled = 
          values.state?.trim() !== '' &&
          values.city?.trim() !== '' &&
          values.streetAddress?.trim() !== '';
      } else if (activeStep === 2) {
        allFieldsFilled = 
          values.phone?.trim() !== '' &&
          values.password?.trim() !== '' &&
          values.confirmPassword?.trim() !== '' &&
          values.email?.trim() !== '' &&
          values.pin?.trim() !== '' &&
          values.password === values.confirmPassword;
      }
      
      if (allFieldsFilled && isValid) {
        setActiveStep((prev) => prev + 1);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const onSubmit = async (data) => {
    try {
      // Combine first and last name
      const fullName = `${data.firstName} ${data.lastName}`;
      
      await register(
        data.email,
        data.password,
        fullName,
        data.username,
        data.phone,
        data.ref || '',
        data.pin
      );
    } catch (error) {
      if (isMountedRef.current) {
        setError('afterSubmit', error);
      }
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Personal
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <RHFTextField name="firstName" label="First name" placeholder="First name" />
              <RHFTextField name="lastName" label="Last name" placeholder="Last name" />
            </Stack>
            <RHFTextField name="username" label="Username" placeholder="Username" />
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ mb: 1, fontWeight: 500 }}>
                Gender
              </FormLabel>
              <RHFRadioGroup
                name="gender"
                row
                options={['male', 'female']}
                getOptionLabel={['Male', 'Female']}
              />
            </FormControl>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Address
            </Typography>
            <RHFSelect
              name="state"
              label="State"
              placeholder="Select state"
            >
              <option value="">Select state</option>
              {NIGERIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </RHFSelect>
            <RHFTextField name="city" label="City" placeholder="City" />
            <RHFTextField
              name="streetAddress"
              label="Street address"
              placeholder="Street, apartment, etc."
            />
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Contact & Password
            </Typography>
            <RHFTextField
              name="phone"
              label="Phone number"
              placeholder="Enter your Phone Number"
              type="tel"
            />
            <Box>
              <RHFTextField
                name="password"
                label="Password"
                placeholder="Create pass"
                type={showPassword ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={() => setShowPassword(!showPassword)}
                        sx={{ color: 'text.secondary' }}
                      >
                        <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {password && (
                <Box sx={{ mt: 1 }}>
                  <PasswordStrengthBar strength={passwordStrength} />
                  <Typography
                    variant="caption"
                    sx={{
                      color: passwordStrength === 'weak' ? 'error.main' : passwordStrength === 'medium' ? 'warning.main' : 'success.main',
                      mt: 0.5,
                      display: 'block',
                    }}
                  >
                    Password strength: {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                  </Typography>
                </Box>
              )}
            </Box>
            <Box>
              <RHFTextField
                name="confirmPassword"
                label="Confirm"
                placeholder="Confirm pass"
                type={showConfirmPassword ? 'text' : 'password'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        sx={{ color: 'text.secondary' }}
                      >
                        <Iconify icon={showConfirmPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {confirmPassword && (
                <Box sx={{ mt: 1 }}>
                  <Box
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: passwordsMatch ? '#4caf50' : 'transparent',
                      width: passwordsMatch ? '100%' : 0,
                    }}
                  />
                  {passwordsMatch && (
                    <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: 'block' }}>
                      Passwords match
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
            <RHFTextField name="email" label="Email" placeholder="you@example.com" type="email" />
            <RHFTextField 
              name="pin" 
              label="Transaction PIN" 
              placeholder="Enter 4-digit PIN" 
              type="number"
              inputProps={{ maxLength: 4 }}
            />
          </Stack>
        );

      case 3:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Review Your Information
            </Typography>
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Name:</strong> {watch('firstName')} {watch('lastName')}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Username:</strong> {watch('username')}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Gender:</strong> {watch('gender')}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Address:</strong> {watch('streetAddress')}, {watch('city')}, {watch('state')}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Phone:</strong> {watch('phone')}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Email:</strong> {watch('email')}
              </Typography>
              <Typography variant="body2">
                <strong>Transaction PIN:</strong> {'*'.repeat(4)}
              </Typography>
            </Box>
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {!!errors.afterSubmit && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {errors.afterSubmit.message}
          </Alert>
        )}

        {/* Progress Indicator */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Step {activeStep + 1} of 4
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {STEPS[activeStep]}
            </Typography>
          </Stack>
          <ProgressBarStyle
            variant="determinate"
            value={((activeStep + 1) / 4) * 100}
          />
        </Box>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation Buttons */}
        <Stack direction="row" spacing={2} justifyContent="space-between">
          {activeStep > 0 ? (
            <BackButton fullWidth onClick={handleBack}>
              Back
            </BackButton>
          ) : (
            <Box sx={{ flex: 1 }} />
          )}
          {activeStep < 3 ? (
            <NextButton
              fullWidth
              onClick={handleNext}
              endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
            >
              Next
            </NextButton>
          ) : (
            <LoadingButton
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              loading={isSubmitting}
              sx={{
                backgroundColor: '#00D9A5',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#00C594',
                },
              }}
              endIcon={<Iconify icon="eva:checkmark-fill" />}
            >
              Create Account
            </LoadingButton>
          )}
        </Stack>

        {/* Validation Error Message */}
        {Object.keys(errors).length > 0 && activeStep < 3 && (
          <Alert severity="error" sx={{ borderRadius: 2, mt: 1 }}>
            Please fill in all required fields before proceeding.
          </Alert>
        )}

        {/* Login Link */}
        <Typography variant="body2" align="center" sx={{ color: 'text.secondary' }}>
          Already have an account?{' '}
          <Link
            component="button"
            type="button"
            onClick={() => navigate(PATH_AUTH.login)}
            sx={{
              color: '#00D9A5',
              fontWeight: 600,
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            Login
          </Link>
        </Typography>
      </Stack>
    </FormProvider>
  );
}
