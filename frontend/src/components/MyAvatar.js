// hooks
import useAuth from '../hooks/useAuth';
// utils
import createAvatar from '../utils/createAvatar';
//
import Avatar from './Avatar';

// ----------------------------------------------------------------------

export default function MyAvatar({ ...other }) {
  const { user } = useAuth();

  // Default avatar path - confirmed working at /assets/images/male.webp
  const defaultAvatar = '/assets/images/male.webp';
  
  // Use profile_image if available, otherwise use default avatar
  const avatarSrc = user?.profile_image || defaultAvatar;
  const hasCustomImage = !!user?.profile_image;

  const handleImageError = (e) => {
    // If default avatar fails, try absolute URL
    if (e.target.src.includes(defaultAvatar)) {
      const absolutePath = window.location.origin + defaultAvatar;
      if (e.target.src !== absolutePath) {
        e.target.src = absolutePath;
      } else {
        console.error('Default avatar image not found at:', defaultAvatar);
      }
    }
  };

  return (
    <Avatar
      src={avatarSrc}
      alt={user?.username}
      color={hasCustomImage ? 'default' : createAvatar(user?.username).color}
      onError={handleImageError}
      {...other}
    >
      {!hasCustomImage && createAvatar(user?.username).name}
    </Avatar>
  );
}
