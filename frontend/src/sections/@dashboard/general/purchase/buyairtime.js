import * as Yup from 'yup';
import { useEffect, useState, } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
// swal
import swal from 'sweetalert';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { Box, Card, Grid, Stack, Alert, Typography } from '@mui/material';
import axios from '../../../../utils/axios';
import { FormProvider, RHFSelect, RHFTextField, RHFSwitch } from '../../../../components/hook-form';
// format number 
import { fCurrency, } from '../../../../utils/formatNumber';
import useAuth from '../../../../hooks/useAuth';

import Iconify from '../../../../components/Iconify';
import { PATH_DASHBOARD } from '../../../../routes/paths';
// ----------------------------------------------------------------------

export default function PurchaseAirtime() {

  const NewUserSchema = Yup.object().shape({
    phone: Yup.string().required('Phone Number Required'),
    type: Yup.string().required('Network Type Required')
  });
  const pinSchema = Yup.object().shape({
    phone: Yup.string().required('Phone Number Required'),
    pin: Yup.string().min(4, 'Transaction Pin Must Be 4 Digits').max(4, 'Transaction Pin Must Be 4 Digit').required('Transaction Pin Required'),
    type: Yup.string().required('Network Type Required')
  });
  const { enqueueSnackbar } = useSnackbar();
  const [NumberValidator, SetValidate] = useState('');
  const navigate = useNavigate();
  const [adexnetwork, setNetwork] = useState();
  const [verifynetwork, SetVerifyNetwork] = useState();
  const [network, realNetwork] = useState();
  const [amount, SetAmount] = useState();
  const [pricesns, SetPriceSns] = useState();
  const [pricevtu, SetPriceVtu] = useState();
  const AccessToken = window.localStorage.getItem('accessToken');
  const { setting } = useAuth();
  const pin = setting?.setting?.allow_pin === 1;
  const methods = useForm({
    resolver: yupResolver(pin ? pinSchema : NewUserSchema),
  });
  const [discount, SetDiscount] = useState();
  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;
  const values = watch();
  const planType = [
    { value: 'VTU', code: 'vtu' },
    { value: 'Share and Sell', code: 'sns' }
  ]
  // get network over here
  useEffect(() => {
    axios.get('/api/website/app/network')
      .then(data => {
        if (data.data?.status === 'success' && data.data?.network) {
          setNetwork(data.data.network);
        } else {
          console.error('Network fetch failed:', data.data);
          enqueueSnackbar('Failed to load networks', { variant: 'error' });
        }
      })
      .catch(error => {
        console.error('Error fetching networks:', error);
        enqueueSnackbar('Failed to load networks. Please refresh the page.', { variant: 'error' });
      });
  }, [enqueueSnackbar]);

  const changeme = async (me) => {
    if (me) {
      realNetwork(me)
      await axios.get(`/api/verify/network/${me}/adex/system?token=${AccessToken}`).then(data => {
        SetVerifyNetwork(data.data.network);
        SetPriceSns(data.data.price_sns)
        SetPriceVtu(data.data.price_vtu)
      }).catch(SetVerifyNetwork(undefined));
    } else {
      SetVerifyNetwork(undefined);
    }
  }
  const onSubmit = async (data) => {
    if (network === '1') {
      theNetwork = 'MTN';
    } else if (network === '2') {
      theNetwork = 'AIRTEL';
    } else if (network === '3') {
      theNetwork = 'GLO';
    } else if (network === '4') {
      theNetwork = '9MOBILE';
    } else {
      theNetwork = network;
    }

    try {
      const isConfirmed = await swal({
        title: 'Confirmation',
        text: `You are on the verge of gifting N${amount} of airtime to the ${theNetwork} number ${data?.phone}.`,
        icon: 'warning',
        buttons: ['Cancel', 'Confirm'],
      });

      if (isConfirmed) {
        const resp = await axios.post('/api/topup', {
          network,
          phone: data.phone,
          amount,
          plan_type: data.type,
          bypass: data?.bypass || false,
          pin: data.pin,
          token: AccessToken,
        })
        if (resp?.data?.status === 'success') {
          swal({
            title: 'success', text: `${resp?.data?.message}`, icon: 'success', buttons: [
              'Okay',
              'Invoice'
            ],
            dangerMode: true,
          }).then((isConfirm) => {
            if (isConfirm) {
              navigate(`${PATH_DASHBOARD.general.invioce}/${resp?.data?.transid}/airtime`, { replace: true });
            }
            window.location.reload();
          });
        } else if (resp?.data?.status === 'fail') {
          swal('Opps', `${resp?.data?.message}`, 'error');
        } else {
          swal('Info', `${resp?.data?.message}`, 'info');
        }
      }
    } catch (error) {
      if (error?.data?.message !== undefined) {
        swal('Opps', `${error?.data?.message}`, 'error');
      } else if (error?.message !== undefined) {
        swal('Opps', `${error?.message}`, 'error');
      } else {
        swal('Opps', 'Something went wrong', 'error');
      }
    }
  };

  let theNetwork;
  let verNetwork;
  let ic;
  const checkphone = (phone) => {
    const phoneNumber = phone.target.value;
    setValue('phone', phoneNumber);
    if (network !== null && network !== undefined && network !== '') {

      if (network === '1') {
        theNetwork = 'MTN';
      } else if (network === '2') {
        theNetwork = 'AIRTEL';
      } else if (network === '3') {
        theNetwork = 'GLO';
      } else if (network === '4') {
        theNetwork = '9MOBILE';
      } else {
        theNetwork = network;
      }
      if (phoneNumber === "" || phoneNumber.length < 6) {
        SetValidate('')
      } else {
        SetValidate('')
        if (/0702|0704|0803|0806|0703|0706|0813|0816|0810|0814|0903|0906|0913/.test(phoneNumber)) {
          verNetwork = "MTN";
        } else if (/0805|0807|0705|0815|0811|0905/.test(phoneNumber)) {
          verNetwork = "GLO";
        } else if (/0702|0704|0803|0806|0703|0706|0813|0816|0810|0814|0903|0906|0913/.test(phoneNumber)) {
          verNetwork = "GIFTING";
        }
        else if (/0802|0808|0708|0812|0701|0901|0902|0907|0912/.test(phoneNumber)) {
          verNetwork = "AIRTEL";
        }
        else if (/0809|0818|0817|0908|0909/.test(phoneNumber)) {
          verNetwork = "9MOBILE";
        }
        else if (/0804/.test(phoneNumber)) {
          verNetwork = "NTEL";
        }
        else {
          verNetwork = "Unable to identify network !";
        }
        if (verNetwork === theNetwork) {
          ic = <Iconify icon="icon-park:success" sx={{ width: 20, height: 20, color: 'success.main' }} />
        }
        else {
          ic = <Iconify icon="akar-icons:circle-alert" sx={{ width: 20, height: 20, color: 'error.main' }} />
        }

        SetValidate(<>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}> Network is: <b>{verNetwork} </b>{ic}<br /><i><b> NB: </b> Ignore this warning for <b>Ported Numbers</b></i></ Typography> </>);
      }


    } else {
      enqueueSnackbar('Network is Required', { variant: 'error' })
    }
  }
  const Calculate = async (data) => {
    const adexd = data.target.value
    SetAmount(adexd);
    if (adexd) {
      if (values.type === 'vtu') {
        if (pricevtu) {
          SetDiscount(`₦${fCurrency((adexd / 100) * pricevtu)}`)
        } else {
          SetDiscount(undefined)
        }
      } else if (values.type === 'sns') {
        if (pricesns) {
          SetDiscount(`₦${fCurrency((adexd / 100) * pricesns)}`)
        } else {
          SetDiscount(undefined);
        }
      }
    } else {
      SetDiscount(undefined);

    }
  }


  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}
          <Card sx={{ p: 3 }}>
            <Box
              sx={{
                display: 'grid',
                columnGap: 1,
                rowGap: 3,
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(1, 1fr)' },
              }}
            >
              <RHFSelect name="network" label="Network" placeholder="Network" onChange={(e) => changeme(e.target.value)} value={network}>
                <option value="" />
                {adexnetwork?.map((option) => (
                  <option key={option?.code} value={option?.plan_id} disabled={option?.network_vtu === 0 && option?.network_share === 0}>
                    {option?.network}
                  </option>
                ))}
              </RHFSelect>

              <RHFSelect name="type" label="Network Type">
                <option value="" />
                {verifynetwork !== undefined && planType?.map((option) => (
                  <option key={option?.code} value={option?.code} disabled={option?.code === 'vtu' && verifynetwork?.network_vtu === 0 || option?.code === 'sns' && verifynetwork?.network_share === 0}>
                    {option?.value}
                  </option>
                ))}
              </RHFSelect>
              <RHFTextField name="phone" label="Phone Number" type="number" inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} onChange={checkphone} />
              <>{NumberValidator}</>
              <RHFTextField name="amount" label="Amount" type="number" value={amount} inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} onChange={Calculate} />
              {pin && <RHFTextField name="pin" label="Transaction Pin" type="password" autoComplete="new-password" inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} />}

              {discount !== undefined && <RHFTextField name="discount" label="Discount" value={discount} disabled />}
              <RHFSwitch
                name='bypass'
                labelPlacement="start"
                def={false}
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      Bypass Phone Number
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />
            </Box>
            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
                Purchase
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
