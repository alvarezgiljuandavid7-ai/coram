import React from 'react';
// @ts-ignore
import coramLogoImg from '../assets/images/regenerated_image_1780959409732.jpg';

interface CoramLogoProps {
  variant?: 'full' | 'icon';
  size?: number | string;
  className?: string;
  lightMode?: boolean;
}

export const CoramLogo: React.FC<CoramLogoProps> = ({
  variant = 'full',
  size,
  className = '',
  lightMode = false,
}) => {
  // Compute inline sizes if requested, otherwise rely on className
  const containerStyle = size
    ? { width: typeof size === 'number' ? `${size}px` : size, height: typeof size === 'number' ? `${size}px` : size }
    : {};

  if (variant === 'icon') {
    return (
      <div 
        className={`flex items-center justify-center overflow-hidden rounded-xl bg-[#0A0B11] border border-[#D4AF37]/25 shrink-0 ${className}`}
        style={containerStyle}
      >
        <img
          src={coramLogoImg}
          alt="CorAM Icon"
          className="w-full h-full object-contain p-0.5"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div 
      className={`flex flex-col items-center justify-center select-none ${className}`}
      style={containerStyle}
    >
      <img
        src={coramLogoImg}
        alt="CorAM Premium Logo"
        className="w-full h-full object-contain rounded-2xl shadow-xl border border-[#D4AF37]/15"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
