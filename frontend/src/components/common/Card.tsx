import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = ({
  children,
  title,
  subtitle,
  footer,
  hover = false,
  padding = 'md',
  className = '',
  ...props
}: CardProps) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-7',
  };
  
  return (
    <div
      className={`bg-white rounded-card border border-gray-100 shadow-card ${
        hover ? 'transition-shadow duration-300 hover:shadow-card-hover' : ''
      } ${className}`}
      {...props}
    >
      {(title || subtitle) && (
        <div className={`border-b border-gray-100 ${paddingClasses[padding]}`}>
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}
      
      <div className={paddingClasses[padding]}>{children}</div>
      
      {footer && (
        <div className={`border-t border-gray-100 ${paddingClasses[padding]}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;