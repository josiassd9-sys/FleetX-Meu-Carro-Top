
import { VehicleSearchLink } from './types';

export const THEMES = {
  default: { id: 'default', name: 'Original Racing', primary: '#141414', accent: '#E11D48', bg: '#F8F9FA' },
  blue: { id: 'blue', name: 'Pacific Blue', primary: '#1e3a8a', accent: '#3b82f6', bg: '#f8fafc' },
  green: { id: 'green', name: 'Emerald Forest', primary: '#064e3b', accent: '#10b981', bg: '#f0fdf4' },
  dark: { id: 'dark', name: 'Carbon Fiber', primary: '#0f172a', accent: '#94a3b8', bg: '#020617' },
  orange: { id: 'orange', name: 'Grand Prix', primary: '#7c2d12', accent: '#f97316', bg: '#fff7ed' },
  slate: { id: 'slate', name: 'Slate Professional', primary: '#334155', accent: '#64748b', bg: '#f8fafc' },
  indigo: { id: 'indigo', name: 'Indigo Corporate', primary: '#312e81', accent: '#4f46e5', bg: '#f5f3ff' },
  teal: { id: 'teal', name: 'Teal Executive', primary: '#134e4a', accent: '#0d9488', bg: '#f0fdfa' },
  royal: { id: 'royal', name: 'Royal Service', primary: '#4c1d95', accent: '#7c3aed', bg: '#f5f3ff' },
  bordeaux: { id: 'bordeaux', name: 'Bordeaux Luxury', primary: '#450a0a', accent: '#991b1b', bg: '#fef2f2' },
  noir: { id: 'noir', name: 'Midnight Noir', primary: '#020617', accent: '#1e293b', bg: '#000000' },
  silver: { id: 'silver', name: 'Silver Precision', primary: '#1f2937', accent: '#9ca3af', bg: '#f3f4f6' },
  espresso: { id: 'espresso', name: 'Espresso Roast', primary: '#422006', accent: '#92400e', bg: '#fffbeb' },
  forest: { id: 'forest', name: 'Forest Deep', primary: '#064e3b', accent: '#22c55e', bg: '#f0fdf4' },
  nordic: { id: 'nordic', name: 'Nordic Minimalism', primary: '#0f172a', accent: '#38bdf8', bg: '#f0f9ff' },
  berry: { id: 'berry', name: 'Berry Elite', primary: '#701a75', accent: '#d946ef', bg: '#fdf4ff' },
  graphite: { id: 'graphite', name: 'Graphite Tech', primary: '#111827', accent: '#374151', bg: '#f9fafb' },
  oceanic: { id: 'oceanic', name: 'Oceanic Blue', primary: '#083344', accent: '#0e7490', bg: '#ecfeff' },
  sage: { id: 'sage', name: 'Sage Heritage', primary: '#166534', accent: '#15803d', bg: '#f0fdf4' },
  gold: { id: 'gold', name: 'Golden Essence', primary: '#713f12', accent: '#ca8a04', bg: '#fefce8' },
  steel: { id: 'steel', name: 'Steel Industrial', primary: '#374151', accent: '#6b7280', bg: '#f9fafb' }
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
