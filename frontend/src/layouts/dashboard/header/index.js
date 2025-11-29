import PropTypes from 'prop-types';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Stack, AppBar, Toolbar, Typography, Badge } from '@mui/material';
// hooks
import useOffSetTop from '../../../hooks/useOffSetTop';
import useResponsive from '../../../hooks/useResponsive';
import useAuth from '../../../hooks/useAuth';
// utils
import cssStyles from '../../../utils/cssStyles';
// config
import { HEADER, NAVBAR } from '../../../config';
// components
import Iconify from '../../../components/Iconify';
import { IconButtonAnimate } from '../../../components/animate';
import AccountPopover from './AccountPopover';

// ----------------------------------------------------------------------

const RootStyle = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'isCollapse' && prop !== 'isOffset' && prop !== 'verticalLayout',
})(({ isCollapse, isOffset, verticalLayout, theme }) => ({
  ...cssStyles(theme).bgBlur(),
  boxShadow: 'none',
  height: HEADER.MOBILE_HEIGHT,
  zIndex: theme.zIndex.appBar + 1,
  transition: theme.transitions.create(['width', 'height'], {
    duration: theme.transitions.duration.shorter,
  }),
  [theme.breakpoints.up('lg')]: {
    height: HEADER.DASHBOARD_DESKTOP_HEIGHT,
    width: `calc(100% - ${NAVBAR.DASHBOARD_WIDTH + 1}px)`,
    ...(verticalLayout && {
      width: '100%',
    }),
    ...(isCollapse && {
      width: `calc(100% - ${NAVBAR.DASHBOARD_COLLAPSE_WIDTH}px)`,
    }),
    ...(isOffset && {
      height: HEADER.DASHBOARD_DESKTOP_OFFSET_HEIGHT,
    }),
  },
}));

// ----------------------------------------------------------------------

DashboardHeader.propTypes = {
  onOpenSidebar: PropTypes.func,
  isCollapse: PropTypes.bool,
  verticalLayout: PropTypes.bool,
};

export default function DashboardHeader({ onOpenSidebar, isCollapse = false, verticalLayout = false }) {
  const isOffset = useOffSetTop(HEADER.DASHBOARD_DESKTOP_HEIGHT);
  const isDesktop = useResponsive('up', 'lg');
  const { user } = useAuth();

  return (
    <RootStyle isCollapse={isCollapse} isOffset={isOffset} verticalLayout={verticalLayout}>
      <Toolbar
        sx={{
          minHeight: '100% !important',
          px: { xs: 1, sm: 2, lg: 5 },
          gap: { xs: 0.5, sm: 1 },
          overflow: 'visible'
        }}
      >
        {/* Left Section: Menu + Greeting */}
        {!isDesktop && (
          <IconButtonAnimate onClick={onOpenSidebar} sx={{ mr: 1, color: 'text.primary', flexShrink: 0 }}>
            <Iconify icon="eva:menu-2-fill" />
          </IconButtonAnimate>
        )}

        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          sx={{
            flexShrink: 0,
            minWidth: 'fit-content',
            maxWidth: { xs: 'calc(100vw - 120px)', sm: 'none' }
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: 'text.primary',
              fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
              display: 'block',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            Hi {user?.username || 'User'}
          </Typography>
          {user?.kyc === 1 && (
            <Iconify
              icon="eva:checkmark-circle-2-fill"
              sx={{
                color: 'success.main',
                width: { xs: 18, md: 20 },
                height: { xs: 18, md: 20 },
                display: { xs: 'none', md: 'block' },
                flexShrink: 0
              }}
            />
          )}
        </Stack>

        <Box sx={{ flexGrow: 1 }} />

        {/* Right Section: Icons */}
        <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1.5 }}>
          {/* Search Icon Removed as requested */}

          <IconButtonAnimate>
            <Badge badgeContent={4} color="error">
              <Iconify icon="eva:bell-fill" width={20} height={20} />
            </Badge>
          </IconButtonAnimate>

          <AccountPopover />
        </Stack>
      </Toolbar>
    </RootStyle>
  );
}
