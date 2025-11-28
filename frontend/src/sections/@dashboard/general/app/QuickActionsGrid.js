import { useNavigate } from 'react-router-dom';
// @mui
import { styled, useTheme } from '@mui/material/styles';
import { Card, Typography, Grid, Box, ButtonBase, Stack, Paper, Chip } from '@mui/material';
// routes
import { PATH_DASHBOARD, PATH_PAGE } from '../../../../routes/paths';
// components
import Iconify from '../../../../components/Iconify';

// ----------------------------------------------------------------------

const MainActionCard = styled(ButtonBase)(({ theme }) => ({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.common.white,
    borderRadius: theme.spacing(2),
    border: `1px solid ${theme.palette.grey[300]}`,
    boxShadow: 'none',
    transition: theme.transitions.create('all'),
    '&:hover': {
        backgroundColor: theme.palette.grey[50],
        borderColor: theme.palette.grey[400],
    },
}));

const MainIconWrapper = styled(Box)(({ theme }) => ({
    width: 48,
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.spacing(1.5),
    marginBottom: theme.spacing(1),
    backgroundColor: 'rgba(0, 183, 117, 0.1)',
    color: theme.palette.primary.main,
}));

const ServiceIconWrapper = styled(Box)(({ theme }) => ({
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.spacing(1.5),
    marginBottom: theme.spacing(0.75),
    backgroundColor: 'rgba(0, 183, 117, 0.1)',
    color: theme.palette.primary.main,
    position: 'relative',
    overflow: 'visible',
}));

const ServiceItem = styled(ButtonBase)(({ theme }) => ({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(1.5, 0.5),
    borderRadius: theme.spacing(1.5),
    backgroundColor: theme.palette.common.white,
    border: `1px solid ${theme.palette.grey[300]}`,
    transition: theme.transitions.create('all'),
    overflow: 'visible',
    position: 'relative',
    '&:hover': {
        backgroundColor: theme.palette.grey[50],
        borderColor: theme.palette.grey[400],
    },
}));

// ----------------------------------------------------------------------

export default function QuickActionsGrid() {
    const navigate = useNavigate();
    const theme = useTheme();

    const MAIN_ACTIONS = [
        {
            title: 'To Wallet',
            icon: 'mdi:account-circle-outline',
            path: PATH_PAGE.comingSoon,
        },
        {
            title: 'To Bank',
            icon: 'mdi:bank',
            path: PATH_PAGE.comingSoon,
        },
        {
            title: 'Withdraw',
            icon: 'mdi:arrow-expand',
            path: PATH_PAGE.comingSoon,
        },
    ];

    const SERVICES = [
        { 
            title: 'Airtime', 
            icon: 'mdi:chart-bar',
            path: PATH_DASHBOARD.general.buyairtime,
        },
        { 
            title: 'Data', 
            icon: 'mdi:cellphone-arrow-down',
            path: PATH_DASHBOARD.general.buydata 
        },
        { 
            title: 'Thrift',
            icon: 'mdi:piggy-bank',
            path: PATH_PAGE.comingSoon 
        },
        { 
            title: 'TV', 
            icon: 'mdi:television-play',
            path: PATH_DASHBOARD.general.buycable 
        },
        { 
            title: 'Safebox', 
            icon: 'mdi:wallet-outline',
            path: PATH_PAGE.comingSoon 
        },
        { 
            title: 'Nepa Bill',
            icon: 'mdi:flash',
            path: PATH_DASHBOARD.general.buybill
        },
        { 
            title: 'Smart Card',
            icon: 'mdi:credit-card',
            path: PATH_PAGE.comingSoon 
        },
        { 
            title: 'More', 
            icon: 'mdi:dots-grid',
            path: PATH_DASHBOARD.general.allServices
        },
    ];

    return (
        <Stack spacing={2} sx={{ width: '100%', px: { xs: 0.5, sm: 0 } }}>
            {/* Main Actions Row */}
            <Grid 
                container 
                spacing={{ xs: 1, sm: 1.5 }} 
                sx={{ 
                    mb: 1.5,
                    width: '100%',
                }}
            >
                {MAIN_ACTIONS.map((action, index) => (
                    <Grid 
                        item 
                        xs={4} 
                        key={action.title}
                        sx={{
                            px: { 
                                xs: index === 0 ? 0 : 0.25, // First item: no left padding
                                sm: 0 
                            },
                            display: 'flex',
                        }}
                    >
                        <MainActionCard 
                            onClick={() => navigate(action.path)} 
                            sx={{ 
                                width: '100%',
                                px: { xs: 1.5, sm: 2 }, // Responsive padding inside card
                            }}
                        >
                            <MainIconWrapper>
                                <Iconify icon={action.icon} width={28} height={28} />
                            </MainIconWrapper>
                            <Typography 
                                variant="subtitle2" 
                                sx={{ 
                                    fontWeight: 600, 
                                    fontSize: { xs: '0.8rem', sm: '0.85rem' }, 
                                    whiteSpace: 'nowrap',
                                    color: 'text.primary',
                                }}
                            >
                                {action.title}
                            </Typography>
                        </MainActionCard>
                    </Grid>
                ))}
            </Grid>

            {/* Services Grid */}
            <Grid 
                container 
                spacing={{ xs: 0.75, sm: 1 }}
                sx={{
                    width: '100%',
                }}
            >
                {SERVICES.map((service, index) => (
                    <Grid 
                        item 
                        xs={3} 
                        key={service.title}
                        sx={{
                            px: { 
                                xs: index === 0 ? 0 : 0.25, // First item: no left padding
                                sm: 0 
                            },
                            display: 'flex',
                        }}
                    >
                        <ServiceItem 
                            onClick={() => navigate(service.path)} 
                            sx={{ 
                                width: '100%',
                                px: { xs: 0.75, sm: 0.5 }, // Responsive padding inside card
                            }}
                        >
                            <ServiceIconWrapper>
                                <Iconify icon={service.icon} width={24} height={24} />
                            </ServiceIconWrapper>
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    fontWeight: 500, 
                                    textAlign: 'center', 
                                    lineHeight: 1.2,
                                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                    color: 'text.primary',
                                }}
                            >
                                {service.title}
                            </Typography>
                        </ServiceItem>
                    </Grid>
                ))}
            </Grid>
        </Stack>
    );
}
