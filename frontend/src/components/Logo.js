import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import { Box } from '@mui/material';

Logo.propTypes = {
  disabledLink: PropTypes.bool,
  sx: PropTypes.object,
};

export default function Logo({ disabledLink = false, sx }) {
  // In production, React build is in Laravel's public folder
  // Assets should be accessible at /assets/images/logo.png
  // Try multiple paths to ensure it works in all environments
  const getLogoPath = () => {
    // First try: Standard React build path
    return '/assets/images/logo.png';
  };
  
  const logoPath = getLogoPath();
  
  const logo = (
    <Box 
      component="img"
      src={logoPath}
      alt="KoboPoint Logo"
      onError={(e) => {
        // Fallback paths for different server configurations
        const currentSrc = e.target.src;
        const baseUrl = window.location.origin;
        
        // Try different paths
        const fallbackPaths = [
          '/assets/images/logo.png',
          '/static/media/logo.png',
          '/static/logo.png',
          '/logo.png',
          `${baseUrl}/assets/images/logo.png`,
          `${baseUrl}/public/assets/images/logo.png`
        ];
        
        const currentIndex = fallbackPaths.findIndex(path => currentSrc.includes(path) || currentSrc.endsWith(path));
        const nextIndex = currentIndex + 1;
        
        if (nextIndex < fallbackPaths.length) {
          e.target.src = fallbackPaths[nextIndex];
        } else {
          console.warn('Logo image not found. Tried all paths:', fallbackPaths);
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
