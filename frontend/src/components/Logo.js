import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import { Box } from '@mui/material';

Logo.propTypes = {
  disabledLink: PropTypes.bool,
  sx: PropTypes.object,
};

export default function Logo({ disabledLink = false, sx }) {
  const logo = (
    <Box 
      component="img"
      src="/assets/images/logo.png"
      alt="KoboPoint Logo"
      onError={(e) => {
        // Fallback: try alternative path if primary fails
        if (e.target.src !== '/static/logo.png') {
          e.target.src = '/static/logo.png';
        } else {
          // If both fail, hide image
          e.target.style.display = 'none';
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
