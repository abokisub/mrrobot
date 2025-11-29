import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import { Box } from '@mui/material';

Logo.propTypes = {
  disabledLink: PropTypes.bool,
  sx: PropTypes.object,
};

export default function Logo({ disabledLink = false, sx }) {
  // Logo path - confirmed working at /assets/images/logo.png
  const logoPath = '/assets/images/logo.png';
  
  const logo = (
    <Box 
      component="img"
      src={logoPath}
      alt="KoboPoint Logo"
      onError={(e) => {
        // Log error for debugging
        console.error('Logo failed to load from:', e.target.src);
        // Try absolute URL as fallback
        const absolutePath = window.location.origin + logoPath;
        if (e.target.src !== absolutePath) {
          e.target.src = absolutePath;
        } else {
          console.error('Logo image not found at:', logoPath);
        }
      }}
      onLoad={() => {
        // Logo loaded successfully
        console.log('Logo loaded successfully from:', logoPath);
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
