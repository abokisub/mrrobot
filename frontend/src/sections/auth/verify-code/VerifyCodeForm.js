import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { OutlinedInput, Stack, Alert, Typography, Box } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import useAuth from '../../../hooks/useAuth';
import useIsMountedRef from '../../../hooks/useIsMountedRef';
import axios from '../../../utils/axios';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';

// ----------------------------------------------------------------------

export default function VerifyCodeForm() {
  const { verify, user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const isMountedRef = useIsMountedRef();
  const navigate = useNavigate();
  
  // Calculate initial time left from stored expiration or default to 60
  const getInitialTimeLeft = () => {
    const storedExpiration = localStorage.getItem('otp_expires_at');
    if (storedExpiration) {
      const expirationTime = new Date(storedExpiration).getTime();
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expirationTime - now) / 1000));
      if (remaining <= 0) {
        // OTP already expired, clear it
        localStorage.removeItem('otp_expires_at');
        return { timeLeft: 0, isExpired: true };
      }
      return { timeLeft: remaining, isExpired: false };
    }
    // If no stored expiration, set expiration time now (60 seconds from now)
    // This happens when user directly navigates to verify page
    const expirationTime = Date.now() + 60000; // 60 seconds
    localStorage.setItem('otp_expires_at', new Date(expirationTime).toISOString());
    return { timeLeft: 60, isExpired: false };
  };
  
  const initial = getInitialTimeLeft();
  const [timeLeft, setTimeLeft] = useState(initial.timeLeft);
  const [isExpired, setIsExpired] = useState(initial.isExpired);
  const [isVerifying, setIsVerifying] = useState(false);
  const timerRef = useRef(null);
  const verificationAttemptedRef = useRef(false);

  const VerifyCodeSchema = Yup.object().shape({
    code1: Yup.string().required('Code is required'),
    code2: Yup.string().required('Code is required'),
    code3: Yup.string().required('Code is required'),
    code4: Yup.string().required('Code is required'),
    code5: Yup.string().required('Code is required'),
    code6: Yup.string().required('Code is required'),
  });

  const defaultValues = {
    code1: '',
    code2: '',
    code3: '',
    code4: '',
    code5: '',
    code6: '',
  };

  const {
    watch,
    control,
    setValue,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    mode: 'onBlur',
    defaultValues,
    resolver: yupResolver(VerifyCodeSchema),
  });

  const values = watch();

  // Listen for OTP resend event to reset expiration state
  useEffect(() => {
    const handleOtpResent = (event) => {
      const { expiresAt } = event.detail;
      if (expiresAt) {
        // Reset expiration state
        setIsExpired(false);
        const expirationTime = new Date(expiresAt).getTime();
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((expirationTime - now) / 1000));
        setTimeLeft(remaining);
        
        // Reset verification attempt flag
        verificationAttemptedRef.current = false;
        
        // Clear all input fields
        Object.keys(defaultValues).forEach((key) => {
          setValue(key, '');
        });
        
        // Restart timer with new expiration
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        
        timerRef.current = setInterval(() => {
          const now = Date.now();
          const remaining = Math.max(0, Math.floor((expirationTime - now) / 1000));
          
          if (remaining <= 0) {
            setIsExpired(true);
            setTimeLeft(0);
            localStorage.removeItem('otp_expires_at');
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
          } else {
            setTimeLeft(remaining);
          }
        }, 1000);
      }
    };
    
    window.addEventListener('otpResent', handleOtpResent);
    
    return () => {
      window.removeEventListener('otpResent', handleOtpResent);
    };
  }, [setValue]);

  // Countdown timer - persists across page refreshes
  useEffect(() => {
    // Get expiration time from localStorage or calculate it
    const getExpirationTime = () => {
      const storedExpiration = localStorage.getItem('otp_expires_at');
      if (storedExpiration) {
        return new Date(storedExpiration).getTime();
      }
      // If no stored expiration, set it to 60 seconds from now
      const expirationTime = Date.now() + 60000;
      localStorage.setItem('otp_expires_at', new Date(expirationTime).toISOString());
      return expirationTime;
    };
    
    const expirationTime = getExpirationTime();
    
    // Update countdown every second
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expirationTime - now) / 1000));
      
      if (remaining <= 0) {
        setIsExpired(true);
        setTimeLeft(0);
        localStorage.removeItem('otp_expires_at'); // Clear expired OTP
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Auto-verify when all 6 digits are entered
  useEffect(() => {
    const code = Object.values(values).join('');
    const allFieldsFilled = code.length === 6 && code.split('').every(digit => digit.trim() !== '');
    
    if (allFieldsFilled && !verificationAttemptedRef.current && !isExpired && !isSubmitting) {
      verificationAttemptedRef.current = true;
      // Small delay to ensure all fields are updated
      setTimeout(() => {
        handleAutoVerify(code);
      }, 100);
    }
  }, [values, isExpired, isSubmitting]);

  const handleAutoVerify = async (code) => {
    if (!user || !user.email) {
      verificationAttemptedRef.current = false;
      return;
    }
    
    setIsVerifying(true);
    try {
      await verify(code, user.email);
      // Clear OTP expiration on successful verification
      localStorage.removeItem('otp_expires_at');
      enqueueSnackbar('Account Verified Successfully!', { variant: 'success' });
      // Navigate to dashboard after successful verification
      setTimeout(() => {
        navigate(PATH_DASHBOARD.general.app, { replace: true });
      }, 500);
    } catch (error) {
      setIsVerifying(false);
      verificationAttemptedRef.current = false;
      if (isMountedRef.current) {
        const errorMessage = error?.response?.data?.message || error?.message || 'Invalid OTP. Please try again.';
        setError('afterSubmit', { 
          message: errorMessage,
          type: 'manual'
        });
        // Clear all fields on error
        Object.keys(defaultValues).forEach((key) => {
          setValue(key, '');
        });
        // Focus first field
        setTimeout(() => {
          const firstField = document.querySelector('input[name=code1]');
          if (firstField) {
            firstField.focus();
          }
        }, 100);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('paste', handlePasteClipboard);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data) => {
    const key = Object.values(data).join('');
    setIsVerifying(true);
    try {
      await verify(key, user.email);
      // Clear OTP expiration on successful verification
      localStorage.removeItem('otp_expires_at');
      enqueueSnackbar('Account Verified Successfully!', { variant: 'success' });
      setTimeout(() => {
        navigate(PATH_DASHBOARD.general.app, { replace: true });
      }, 500);
    } catch (error) {
      setIsVerifying(false);
      if (isMountedRef.current) {
        setError('afterSubmit', error);
      }
    }
  };

  const handlePasteClipboard = (event) => {
    let data = event?.clipboardData?.getData('Text') || '';

    data = data.split('');

    [].forEach.call(document.querySelectorAll('#field-code'), (node, index) => {
      node.value = data[index];
      const fieldIndex = `code${index + 1}`;
      setValue(fieldIndex, data[index]);
    });
  };

  const handleChangeWithNextField = (event, handleChange) => {
    const { maxLength, value, name } = event.target;
    const fieldIndex = name.replace('code', '');

    const fieldIntIndex = Number(fieldIndex);

    if (value.length >= maxLength) {
      if (fieldIntIndex < 6) {
        const nextfield = document.querySelector(`input[name=code${fieldIntIndex + 1}]`);
        if (nextfield !== null) {
          nextfield.focus();
        }
      }
    }

    handleChange(event);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {!!errors.afterSubmit && <Alert severity="error" sx={{ mb: 2 }}>{errors.afterSubmit.message}</Alert>}
      
      {isExpired && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          OTP has expired. Please request a new one.
        </Alert>
      )}

      <Stack direction="row" spacing={2} justifyContent="center">
        {Object.keys(values).map((name, index) => (
          <Controller
            key={name}
            name={`code${index + 1}`}
            control={control}
            render={({ field }) => (
              <OutlinedInput
                {...field}
                id="field-code"
                autoFocus={index === 0}
                placeholder="-"
                disabled={isExpired || isSubmitting || isVerifying}
                onChange={(event) => handleChangeWithNextField(event, field.onChange)}
                inputProps={{
                  maxLength: 1,
                  sx: {
                    p: 0,
                    textAlign: 'center',
                    width: { xs: 36, sm: 56 },
                    height: { xs: 36, sm: 56 },
                  },
                }}
              />
            )}
          />
        ))}
      </Stack>

      {/* Countdown Timer */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color={isExpired ? 'error.main' : 'text.secondary'}>
          {isExpired ? (
            'OTP Expired'
          ) : (
            <>
              OTP expires in: <strong>{formatTime(timeLeft)}</strong>
            </>
          )}
        </Typography>
      </Box>

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting || isVerifying}
        disabled={!isValid || isExpired || isVerifying}
        sx={{ mt: 3 }}
      >
        {isVerifying ? 'Logging in...' : 'Verify'}
      </LoadingButton>
    </form>
  );
}
