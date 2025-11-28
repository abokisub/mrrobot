import { Container, Grid, Stack, Box } from '@mui/material';
import useAuth from '../../hooks/useAuth';
import useSettings from '../../hooks/useSettings';
import Page from '../../components/Page';
import {
  BalanceCard,
  QuickActionsGrid,
  RecentTransactions,
  SavingsCard,
  MerchantCard,
  BottomBanner
} from '../../sections/@dashboard/general/app';

export default function GeneralApp() {
  const { user } = useAuth();
  const { themeStretch } = useSettings();

  return (
    <Page title="Dashboard">
      <Container 
        maxWidth={themeStretch ? false : 'xl'}
        sx={{
          px: { xs: 2, sm: 3 }, // Equal padding on left and right for mobile
        }}
      >
        <Grid container spacing={3}>

          {/* Row 1: Top Summary Cards */}
          <Grid item xs={12} sx={{ order: { xs: 1, md: 1 } }}>
            <BalanceCard balance={Number(user?.bal) || 0} />
          </Grid>

          {/* Row 2: Transactions & Actions */}
          <Grid item xs={12} md={8} sx={{ order: { xs: 3, md: 2 }, display: { xs: 'none', md: 'block' } }}>
            <RecentTransactions />
          </Grid>

          <Grid item xs={12} md={4} sx={{ order: { xs: 2, md: 3 } }}>
            <QuickActionsGrid />
          </Grid>

          {/* Row 3: Bottom Banner */}
          <Grid item xs={12} sx={{ mb: 3, order: { xs: 4, md: 4 } }}>
            <BottomBanner />
          </Grid>

        </Grid>
      </Container>
    </Page>
  );
}
