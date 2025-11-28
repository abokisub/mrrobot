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
AdexDataLock.propTypes = {
    discount: PropTypes.object,
  };
export default function AdexDataLock({ discount}) {
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
        mtn_sme: mtn?.network_sme === 1 || mtn?.network_sme === true,
        glo_sme: glo?.network_sme === 1 || glo?.network_sme === true,
        airtel_sme: airtel?.network_sme === 1 || airtel?.network_sme === true,
        mobile_sme: mobile?.network_sme === 1 || mobile?.network_sme === true,
        mtn_cg: mtn?.network_cg === 1 || mtn?.network_cg === true,
        glo_cg: glo?.network_cg === 1 || glo?.network_cg === true,
        airtel_cg: airtel?.network_cg === 1 || airtel?.network_cg === true,
        mobile_cg: mobile?.network_cg === 1 || mobile?.network_cg === true,
        mtn_g: mtn?.network_g === 1 || mtn?.network_g === true,
        glo_g: glo?.network_g === 1 || glo?.network_g === true,
        airtel_g: airtel?.network_g === 1 || airtel?.network_g === true,
        mobile_g: mobile?.network_g === 1 || mobile?.network_g === true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discount]); 
  const onSubmit = async (data) => {
    try {
      await axios.post(`/api/edit/data/lock/account/${AccessToken}/adex/secure`,data)
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
                name='mtn_sme'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      MTN SME
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
        <RHFSwitch
                name='airtel_sme'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      AIRTEL SME
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
                     <RHFSwitch
                name='glo_sme'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      GLO SME
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
       <RHFSwitch
                name='mobile_sme'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      9MOBILE SME
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />   
               {/* cg  */}

               <RHFSwitch
                name='mtn_cg'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      MTN CG
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
        <RHFSwitch
                name='airtel_cg'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      AIRTEL CG
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
                     <RHFSwitch
                name='glo_cg'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      GLO CG
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
       <RHFSwitch
                name='mobile_cg'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      9MOBILE CG
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />  
                         {/* gifting */}

                         <RHFSwitch
                name='mtn_g'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      MTN GIFTING
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
        <RHFSwitch
                name='airtel_g'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      AIRTEL GIFTING
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
                     <RHFSwitch
                name='glo_g'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      GLO GIFTING
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
       <RHFSwitch
                name='mobile_g'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      9MOBILE GIFTING
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
