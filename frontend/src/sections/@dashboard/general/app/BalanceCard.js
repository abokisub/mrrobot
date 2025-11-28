import PropTypes from 'prop-types';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { styled, useTheme } from '@mui/material/styles';
import { Card, Typography, Stack, Button, IconButton, Box } from '@mui/material';
// utils
import { fCurrency } from '../../../../utils/formatNumber';
// routes
import { PATH_DASHBOARD } from '../../../../routes/paths';
// components
import Iconify from '../../../../components/Iconify';

// ----------------------------------------------------------------------

const RootStyle = styled(Card)(({ theme }) => ({
    position: 'relative',
    background: '#00D9A5',
    padding: theme.spacing(1.5, 2.5, 0.5, 2.5),
    color: theme.palette.common.white,
    borderRadius: theme.spacing(2.5),
    boxShadow: 'none',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    minHeight: { xs: 120, sm: 130 },
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(1.25, 2, 0.5, 2),
        minHeight: 110,
    },
}));

const ShieldIconWrapper = styled(Box)(({ theme }) => ({
    width: 20,
    height: 20,
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexShrink: 0,
}));

const ShieldCheckmark = styled(Box)(({ theme }) => ({
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: theme.palette.common.white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '8px',
    color: '#00D9A5',
    fontWeight: 'bold',
}));

const AddMoneyButton = styled(Button)(({ theme }) => ({
    backgroundColor: theme.palette.common.white,
    color: '#00D9A5',
    borderRadius: 25,
    padding: theme.spacing(0.6, 2),
    textTransform: 'none',
    fontWeight: 600,
    fontSize: { xs: '0.75rem', sm: '0.8rem' },
    boxShadow: 'none',
    whiteSpace: 'nowrap',
    '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(0.5, 1.5),
        fontSize: '0.7rem',
    },
}));

// ----------------------------------------------------------------------

BalanceCard.propTypes = {
    balance: PropTypes.number,
};

export default function BalanceCard({ balance }) {
    const theme = useTheme();
    const [showBalance, setShowBalance] = useState(false);

    const onToggleShowBalance = () => {
        setShowBalance(!showBalance);
    };

    return (
        <RootStyle>
            {/* Top Row: Available Balance & Transaction History */}
            <Stack 
                direction="row" 
                justifyContent="space-between" 
                alignItems="center"
                sx={{ mb: 1 }}
            >
                {/* Left: Shield + Available Balance */}
                <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1, minWidth: 0 }}>
                    <ShieldIconWrapper>
                        <Iconify icon="eva:shield-fill" width={14} height={14} sx={{ opacity: 0.9 }} />
                        <ShieldCheckmark>✓</ShieldCheckmark>
                    </ShieldIconWrapper>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            fontWeight: 500,
                            fontSize: { xs: '0.8rem', sm: '0.875rem' },
                            whiteSpace: 'nowrap',
                        }}
                    >
                        Available Balance
                    </Typography>
                </Stack>

                {/* Right: Transaction History */}
                <Stack 
                    direction="row" 
                    alignItems="center" 
                    spacing={0.5}
                    component={RouterLink} 
                    to={PATH_DASHBOARD.trans.root} 
                    sx={{ 
                        textDecoration: 'none', 
                        color: 'inherit', 
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        ml: 2,
                        '&:hover': {
                            opacity: 0.9,
                        },
                    }}
                >
                    <Typography 
                        variant="caption" 
                        sx={{ 
                            fontWeight: 500,
                            fontSize: { xs: '0.75rem', sm: '0.8rem' }
                        }}
                    >
                        Transaction History
                    </Typography>
                    <Iconify icon="eva:arrow-ios-forward-fill" width={14} height={14} />
                </Stack>
            </Stack>

            {/* Middle Row: Balance Amount with Arrow + Eye Icon + Add Money Button */}
            <Stack 
                direction="row" 
                justifyContent="space-between" 
                alignItems="center"
                sx={{ 
                    flexWrap: { xs: 'wrap', sm: 'nowrap' }, 
                    gap: 1,
                    mt: 0.5,
                }}
            >
                {/* Left: Balance with Arrow and Eye */}
                <Stack direction="row" alignItems="center" spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
                    <Typography 
                        variant="h3" 
                        sx={{ 
                            fontWeight: 700,
                            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                            letterSpacing: '0.5px',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {showBalance ? `₦${fCurrency(balance)}` : '****'}
                    </Typography>
                    {!showBalance && (
                        <Iconify 
                            icon="eva:arrow-ios-forward-fill" 
                            width={18} 
                            height={18} 
                            sx={{ opacity: 0.9, flexShrink: 0 }} 
                        />
                    )}
                    <IconButton 
                        onClick={onToggleShowBalance} 
                        size="small" 
                        sx={{ 
                            color: 'inherit', 
                            p: 0.5,
                            ml: 0.5,
                            flexShrink: 0,
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                        }}
                    >
                        <Iconify 
                            icon={showBalance ? 'eva:eye-fill' : 'eva:eye-off-fill'} 
                            width={18} 
                            height={18} 
                        />
                    </IconButton>
                </Stack>

                {/* Right: Add Money Button */}
                <Box sx={{ flexShrink: 0 }}>
                    <AddMoneyButton
                        startIcon={<Iconify icon="eva:plus-fill" width={14} height={14} />}
                        component={RouterLink}
                        to={PATH_DASHBOARD.fund.root}
                    >
                        Add Money
                    </AddMoneyButton>
                </Box>
            </Stack>
        </RootStyle>
    );
}
