import React from 'react';
import { getBrandLogo } from '../brandLogos';

interface BrandLogoProps {
  vehicleName: string;
  brandLogoUrl?: string;
  className?: string;
}

export const BrandLogo = ({ vehicleName, brandLogoUrl, className }: BrandLogoProps) => {
  const logo = brandLogoUrl || getBrandLogo(vehicleName);

  if (!logo) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 text-gray-300 font-black text-[10px] italic ${className}`}>
        {vehicleName?.substring(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img 
      src={logo} 
      alt="Logo da Marca" 
      className={`object-contain p-1 ${className}`}
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = 'none';
      }}
    />
  );
};
