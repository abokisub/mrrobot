/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
// @mui
import {
  Card,
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Stack,
  MenuItem,
  Alert,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// routes
import { PATH_ADMIN } from '../../../routes/paths';
// hooks
import useSettings from '../../../hooks/useSettings';
// components
import Page from '../../../components/Page';
import HeaderBreadcrumbs from '../../../components/HeaderBreadcrumbs';
// axios
import axios from '../../../utils/axios';

// ----------------------------------------------------------------------

export default function BellBankNameEnquiry() {
  const { themeStretch } = useSettings();
  const [accountNumber, setAccountNumber] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [bankList, setBankList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const AccessToken = window.localStorage.getItem('accessToken');

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      const data = await axios.get('/api/bellbank/banks', {
        headers: { Authorization: `Bearer ${AccessToken}` }
      });

      if (data.data?.status === 'success') {
        setBankList(data.data?.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch banks:', error);
    }
  };

  const handleEnquiry = async () => {
    if (!accountNumber || !bankCode) {
      enqueueSnackbar('Please fill in all fields', { variant: 'error' });
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const data = await axios.post(
        '/api/bellbank/name-enquiry',
        {
          account_number: accountNumber,
          bank_code: bankCode,
        },
        {
          headers: { Authorization: `Bearer ${AccessToken}` }
        }
      );

      if (data.data?.status === 'success') {
        setResult(data.data?.data);
        enqueueSnackbar('Name enquiry successful', { variant: 'success' });
      } else {
        enqueueSnackbar(data.data?.message || 'Name enquiry failed', { variant: 'error' });
      }
    } catch (error) {
      if (error.response?.data?.message) {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      } else {
        enqueueSnackbar('Name enquiry failed', { variant: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title="BellBank: Name Enquiry">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="BellBank Name Enquiry"
          links={[
            { name: 'Dashboard', href: PATH_ADMIN.root },
            { name: 'BellBank', href: PATH_ADMIN.bellbank.root },
            { name: 'Name Enquiry' },
          ]}
        />

        <Card sx={{ p: 3 }}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Account Number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Enter account number"
            />

            <TextField
              fullWidth
              select
              label="Bank"
              value={bankCode}
              onChange={(e) => setBankCode(e.target.value)}
              placeholder="Select bank"
            >
              {bankList.map((bank) => (
                <MenuItem key={bank.code} value={bank.code}>
                  {bank.name}
                </MenuItem>
              ))}
            </TextField>

            <LoadingButton
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              loading={loading}
              onClick={handleEnquiry}
            >
              Verify Account Name
            </LoadingButton>

            {result && (
              <Alert severity="success">
                <Typography variant="subtitle2">Account Name: {result.accountName || 'N/A'}</Typography>
                {result.accountNumber && (
                  <Typography variant="body2">Account Number: {result.accountNumber}</Typography>
                )}
                {result.bankCode && (
                  <Typography variant="body2">Bank Code: {result.bankCode}</Typography>
                )}
              </Alert>
            )}
          </Stack>
        </Card>
      </Container>
    </Page>
  );
}

