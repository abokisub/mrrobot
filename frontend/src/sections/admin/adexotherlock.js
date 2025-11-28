import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useMemo, useEffect } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSnackbar } from 'notistack';
// @mui
import { LoadingButton } from '@mui/lab';
import { Box, Card, Grid, Alert, Stack, Typography} from '@mui/material';
import axios from '../../utils/axios';
import { FormProvider,   RHFSwitch} from '../../components/hook-form';

// drop dwon style
import useIsMountedRef from '../../hooks/useIsMountedRef';
// ----------------------------------------------------------------------
AdexOtherLock.propTypes = {
    discount: PropTypes.object,
  };
export default function AdexOtherLock({ discount}) {
    const isMountedRef = useIsMountedRef();
  const NewUserSchema = Yup.object().shape({ });
  const { enqueueSnackbar } = useSnackbar();

  const AccessToken =  window.localStorage.getItem('accessToken');
  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
  });
  const {
    reset,
    setError,
    handleSubmit,
    formState: {errors, isSubmitting },
  } = methods;

  useEffect(() => {
    if (discount && discount !== undefined) {
      reset({
        monnify_atm: discount?.monnify_atm === 1 || discount?.monnify_atm === true,
        monnify: discount?.monnify === 1 || discount?.monnify === true,
        referral: discount?.referral === 1 || discount?.referral === true,
        is_verify_email: discount?.is_verify_email === 1 || discount?.is_verify_email === true,
        is_feature: discount?.is_feature === 1 || discount?.is_feature === true,
        wema: discount?.wema === 1 || discount?.wema === true,
        rolex: discount?.rolex === 1 || discount?.rolex === true,
        fed: discount?.fed === 1 || discount?.fed === true,
        str: discount?.str === 1 || discount?.str === true,
        bulksms: discount?.bulksms === 1 || discount?.bulksms === true,
        allow_pin: discount?.allow_pin === 1 || discount?.allow_pin === true,
        bill: discount?.bill === 1 || discount?.bill === true,
        paystack: discount?.paystack === 1 || discount?.paystack === true,
        bank_transfer: discount?.bank_transfer === 1 || discount?.bank_transfer === true,
        allow_limit: discount?.allow_limit === 1 || discount?.allow_limit === true,
        stock: discount?.stock === 1 || discount?.stock === true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discount]); 
  const onSubmit = async (data) => {
    try {
      await axios.post(`/api/edit/other/lock/account/${AccessToken}/adex/secure`,data)
      enqueueSnackbar('Edited!');
      // Refresh the page to show updated lock status
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
        if (isMountedRef.current){
            setError('afterSubmit', error);
          }
    }
  };
   
  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
     
        <Grid item xs={12} md={8}>
        {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}
          <Card sx={{ p: 3 }}>
     
            <Box
              sx={{
                display: 'grid',
                columnGap: 3,
                rowGap: 3,
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
              }}
            >  
             <RHFSwitch
                name='allow_pin'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Allow Transaction Pin 
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
               <RHFSwitch
                name='monnify_atm'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                AUTOMATED BANK TRANSFER
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />

        <RHFSwitch
                name='monnify'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    MONNIFY 
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
               <RHFSwitch
                name='paystack'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Paystack 
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
               <RHFSwitch
                name='bank_transfer'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Manual Funding 
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
            <RHFSwitch
                name='referral'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    EARNING
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name='is_verify_email'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Email Verification (on SignUP)
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name='is_feature'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Feature Image
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name='wema'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    WEMA BANK
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name='rolex'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    MONNIEPOINT BANK
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
        <RHFSwitch
                name='fed'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    FEDILITY BANK
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name='str'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    STERLING BANK
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name='bulksms'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                 Bulk SMS
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
               <RHFSwitch
                name='bill'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Electricity Bill
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
              <RHFSwitch
                name='allow_limit'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
               Allow User Transaction Limit
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
                  <RHFSwitch
                name='stock'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
             Stock Wallet Lock
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
             </Box>
            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton  fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
               Proceed
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
