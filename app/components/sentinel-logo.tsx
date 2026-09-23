import React from 'react';

interface SentinelLogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
  wordmarkClassName?: string;
  iconOnly?: boolean;
}

export function SentinelLogo({
  size = 24,
  showWordmark = true,
  className = '',
  wordmarkClassName = '',
  iconOnly = false,
}: SentinelLogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Approved Sentinel Ribbon Symbol */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="sentinel-ribbon-grad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#41b4ff" />
            <stop offset="45%" stopColor="#0071e3" />
            <stop offset="100%" stopColor="#0051ba" />
          </linearGradient>
          <linearGradient id="sentinel-ribbon-highlight" x1="10" y1="6" x2="22" y2="26" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#003d99" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        {/* Ribbon Loop Upper Section */}
        <path
          d="M20.5 5.5C24.0899 5.5 27 8.41015 27 12C27 15.1118 24.8143 17.7126 21.8789 18.3477L13.5 12.5C12.3954 11.7336 12.1266 10.2212 12.893 9.11663C13.6594 8.01206 15.1718 7.74326 16.2764 8.50965L20.5 11.4286V5.5Z"
          fill="url(#sentinel-ribbon-grad)"
          opacity="0.9"
        />
        {/* Ribbon Continuous S-Curve */}
        <path
          d="M22 6C25.3137 6 28 8.68629 28 12C28 15.65 25.35 18.66 21.85 19.34L11.5 12.2C9.567 10.86 9.04 8.23 10.38 6.3C11.72 4.37 14.35 3.84 16.28 5.18L21 8.45V6H22Z"
          fill="url(#sentinel-ribbon-highlight)"
        />
        {/* Main Fluid Ribbon S-Shape Body */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M17.5 5C14.1863 5 11.5 7.68629 11.5 11C11.5 11.7584 11.641 12.484 11.8984 13.1517L7.65234 16.0859C6.01235 17.2193 5 19.1023 5 21.0859C5 24.9084 8.09163 28 11.9141 28C15.2278 28 17.9141 25.3137 17.9141 22C17.9141 21.2416 17.773 20.516 17.5156 19.8483L21.7617 16.9141C23.4017 15.7807 24.4141 13.8977 24.4141 11.9141C24.4141 8.09163 21.3224 5 17.5 5ZM10.5 21.0859C10.5 20.2925 11.1425 19.65 11.9359 19.65C12.7294 19.65 13.3719 20.2925 13.3719 21.0859C13.3719 21.8794 12.7294 22.5219 11.9359 22.5219C11.1425 22.5219 10.5 21.8794 10.5 21.0859ZM18.9141 11.9141C18.9141 12.7075 18.2716 13.35 17.4781 13.35C16.6847 13.35 16.0422 12.7075 16.0422 11.9141C16.0422 11.1206 16.6847 10.4781 17.4781 10.4781C18.2716 10.4781 18.9141 11.1206 18.9141 11.9141Z"
          fill="url(#sentinel-ribbon-grad)"
        />
        {/* Shimmer Light Reflection Accent */}
        <path
          d="M17.5 6C20.5376 6 23 8.46243 23 11.5C23 13.0645 22.2036 14.5428 20.9141 15.4336L13.0859 20.8418C12.7265 21.0901 12.2476 21.0028 11.9993 20.6434C11.751 20.284 11.8383 19.8051 12.1977 19.5568L20.0259 14.1486C20.9701 13.4965 21.5541 12.4138 21.5541 11.2703C21.5541 9.02237 19.748 7.2 17.5 7.2C15.8284 7.2 14.3982 8.20935 13.791 9.66406C13.6288 10.0531 13.1818 10.2393 12.7927 10.0771C12.4036 9.91484 12.2174 9.46788 12.3796 9.07878C13.2081 7.09395 15.1611 6 17.5 6Z"
          fill="white"
          fillOpacity="0.5"
        />
      </svg>

      {/* Wordmark */}
      {showWordmark && !iconOnly && (
        <span
          className={`font-semibold tracking-[-0.02em] text-[var(--text-primary)] text-[15px] ${wordmarkClassName}`}
        >
          Sentinel
        </span>
      )}
    </div>
  );
}
