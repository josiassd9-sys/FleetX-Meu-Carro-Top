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
      <div className={`flex items-center justify-center bg-gray-50 text-brand-primary rounded-lg ${className}`}>
        <img src="/src/assets/images/fleetx_final_logo_1779384389550.png" alt="FleetX Logo" className="w-full h-full object-contain p-2" />
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
