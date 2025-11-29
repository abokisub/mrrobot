import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import { Box } from '@mui/material';

Logo.propTypes = {
  disabledLink: PropTypes.bool,
  sx: PropTypes.object,
};

export default function Logo({ disabledLink = false, sx }) {
  // Use process.env.PUBLIC_URL for production builds, fallback to empty string for dev
  // PUBLIC_URL is typically empty unless deploying to a subdirectory
  const publicUrl = (process.env.PUBLIC_URL || '').replace(/\/$/, ''); // Remove trailing slash
  const logoPath = publicUrl ? `${publicUrl}/assets/images/logo.png` : '/assets/images/logo.png';
  
  const logo = (
    <Box 
      component="img"
      src={logoPath}
      alt="KoboPoint Logo"
      onError={(e) => {
        // Fallback: try alternative paths if primary fails
        const currentSrc = e.target.src;
        const basePath = publicUrl || '';
        if (!currentSrc.includes('/static/logo.png')) {
          e.target.src = `${basePath}/static/logo.png`;
        } else if (!currentSrc.includes('/logo.png')) {
          e.target.src = `${basePath}/logo.png`;
        } else {
          // If all fail, log warning but keep trying
          console.warn('Logo image not found. Tried:', logoPath);
        }
      }}
      sx={{ 
        width: 40, 
        height: 40, 
        objectFit: 'contain',
        display: 'block',
        ...sx 
      }}
    />
  );
  
  if (disabledLink) {
    return <>{logo}</>;
  }

  return <RouterLink to="">{logo}</RouterLink>
}
