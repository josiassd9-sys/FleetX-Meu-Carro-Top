import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

// Ícone de Carro Esportivo Estilo Ferrari (Vista Superior)
export const CarFerrariTop = ({ size = 24, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M7 3C7 3 8 2 12 2C16 2 17 3 17 3L18 6L19 9V18C19 20 17 21 16 21H8C7 21 5 20 5 18V9L6 6L7 3Z" />
    <path d="M5 10H19" />
    <path d="M7 6C7 6 9 5 12 5C15 5 17 6 17 6" />
    <path d="M8 21V22" />
    <path d="M16 21V22" />
    <path d="M10 2L10 4" />
    <path d="M14 2L14 4" />
    <path d="M9 10C9 10 9 14 9 15C9 16 10 17 12 17C14 17 15 16 15 15C15 14 15 10 15 10" />
  </svg>
);

// Ícone de Carro Muscle/Clássico (Vista Superior)
export const CarMuscleTop = ({ size = 24, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <path d="M5 8H19" />
    <path d="M5 17H19" />
    <path d="M8 3V6" />
    <path d="M16 3V6" />
    <path d="M9 11L15 11" />
    <path d="M9 13L15 13" />
    <rect x="7" y="19" width="2" height="3" rx="0.5" />
    <rect x="15" y="19" width="2" height="3" rx="0.5" />
  </svg>
);

// Silhueta de Carro Esportivo
export const CarSilhouette = ({ size = 24, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2 17H22L21 15C20 13 18 12 16 12H8C6 12 4 13 3 15L2 17Z" />
    <path d="M16 12L14 8L10 8L8 12" />
    <path d="M5 17C5 18.1 4.1 19 3 19C1.9 19 1 18.1 1 17L5 17Z" />
    <path d="M23 17C23 18.1 22.1 19 21 19C19.9 19 19 18.1 19 17L23 17Z" />
  </svg>
);

// Volante Esportivo
export const SteeringWheelCustom = ({ size = 24, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 9V2" />
    <path d="M9.5 13.5L3.5 17.5" />
    <path d="M14.5 13.5L20.5 17.5" />
  </svg>
);
