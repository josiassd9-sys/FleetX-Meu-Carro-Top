
import { VehicleSearchLink } from './types';

export const THEMES = {
  default: { id: 'default', name: 'Original Racing', primary: '#141414', accent: '#E11D48', bg: '#F8F9FA' },
  blue: { id: 'blue', name: 'Pacific Blue', primary: '#1e3a8a', accent: '#3b82f6', bg: '#f8fafc' },
  green: { id: 'green', name: 'Emerald Forest', primary: '#064e3b', accent: '#10b981', bg: '#f0fdf4' },
  dark: { id: 'dark', name: 'Carbon Fiber', primary: '#0f172a', accent: '#94a3b8', bg: '#020617' },
  orange: { id: 'orange', name: 'Grand Prix', primary: '#7c2d12', accent: '#f97316', bg: '#fff7ed' }
} as const;

export const DEFAULT_SEARCH_LINKS: VehicleSearchLink[] = [
  { id: '1', name: 'Placa i', url: 'https://www.placai.com/', color: 'red' },
  { id: '2', name: 'Detetive Veicular', url: 'https://detetiveveicular.com/', color: 'blue' },
  { id: '3', name: 'Lupa Veicular', url: 'https://www.lupaveicular.com/', color: 'orange' },
  { id: '4', name: 'Busca Sim', url: 'https://buscasim.com.br/', color: 'purple' },
  { id: '5', name: 'Busca Placas', url: 'https://buscaplacas.com.br/', color: 'indigo' }
];

export const DEFAULT_VEHICLE_STATE = { 
  name: '', 
  model: '', 
  year: '', 
  plate: '', 
  color: '', 
  mileage: 0, 
  imageUrl: '', 
  brandLogoUrl: '',
  engine: '',
  version: '',
  fuelType: '',
  chassis: '',
  usageProfile: 'mixed' as 'urban' | 'highway' | 'mixed',
  drivingStyle: 'moderate' as 'smooth' | 'moderate' | 'aggressive',
  usageDays: [1, 2, 3, 4, 5], // Seg a Sex por padrão
  operatingRpm: 'mid' as 'low' | 'mid' | 'high',
  avgDailyKm: 30,
  fipeValue: 0
};

export const ICON_OPTIONS = [ 
  'Car', 'Settings', 'Search', 'Wrench', 'Activity', 'Shield', 'Zap', 'Box', 'Gauge', 'Palette', 'Database', 'Calculator'
];

export const AUTO_DICTIONARY = [
  {
    name: 'Componentes de Motor & Fluidos',
    parts: [
      { name: 'Óleo do Motor', lifecycle: 10000, category: 'fluid' },
      { name: 'Filtro de Óleo', lifecycle: 10000, category: 'filter' },
      { name: 'Filtro de Ar', lifecycle: 10000, category: 'filter' },
      { name: 'Filtro de Combustível', lifecycle: 20000, category: 'filter' },
      { name: 'Líquido de Arrefecimento', lifecycle: 40000, category: 'cooling' },
      { name: 'Velas de Ignição', lifecycle: 40000, category: 'ignition' },
      { name: 'Cabo de Velas', lifecycle: 60000, category: 'ignition' }
    ]
  },
  {
    name: 'Transmissão & Correias',
    parts: [
      { name: 'Correia Dentada', lifecycle: 60000, category: 'engine' },
      { name: 'Correia de Acessórios (Poly-V)', lifecycle: 40000, category: 'engine' },
      { name: 'Embreagem (Kit)', lifecycle: 100000, category: 'transmission' },
      { name: 'Óleo do Câmbio', lifecycle: 60000, category: 'transmission' }
    ]
  },
  {
    name: 'Suspensão & Freios',
    parts: [
      { name: 'Pastilhas de Freio Dianteira', lifecycle: 25000, category: 'brake' },
      { name: 'Pastilhas de Freio Traseira', lifecycle: 40000, category: 'brake' },
      { name: 'Discos de Freio', lifecycle: 50000, category: 'brake' },
      { name: 'Fluido de Freio (DOT)', lifecycle: 40000, category: 'brake' },
      { name: 'Amortecedores Dianteiros', lifecycle: 60000, category: 'suspension' },
      { name: 'Amortecedores Traseiros', lifecycle: 60000, category: 'suspension' },
      { name: 'Pneus', lifecycle: 50000, category: 'tires' }
    ]
  }
];
