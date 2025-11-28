import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
// @mui
import { styled, useTheme } from '@mui/material/styles';
import { Box, Stack, Drawer } from '@mui/material';
// hooks
import useResponsive from '../../../hooks/useResponsive';
import useCollapseDrawer from '../../../hooks/useCollapseDrawer';
// utils
import cssStyles from '../../../utils/cssStyles';
// config
import { NAVBAR } from '../../../config';
// components
import Logo from '../../../components/Logo';
import Scrollbar from '../../../components/Scrollbar';
import { NavSectionVertical } from '../../../components/nav-section';

// routes
import { PATH_DASHBOARD, PATH_PAGE, PATH_AUTH, PATH_ADMIN } from '../../../routes/paths';
// components
// import Label from '../../../components/Label';
import SvgIconStyle from '../../../components/SvgIconStyle';
//
import NavbarDocs from './NavbarDocs';
import NavbarAccount from './NavbarAccount';
import CollapseButton from './CollapseButton';
import useAuth from '../../../hooks/useAuth';


// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('lg')]: {
    flexShrink: 0,
    transition: theme.transitions.create('width', {
      duration: theme.transitions.duration.shorter,
    }),
  },
}));

// ----------------------------------------------------------------------

NavbarVertical.propTypes = {
  isOpenSidebar: PropTypes.bool,
  onCloseSidebar: PropTypes.func,
};

