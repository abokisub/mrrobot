import { styled } from '@mui/material/styles';
import { Card, Typography, Button, Box, Stack } from '@mui/material';

// ----------------------------------------------------------------------

const RootStyle = styled(Card)(({ theme }) => ({
    position: 'relative',
    padding: theme.spacing(3),
    background: theme.palette.common.white,
    color: theme.palette.text.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    border: `1px solid ${theme.palette.grey[300]}`, // Added border for visibility
    boxShadow: theme.customShadows.z8, // Added shadow
    [theme.breakpoints.down('md')]: {
        flexDirection: 'column',
        textAlign: 'center',
        paddingBottom: 0,
    },
}));

const ContentStyle = styled('div')(({ theme }) => ({
    zIndex: 10,
    maxWidth: 480,
    [theme.breakpoints.down('md')]: {
        marginBottom: theme.spacing(2),
    },
}));

const ImageStyle = styled('img')(({ theme }) => ({
    height: 200,
    objectFit: 'contain',
    [theme.breakpoints.down('md')]: {
        height: 160,
        marginBottom: -20, // Negative margin to pull image down slightly
    },
}));

// ----------------------------------------------------------------------

export default function BottomBanner() {
    return (
        <RootStyle>
            <ContentStyle>
                <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Send & Receive Money Seamlessly
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                    confirm payment and manage sales.
                </Typography>
                <Button
                    variant="contained"
                    sx={{
                        bgcolor: '#000', // Black button as per design
                        color: '#fff',
                        px: 4,
                        py: 1,
                        borderRadius: 1,
                        '&:hover': {
                            bgcolor: '#333',
                        },
                    }}
                >
                    Get Started
                </Button>
            </ContentStyle>

            <Box sx={{ position: 'relative' }}>
                {/* Decorative circles could be added here if needed */}
                <ImageStyle 
                    alt="lady" 
                    src="/assets/images/lady.png"
                    onError={(e) => {
                        // If image fails, try absolute URL
                        const absolutePath = window.location.origin + '/assets/images/lady.png';
                        if (e.target.src !== absolutePath) {
                            e.target.src = absolutePath;
                        } else {
                            console.error('Lady image not found at:', '/assets/images/lady.png');
                        }
                    }}
                    onLoad={() => {
                        console.log('Lady image loaded successfully');
                    }}
                />
            </Box>
        </RootStyle>
    );
}
