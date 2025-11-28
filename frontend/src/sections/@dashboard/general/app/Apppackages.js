import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import { Card, Link, Grid, Typography} from '@mui/material';

// utils


// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

AppPackages.propTypes ={
 image: PropTypes.oneOfType([PropTypes.string, PropTypes.element, PropTypes.node]),
 displayname: PropTypes.string,
 link: PropTypes.any.isRequired
};


export default function AppPackages({image,displayname, link }) {
  return (
    <Link component={RouterLink} to={link} color="inherit" underline="none" sx={{ width: '100%', display: 'block' }}>
    <Card sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexDirection: 'column',
      p: 3,
      height: '100%',
      width: '100%',
    }}>
    <Grid item sx={{ width: '100%', textAlign: 'center' }}>
    <div className="image-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
       {image}
       </div>
       <Typography variant="h6" sx={{ textAlign: 'center' }}> {displayname} </Typography>
   </Grid>
    </Card>
    </Link>
  );
}
