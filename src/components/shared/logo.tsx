
import type React from 'react';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  // any additional props if needed
}

const Logo: React.FC<LogoProps> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24" // Default width, can be overridden by props
      height="24" // Default height, can be overridden by props
      viewBox="0 0 24 24" // Standardized viewBox
      fill="none"
      stroke="currentColor" // Ensures it inherits text color
      strokeWidth="2" // Standardized strokeWidth
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props} // Allows overriding default width, height, className, etc.
    >
      {/* Enhanced graduation cap for SMART STUDENT */}
      {/* Main mortarboard (top flat part) */}
      <path d="M2 9 L12 7 L22 9 L12 11 L2 9 Z" fill="currentColor" fillOpacity="0.1" />
      {/* Mortarboard outline */}
      <path d="M2 9 L12 7 L22 9 L12 11 L2 9 Z" />
      {/* Cap base */}
      <path d="M7 11 L17 11 L17 15 C17 15.5 16.5 16 16 16 L8 16 C7.5 16 7 15.5 7 15 L7 11 Z" fill="currentColor" fillOpacity="0.05" />
      {/* Cap base outline */}
      <path d="M7 11 L17 11 L17 15 C17 15.5 16.5 16 16 16 L8 16 C7.5 16 7 15.5 7 15 L7 11 Z" />
      {/* Tassel */}
      <path d="M22 9 L22 12" strokeWidth="2.5" />
      <circle cx="22" cy="13" r="1" fill="currentColor" />
      {/* Center graduation button/decoration */}
      <circle cx="12" cy="9" r="0.5" fill="currentColor" />
    </svg>
  );
};

export default Logo;
