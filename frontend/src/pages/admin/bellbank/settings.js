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
  Stack,
  Box,
  Divider,
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

export default function BellBankSettings() {
  const { themeStretch } = useSettings();
  const [settings, setSettings] = useState({
    base_url: '',
    consumer_key: '',
    consumer_secret: '',
    webhook_secret: '',
    timeout: '30',
    retry_attempts: '3',
    retry_delay: '1',
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const AccessToken = window.localStorage.getItem('accessToken');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setFetchLoading(true);
    try {
      const data = await axios.get('/api/admin/bellbank/settings', {
        headers: { Authorization: `Bearer ${AccessToken}` }
      });

      if (data.data?.status === 'success') {
        setSettings(data.data?.data || settings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const data = await axios.post(
        '/api/admin/bellbank/settings',
        settings,
        {
          headers: { Authorization: `Bearer ${AccessToken}` }
        }
      );

      if (data.data?.status === 'success') {
        enqueueSnackbar('Settings saved successfully', { variant: 'success' });
      } else {
        enqueueSnackbar(data.data?.message || 'Failed to save settings', { variant: 'error' });
      }
    } catch (error) {
      if (error.response?.data?.message) {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      } else {
        enqueueSnackbar('Failed to save settings', { variant: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setSettings({ ...settings, [field]: e.target.value });
  };

  if (fetchLoading) {
    return (
      <Page title="BellBank: Settings">
        <Container maxWidth={themeStretch ? false : 'lg'}>
          <HeaderBreadcrumbs
            heading="BellBank Settings"
            links={[
              { name: 'Dashboard', href: PATH_ADMIN.root },
              { name: 'BellBank', href: PATH_ADMIN.bellbank.root },
              { name: 'Settings' },
            ]}
          />
          <Card sx={{ p: 3 }}>
            <Typography variant="body2">Loading ...</Typography>
          </Card>
        </Container>
      </Page>
    );
  }

  return (
    <Page title="BellBank: Settings">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="BellBank Settings"
          links={[
            { name: 'Dashboard', href: PATH_ADMIN.root },
            { name: 'BellBank', href: PATH_ADMIN.bellbank.root },
            { name: 'Settings' },
          ]}
        />

        <Card sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                API Configuration
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <TextField
                fullWidth
                label="Base URL"
                value={settings.base_url}
                onChange={handleChange('base_url')}
                placeholder="https://sandbox-baas-api.bellmfb.com"
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Consumer Key"
                value={settings.consumer_key}
                onChange={handleChange('consumer_key')}
                type="password"
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Consumer Secret"
                value={settings.consumer_secret}
                onChange={handleChange('consumer_secret')}
                type="password"
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Webhook Secret"
                value={settings.webhook_secret}
                onChange={handleChange('webhook_secret')}
                type="password"
                sx={{ mb: 2 }}
              />
            </Box>

            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Advanced Settings
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <TextField
                fullWidth
                label="Timeout (seconds)"
                type="number"
                value={settings.timeout}
                onChange={handleChange('timeout')}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Retry Attempts"
                type="number"
                value={settings.retry_attempts}
                onChange={handleChange('retry_attempts')}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Retry Delay (seconds)"
                type="number"
                value={settings.retry_delay}
                onChange={handleChange('retry_delay')}
                sx={{ mb: 2 }}
              />
            </Box>

            <LoadingButton
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              loading={loading}
              onClick={handleSave}
            >
              Save Settings
            </LoadingButton>
          </Stack>
        </Card>
      </Container>
    </Page>
  );
}

