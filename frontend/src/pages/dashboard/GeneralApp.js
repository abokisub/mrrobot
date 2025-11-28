// @mui
import { Container, Grid, Stack, } from '@mui/material';
import swal from 'sweetalert'
import { useState, useEffect } from 'react';

// hooks
import useAuth from '../../hooks/useAuth';
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import { PATH_DASHBOARD } from '../../routes/paths';
import axios from '../../utils/axios';
// sections
import {
  AppFeatured,
  Databalance,
  Appbalance,
  Userverified,
  Appcakages,
  Referral,
  Upgrade
} from '../../sections/@dashboard/general/app';
// icons
import DataWifi from '../../assets/data_wifi';
import AirtimeIcon from '../../assets/airtime';
import AirtimeCashIcon from '../../assets/airtime2cash';
import ElectricIcon from '../../assets/electricity';
import SmartIcon from '../../assets/smart-tv';
import TransferIcon from '../../assets/money-card';
import BulkSmsIcon from '../../assets/news';
import ResultCheck from '../../assets/resultcheck';
import DataCard from '../../assets/data_card';
import RechargeCard from '../../assets/recharge_card';
import useResponsive from '../../hooks/useResponsive';

// ----------------------------------------------------------------------

export default function GeneralApp() {
  const { user, setting } = useAuth();
  const { themeStretch } = useSettings();
  const [datapurchase, Setdatapurchase] = useState();
  const isDesktop = useResponsive('up', 'lg');
  if (setting?.setting.notif_show === 1) {

    swal(setting?.setting?.notif_message);
  }
  const AccessToken = window.localStorage.getItem('accessToken');
  useEffect(() => {
    axios.get(`/api/total/data/purchase/${AccessToken}/secure`).then((data) => Setdatapurchase(data.data?.data_purchased))
  });
  return (
    <Page title="Dashboard">

      <Container 
        maxWidth={themeStretch ? false : 'xl'}
        sx={{
          px: { xs: 2, sm: 3 }, // Equal padding on left and right for mobile
        }}
      >
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>

          <Grid item xs={isDesktop ? 18 : 12} md={isDesktop ? 8 : 4}>
            <Userverified displayName={user?.username} bool={user?.type === 'ADMIN'} isVerified={user?.is_bvn} />
          </Grid>

          {setting?.setting.is_feature === 1 && <Grid item xs={12} md={4}>
            <AppFeatured />
          </Grid>}


          <Upgrade />


          <Grid item xs={12} md={4}>
            <Appbalance
              title="Wallet Balance"
              total={user.bal}
            />
          </Grid>
          {setting?.setting?.referral === 1 && <Grid item xs={12} md={4}>
            <Appbalance
              title="Earning Balance"
              total={user.refbal}
            />
          </Grid>}

          <Grid item xs={12} md={4}>
            {datapurchase !== undefined ?
              <Databalance
                title="Data Purchased Today"
                total={datapurchase}
              /> : 'Calculating Data Purchased Today'}
          </Grid>

          <Grid item xs={6} md={6} lg={3} sx={{ display: 'flex' }}>
            <Appcakages
              image={<DataWifi />}
              displayname="Buy Data"
              link={PATH_DASHBOARD.general.buydata}
            />
          </Grid>
          <Grid item xs={6} md={6} lg={3} sx={{ display: 'flex' }}>
            <Appcakages
              image={<AirtimeIcon />}
              displayname="Buy Airtime"
              link={PATH_DASHBOARD.general.buyairtime}
            />
          </Grid>
          <Grid item xs={6} md={6} lg={3} sx={{ display: 'flex' }}>
            <Appcakages
              image={<AirtimeCashIcon />}
              displayname="Airtime 2 Cash"
              link={PATH_DASHBOARD.general.cash}
            />
          </Grid>
          <Grid item xs={6} md={6} lg={3} sx={{ display: 'flex' }}>
            <Appcakages
              image={<ElectricIcon />}
              displayname="Electricity Bill"
              link={PATH_DASHBOARD.general.buybill}
            />
          </Grid>
          <Grid item xs={6} md={6} lg={3} sx={{ display: 'flex' }}>
            <Appcakages
              image={<SmartIcon />}
              displayname="Cable Subscription"
              link={PATH_DASHBOARD.general.buycable}
            />
          </Grid>
          <Grid item xs={6} md={6} lg={3} sx={{ display: 'flex' }}>
            <Appcakages
              image={<TransferIcon />}
              displayname="Bonus Transfer"
              link={PATH_DASHBOARD.general.earning}
            />
          </Grid>
          <Grid item xs={6} md={6} lg={3} sx={{ display: 'flex' }}>
            <Appcakages
              image={<BulkSmsIcon />}
              displayname="Bulk SMS"
              link={PATH_DASHBOARD.general.bulksms}
            />
          </Grid>
          <Grid item xs={6} md={6} lg={3} sx={{ display: 'flex' }}>
            <Appcakages
              image={<ResultCheck />}
              displayname="Result Checker"
              link={PATH_DASHBOARD.general.exam}
            />
          </Grid>
          {setting?.setting?.data_card === 1 && <Grid item xs={6} md={6} lg={3} sx={{ display: 'flex' }}>
            <Appcakages
              image={<DataCard />}
              displayname="Data Card Printing"
              link={PATH_DASHBOARD.general.data_card}
            />
          </Grid>}
          {setting?.setting?.recharge_card === 1 && <Grid item xs={6} md={6} lg={3} sx={{ display: 'flex' }}>
            <Appcakages
              image={<RechargeCard />}
              displayname="Recharge Card Printing"
              link={PATH_DASHBOARD.general.recharge_card}
            />
          </Grid>}
          {setting?.setting.referral === 1 && <Grid item xs={18} md={6}>
            <Stack spacing={3}>
              <Referral />
            </Stack>
          </Grid>
          }

        </Grid>
      </Container>
    </Page>
  );
}
