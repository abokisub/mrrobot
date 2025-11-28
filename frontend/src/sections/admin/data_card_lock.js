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
TheDataCardLock.propTypes = {
    discount: PropTypes.object,
  };
export default function TheDataCardLock({ discount}) {
    const isMountedRef = useIsMountedRef();
  const NewUserSchema = Yup.object().shape({ });
  const [mtn, setMtn] = useState('');
  const [glo, setGlo] = useState('');
  const [mobile, setMobile] = useState('');
  const [airtel, setAirtel] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  const AccessToken =  window.localStorage.getItem('accessToken');
  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
  });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const defaultValues = useMemo(
    () => ({
      mtn: mtn?.data_card,
      glo: glo?.data_card,
      airtel: airtel?.data_card,
      mobile: mobile?.data_card,
    })
  );
  const {
    reset,
    setError,
    handleSubmit,
    formState: {errors, isSubmitting },
  } = methods;

  useEffect(() => {
    if (discount!== undefined) {
      setMtn(discount[0]);
      setGlo(discount[1]);
      setAirtel(discount[2]);
      setMobile(discount[3]);
      reset(defaultValues);
    }
   
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discount,glo]); 
  const onSubmit = async (data) => {
    try {
      await axios.post(`/api/data_card_lock/${AccessToken}/secure`,data)
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
                name='mtn'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      MTN
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
        <RHFSwitch
                name='airtel'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      AIRTEL
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
                     <RHFSwitch
                name='glo'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      GLO
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
       <RHFSwitch
                name='mobile'
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      9MOBILE 
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
