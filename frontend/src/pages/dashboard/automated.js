import { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Lottie from 'lottie-react';
import { m } from 'framer-motion';
import { styled } from '@mui/material/styles';
import {
  Container,
  Stack,
  Card,
  Typography,
  CardHeader,
  Button,
  Box
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Link as RouterLink } from 'react-router-dom';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { PATH_DASHBOARD } from '../../routes/paths';
import useSettings from '../../hooks/useSettings';
import useAuth from '../../hooks/useAuth';
import useResponsive from '../../hooks/useResponsive';
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import Iconify from '../../components/Iconify';
import { varFade } from '../../components/animate';
import { APP_NAME } from '../../config';

import animationData from '../../utils/loader.json';
import axios from '../../utils/axios';


export default function Automated() {
  const { themeStretch } = useSettings();
  const { setting, user } = useAuth();
  const isDesktop = useResponsive('up', 'lg');
  const { enqueueSnackbar } = useSnackbar();
  const accessToken = localStorage.getItem('accessToken');
  const [loading,SetLoading] = useState(false);
  const [banks,SetBanks] = useState([]);
  
  useEffect(() => {
    fetchBanks();
  },[]);
  
  const fetchBanks = async() => {
    try{
      SetLoading(true);
      const response = await axios.get(`/api/check/banks/user/gstar/${accessToken}/secure/this/site/here`)
      if (response.data && response.data.banks) {
        SetBanks(response.data.banks);
      } else {
        // If API fails, check if user has BellBank account
        if (user?.bellbank_account?.account_number) {
          SetBanks([{
            name: user.bellbank_account.bank_name || 'BellBank',
            account: user.bellbank_account.account_number,
            accountType: false,
            charges: '0 NAIRA',
            isDefault: true,
            accountName: user.bellbank_account.account_name || user.username
          }]);
        }
      }
    }catch (error) {
      console.error('Error fetching Banks:', error);
      // Fallback: Show BellBank account if available in user object
      if (user?.bellbank_account?.account_number) {
        SetBanks([{
          name: user.bellbank_account.bank_name || 'BellBank',
          account: user.bellbank_account.account_number,
          accountType: false,
          charges: '0 NAIRA',
          isDefault: true,
          accountName: user.bellbank_account.account_name || user.username
        }]);
      }
    }
    finally{
     SetLoading(false);
    }
  }

  const Div = styled('div')(({ theme }) => ({
    ...theme.typography.button,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1),
  }));

  // Check if user has BellBank account from user object (fallback)
  const bellbankAccount = user?.bellbank_account;
  const hasBellbankAccount = bellbankAccount && bellbankAccount.account_number;

  return (
    <Page title="Automated Bank Transfer">
    {loading && banks.length === 0 ? (
       <div style={{ textAlign: 'center', marginTop: '30px' }}>
                            <Lottie animationData={animationData} style={{ maxWidth: '300px', margin: 'auto' }} />
                            <h4 style={{ fontWeight: 'bold' }}>
                              {hasBellbankAccount ? 'Loading account details...' : 'Fetching Banks....'}
                            </h4>
                            {hasBellbankAccount && (
                              <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                                Your BellBank account is being prepared...
                              </Typography>
                            )}
                        </div>
    ):
    (
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="Automated Bank Transfer"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'adex-system' },
          ]}
        />
        <Stack spacing={3}>
          {/* Show BellBank account if available but not in banks array yet */}
          {hasBellbankAccount && banks.length === 0 && !loading && (
            <Card sx={{ p: 3 }}>
              <CardHeader title="BELLBANK AUTOMATED BANK TRANSFER" />
              <Typography
                variant="overline"
                sx={{ mb: 3, display: 'block', color: 'text.secondary' }}
              >
                <Div>{"Automated Bank Transfer 👇👇👇"}</Div>
                Make a transfer to this unique Account Number given to you and your wallet will be credited immediately.
                <m.div variants={varFade().inRight}>
                  <Typography variant="body2" noWrap>
                    Account Number:
                    {!isDesktop ? <br /> : ''}
                    <b>{bellbankAccount.account_number}</b>
                    <CopyToClipboard
                      text={bellbankAccount.account_number}
                      onCopy={() => enqueueSnackbar('BellBank Account Number Copied')}
                    >
                      <Button title="copy">
                        <Iconify
                          icon="codicon:copy"
                          sx={{ width: 20, height: 20, color: 'success.main' }}
                        />
                      </Button>
                    </CopyToClipboard>
                  </Typography>
                  <Typography variant="body2" noWrap>
                    Bank Name: {bellbankAccount.bank_name || 'BellBank'}
                  </Typography>
                  <Typography variant="body2" noWrap>
                    Account Name: <b>{`${setting?.general?.app_name || APP_NAME} - ${user?.username || ''}`}</b>
                  </Typography>
                  <Typography variant="body2" noWrap>
                    Charges: 0 NAIRA
                  </Typography>
                </m.div>
              </Typography>
            </Card>
          )}
          
          {/* {user?.is_bvn ? <> */}
          {banks.length > 0 ? (
  banks.map((bank) => (
    <Card key={bank.accountType} sx={{ p: 3 }}>
      <CardHeader title={`${bank.name} AUTOMATED BANK TRANSFER`} />
      {bank.accountType ? (
        <Typography
          variant="overline"
          sx={{ mb: 3, display: 'block', color: 'text.secondary' }}
        >
          <Div>{`${user?.username}  We are processing  Your ${bank.name} Unique Account Number`}</Div>
        </Typography>
      ) : (
        <Typography
          variant="overline"
          sx={{ mb: 3, display: 'block', color: 'text.secondary' }}
        >
          <Div>{"Automated Bank Transfer 👇👇👇"}</Div>
          Make a transfer to this unique Account Number given to you and your wallet will be credited immediately.
          <m.div variants={varFade().inRight}>
            <Typography variant="body2" noWrap>
              Account Number:
              {!isDesktop ? <br /> : ''}
              <b>{bank.account}</b>
              <CopyToClipboard
                text={bank.account}
                onCopy={() => enqueueSnackbar(`${bank.name} Account Number Copied`)}
              >
                <Button title="copy">
                  <Iconify
                    icon="codicon:copy"
                    sx={{ width: 20, height: 20, color: 'success.main' }}
                  />
                </Button>
              </CopyToClipboard>
            </Typography>
            <Typography variant="body2" noWrap>
              Bank Name: {bank.name}
            </Typography>
            <Typography variant="body2" noWrap>
              Account Name: <b>{`${setting?.general?.app_name || APP_NAME} - ${user?.username || ''}`}</b>
            </Typography>
            <Typography variant="body2" noWrap>
              Charges: {bank.charges}
            </Typography>
          </m.div>
        </Typography>
      )}
    </Card>
  ))
) : (
  <Container maxWidth="sm" style={{ textAlign: 'center', marginTop: '20px' }}>
    <Typography variant="h6" color="textSecondary">
      No banks available at the moment. Please try again later.
    </Typography>
  </Container>
)}

          {/* </> 
          
          : <>
            <Card sx={{ p: 3 }}>
              <div>
                <Div>{`Dear ${user?.username}`}</Div>
                <Typography variant="body2">To generate a dedicated account number.</Typography>
                <Typography variant="body2">CBN requires BVN for Tier-1 bank accounts. Update Your KYC.</Typography>
                <br />
                <LoadingButton
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  loading={false}
                  to={PATH_DASHBOARD.fund.link_bvn}
                  component={RouterLink}
                  style={{ marginBottom: '10px' }} // Add margin to create space
                >
                  Update Your KYC
                </LoadingButton>

                <LoadingButton
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  loading={false}
                  to={PATH_DASHBOARD.fund.link_dynamic_account}
                  component={RouterLink}
                  style={{ backgroundColor: '#FF5733', color: '#fff' }} // Change button color
                >
                  Use Dynamic Account
                </LoadingButton>

                <Box display="flex" alignItems="center" marginTop="10px">
                  <LockOutlinedIcon style={{ marginRight: '5px' }} />
                  <Typography variant="body2">Secured by {APP_NAME}</Typography>
                </Box>
              </div>
            </Card>
          </>} */}
        </Stack>
      </Container>
    )}
    </Page>
  );
}
