import { HTMLAttributes } from 'react';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  initials?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away' | 'busy';
}

const Avatar = ({
  src,
  alt = 'Avatar',
  initials,
  size = 'md',
  status,
  className = '',
  ...props
}: AvatarProps) => {
  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
  };
  
  const statusClasses = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
  };
  
  const statusSizeClasses = {
    xs: 'h-1.5 w-1.5',
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
    xl: 'h-3.5 w-3.5',
  };
  
  return (
    <div className="relative inline-block" {...props}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
        />
      ) : (
        <div
          className={`flex items-center justify-center rounded-full bg-primary text-white font-medium ${sizeClasses[size]} ${className}`}
        >
          {initials || alt.charAt(0).toUpperCase()}
        </div>
      )}
      
      {status && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-white ${statusClasses[status]} ${statusSizeClasses[size]}`}
        />
      )}
    </div>
  );
};

export default Avatar;