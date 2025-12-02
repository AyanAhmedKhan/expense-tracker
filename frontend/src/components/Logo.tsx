import React from 'react';

interface LogoProps {
    className?: string;
    size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 32 }) => {
    return (
        <img
            src="/icons/expenseslog.png"
            alt="ExpensesLog"
            width={size}
            height={size}
            className={`object-contain ${className}`}
            style={{ width: size, height: size }}
        />
    );
};

export default Logo;
