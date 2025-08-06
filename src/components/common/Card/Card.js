import React from 'react';
import classNames from 'classnames';

const Card = ({ 
  children, 
  className, 
  padding = true, 
  shadow = true, 
  ...props 
}) => {
  const cardClasses = classNames(
    'bg-white rounded-lg border border-gray-200',
    {
      'p-6': padding,
      'shadow-sm': shadow
    },
    className
  );

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export default Card;