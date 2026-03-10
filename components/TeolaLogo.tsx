
import React from 'react';

interface TeolaLogoProps {
  className?: string;
}

const TeolaLogo: React.FC<TeolaLogoProps> = ({ className = "w-10 h-10" }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <g className="logo-group">
        <path 
          d="M50 20V80" 
          className="stroke-black dark:stroke-white transition-colors duration-500" 
          strokeWidth="1.5" 
          strokeLinecap="square"
        />
        
        <path 
          d="M20 35C20 35 35 25 50 25C65 25 80 35 80 35" 
          className="stroke-black dark:stroke-white transition-colors duration-500" 
          strokeWidth="6" 
          strokeLinecap="butt"
        />

        <circle 
          cx="50" 
          cy="25" 
          r="3" 
          className="fill-blue-500"
        />

        <path 
          d="M35 80L65 80" 
          className="stroke-black dark:stroke-white transition-colors duration-500" 
          strokeWidth="0.75" 
          strokeLinecap="square"
        />
      </g>
    </svg>
  );
};

export default TeolaLogo;