export default function NavbarVertical({ isOpenSidebar, onCloseSidebar }) {
  const theme = useTheme();
  const { user } = useAuth();
  const { pathname } = useLocation();

  const isDesktop = useResponsive('up', 'lg');

  const { isCollapse, collapseClick, collapseHover, onToggleCollapse, onHoverEnter, onHoverLeave } =
    useCollapseDrawer();
  const getIcon = (name) => <SvgIconStyle src={`/icons/${name}.svg`} sx={{ width: 1, height: 1 }} />;
  const ICONS = {
    user: getIcon('ic_user'),
    transaction: getIcon('transaction'),
    buy_cable: getIcon('adex_cable'),
    calendar: getIcon('ic_calendar'),
    buy_data: getIcon('adex_data'),
    buy_airtime: getIcon('adex_phone'),
    dashboard: getIcon('adex_home'),
    fund: getIcon('fund'),
    phone: getIcon('phone'),
    stock: getIcon('stock'),
    setting: getIcon('setting'),
    wallet: getIcon('wallet'),
    cal: getIcon('cal'),
    price: getIcon('price'),
    game: getIcon('wallet'), // Betting - using wallet icon as placeholder
    flash: getIcon('wallet'), // Electricity - using wallet icon as placeholder
    logout: getIcon('setting'), // Logout icon
  };


  // nav bar  
  // nav bar
  const navConfig = [
    {
      subheader: 'Main',
      items: [
        { title: 'Dashboard', path: PATH_DASHBOARD.general.app, icon: ICONS.dashboard },
        ...(user?.type === 'ADMIN' ? [{ title: 'Admin Account', path: PATH_ADMIN.general.app, icon: ICONS.setting }] : []), // Admin Account button
        { title: 'Transactions', path: PATH_DASHBOARD.trans.root, icon: ICONS.transaction },
      ],
    },
    {
      subheader: 'Finance',
      items: [
        {
          title: 'Payment',
          path: PATH_DASHBOARD.fund.root,
          icon: ICONS.fund,
          children: [
            { title: 'Send Money', path: PATH_PAGE.comingSoon },
            { title: 'Pay Bills', path: PATH_DASHBOARD.general.buybill },
            { title: 'Transport QR Pay', path: PATH_PAGE.comingSoon },
            { title: 'Utility Installments', path: PATH_PAGE.comingSoon },
          ],
        },
        {
          title: 'Savings',
          path: PATH_PAGE.comingSoon,
          icon: ICONS.wallet,
          children: [
            { title: 'Micro-Savings', path: PATH_PAGE.comingSoon },
            { title: 'Goal Pots', path: PATH_PAGE.comingSoon },
            { title: 'Group Savings', path: PATH_PAGE.comingSoon },
          ],
        },
        {
          title: 'Wallet',
          path: PATH_PAGE.comingSoon,
          icon: ICONS.price,
          children: [
            { title: 'Wallet Overview', path: PATH_PAGE.comingSoon },
            { title: 'Fund Wallet', path: PATH_PAGE.comingSoon },
            { title: 'Withdraw', path: PATH_PAGE.comingSoon },
            { title: 'Transaction History', path: PATH_DASHBOARD.trans.root },
            { title: 'Multi-currency', path: PATH_PAGE.comingSoon },
          ],
        },
      ],
    },
    {
      subheader: 'Business & Tools',
      items: [
        {
          title: 'Merchant Tools',
          path: PATH_PAGE.comingSoon,
          icon: ICONS.stock,
          children: [
            { title: 'Mini POS', path: PATH_PAGE.comingSoon },
            { title: 'QR Code Payments', path: PATH_PAGE.comingSoon },
            { title: 'Sales Ledger', path: PATH_PAGE.comingSoon },
            { title: 'Transfer Verification', path: PATH_PAGE.comingSoon },
            { title: 'Inventory System', path: PATH_PAGE.comingSoon },
          ],
        },
        {
          title: 'Offline Tools',
          path: PATH_PAGE.comingSoon,
          icon: ICONS.phone,
          children: [
            { title: 'USSD Payments', path: PATH_PAGE.comingSoon },
            { title: 'SMS Commands', path: PATH_PAGE.comingSoon },
            { title: 'Smart Card', path: PATH_PAGE.comingSoon },
            { title: 'Smart Box', path: PATH_PAGE.comingSoon },
          ],
        },
        {
          title: 'Business Suite',
          path: PATH_PAGE.comingSoon,
          icon: ICONS.buy_cable,
          children: [
            { title: 'Payment Links', path: PATH_PAGE.comingSoon },
            { title: 'API Keys', path: PATH_PAGE.comingSoon },
            { title: 'Payouts', path: PATH_PAGE.comingSoon },
            { title: 'Integrations', path: PATH_PAGE.comingSoon },
          ],
        },
        {
          title: 'Agents & Hubs',
          path: PATH_PAGE.comingSoon,
          icon: ICONS.user,
          children: [
            { title: 'Become an Agent', path: PATH_PAGE.comingSoon },
            { title: 'Agent Tools', path: PATH_PAGE.comingSoon },
            { title: 'Rural Hub Features', path: PATH_PAGE.comingSoon },
          ],
        },
      ],
    },
    {
      subheader: 'System',
      items: [
        {
          title: 'Settings',
          path: PATH_DASHBOARD.user.account,
          icon: ICONS.setting,
          children: [
            { title: 'Profile Settings', path: PATH_DASHBOARD.user.account },
            { title: 'Security & PIN', path: PATH_PAGE.comingSoon },
            { title: 'Notifications', path: PATH_PAGE.comingSoon },
            { title: 'Support', path: PATH_PAGE.comingSoon },
          ],
        },
        { title: 'Logout', path: PATH_AUTH.login, icon: ICONS.logout, isLogout: true },
      ],
    },
  ];

  const customerTrans = []; // Cleared as we are using the main navConfig for the new design

  useEffect(() => {
    if (isOpenSidebar) {
      onCloseSidebar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
      }}
    >
      <Stack
        spacing={3}
        sx={{
          pt: 3,
          pb: 2,
          px: 2.5,
          flexShrink: 0,
          ...(isCollapse && { alignItems: 'center' }),
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Logo />

          {isDesktop && !isCollapse && (
            <CollapseButton onToggleCollapse={onToggleCollapse} collapseClick={collapseClick} />
          )}
        </Stack>

        <NavbarAccount isCollapse={isCollapse} />
      </Stack>
      <NavSectionVertical navConfig={navConfig} isCollapse={isCollapse} />
      {user?.type === 'CUSTOMER' && <NavSectionVertical navConfig={customerTrans} isCollapse={isCollapse} />}
      {user?.type === 'ADMIN' && <NavSectionVertical navConfig={customerTrans} isCollapse={isCollapse} />}
      <Box sx={{ flexGrow: 1 }} />
      {!isCollapse && <NavbarDocs />}
    </Scrollbar>
  );

  return (
    <RootStyle
      sx={{
        width: {
          lg: isCollapse ? NAVBAR.DASHBOARD_COLLAPSE_WIDTH : NAVBAR.DASHBOARD_WIDTH,
        },
        ...(collapseClick && {
          position: 'absolute',
        }),
      }}
    >
      {!isDesktop && (
        <Drawer open={isOpenSidebar} onClose={onCloseSidebar} PaperProps={{ sx: { width: NAVBAR.DASHBOARD_WIDTH, bgcolor: '#F3E5F5' } }}> {/* Light purple background */}
          {renderContent}
        </Drawer>
      )}

      {isDesktop && (
        <Drawer
          open
          variant="persistent"
          onMouseEnter={onHoverEnter}
          onMouseLeave={onHoverLeave}
          PaperProps={{
            sx: {
              width: NAVBAR.DASHBOARD_WIDTH,
              borderRightStyle: 'dashed',
              bgcolor: '#F3E5F5', // Light purple background
              transition: (theme) =>
                theme.transitions.create('width', {
                  duration: theme.transitions.duration.standard,
                }),
              ...(isCollapse && {
                width: NAVBAR.DASHBOARD_COLLAPSE_WIDTH,
              }),
              ...(collapseHover && {
                ...cssStyles(theme).bgBlur(),
                boxShadow: (theme) => theme.customShadows.z24,
              }),
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </RootStyle>
  );
}
