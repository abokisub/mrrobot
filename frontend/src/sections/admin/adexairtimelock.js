import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useMemo, useEffect, useState } from 'react';
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
AdexAirtimeLock.propTypes = {
    discount: PropTypes.object,
  };
export default function AdexAirtimeLock({ discount}) {
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
    if (discount && Array.isArray(discount) && discount.length >= 4) {
      // Find networks by name (case-insensitive)
      const mtn = discount.find(n => n.network && n.network.toUpperCase() === 'MTN');
      const glo = discount.find(n => n.network && n.network.toUpperCase() === 'GLO');
      const airtel = discount.find(n => n.network && n.network.toUpperCase() === 'AIRTEL');
      const mobile = discount.find(n => n.network && (n.network.toUpperCase() === '9MOBILE' || n.network.toUpperCase() === 'MOBILE'));
      
      // Reset form with actual values from database
      reset({
        mtn_vtu: mtn?.network_vtu === 1 || mtn?.network_vtu === true,
        glo_vtu: glo?.network_vtu === 1 || glo?.network_vtu === true,
        airtel_vtu: airtel?.network_vtu === 1 || airtel?.network_vtu === true,
        mobile_vtu: mobile?.network_vtu === 1 || mobile?.network_vtu === true,
        mtn_share: mtn?.network_share === 1 || mtn?.network_share === true,
        glo_share: glo?.network_share === 1 || glo?.network_share === true,
        airtel_share: airtel?.network_share === 1 || airtel?.network_share === true,
        mobile_share: mobile?.network_share === 1 || mobile?.network_share === true,
        mtn_cash: mtn?.cash === 1 || mtn?.cash === true,
        glo_cash: glo?.cash === 1 || glo?.cash === true,
        airtel_cash: airtel?.cash === 1 || airtel?.cash === true,
        mobile_cash: mobile?.cash === 1 || mobile?.cash === true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discount]); 
  const onSubmit = async (data) => {
    try {
      await axios.post(`/api/edit/airtime/lock/account/${AccessToken}/adex/secure`,data)
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
                name='mtn_vtu'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      MTN VTU
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
        <RHFSwitch
                name='airtel_vtu'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      AIRTEL VTU
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
                     <RHFSwitch
                name='glo_vtu'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      GLO VTU
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
       <RHFSwitch
                name='mobile_vtu'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      9MOBILE VTU
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />   
               {/* share and sell  */}
              <RHFSwitch
                name='mtn_share'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      MTN SHARE AND SELL
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
        <RHFSwitch
                name='airtel_share'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      AIRTEL SHARE AND SELL
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
                     <RHFSwitch
                name='glo_share'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      GLO SHARE AND SELL
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
       <RHFSwitch
                name='mobile_share'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      9MOBILE SHARE AND SELL
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />             

               {/* airtime 2 cash  */}
               <RHFSwitch
                name='mtn_cash'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      MTN (Airtime 2 Cash)
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
        <RHFSwitch
                name='airtel_cash'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      AIRTEL (Airtime 2 Cash)
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
                     <RHFSwitch
                name='glo_cash'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      GLO (Airtime 2 Cash)
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
       <RHFSwitch
                name='mobile_cash'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      9MOBILE (Airtime 2 Cash)
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
