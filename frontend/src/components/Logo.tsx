import React from 'react';

interface LogoProps {
    className?: string;
    size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 32 }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="logo-gradient" x1="2" y1="6" x2="30" y2="26" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#818cf8" /> {/* Indigo-400 */}
                    <stop offset="100%" stopColor="#22d3ee" /> {/* Cyan-400 */}
                </linearGradient>
            </defs>

            {/* Main Shape: Abstract Hexagon/Shield/Wallet hybrid */}
            <path
                d="M16 2 L28 8 V20 C28 26.6274 22.6274 32 16 32 C9.37258 32 4 26.6274 4 20 V8 L16 2Z"
                fill="url(#logo-gradient)"
                fillOpacity="0.1"
                stroke="url(#logo-gradient)"
                strokeWidth="2"
            />

            {/* Inner Element: Rising Graph / Checkmark */}
            <path
                d="M10 18 L15 23 L24 11"
                stroke="url(#logo-gradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Accent Dot */}
            <circle cx="24" cy="11" r="1.5" fill="#22d3ee" />
        </svg>
    );
};

export default Logo;
