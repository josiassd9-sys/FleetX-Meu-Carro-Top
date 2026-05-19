import React from 'react';
import { motion } from 'motion/react';
import { Settings, Plus } from 'lucide-react';
import { HeaderLogo } from './';
import { AppData } from '../types';

interface AppHeaderProps {
  data: AppData;
  setIsSettingsOpen: (isOpen: boolean) => void;
  setIsAddingVehicle: (isAdding: boolean) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  data,
  setIsSettingsOpen,
  setIsAddingVehicle
}) => {
  return (
    <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-2 gap-2">
      <div className="flex items-center gap-4">
        <motion.div 
          whileHover={{ rotate: 10, scale: 1.1 }}
          className="bg-brand-accent p-3 rounded shadow-lg shadow-brand-accent/20 glow-accent"
        >
          <HeaderLogo iconName={data.settings?.appIcon} className="text-white" />
        </motion.div>
        <div>
          <h1 className="text-4xl font-black tracking-tight text-brand-primary leading-tight">
            {data.settings?.appName || 'Meu Carro Top'}
          </h1>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded bg-green-500 animate-pulse"></span>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Sistema de Gestão Ativo</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 w-full lg:w-auto lg:min-w-[400px]">
        <motion.button 
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsSettingsOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white border border-gray-100 text-sm font-bold text-gray-600 hover:text-brand-primary hover:border-brand-primary/30 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
        >
          <Settings size={18} /> <span>Configurações</span>
        </motion.button>
        <motion.button 
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAddingVehicle(true)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-brand-primary text-white text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-brand-accent transition-all"
        >
          <Plus size={18} /> <span>Novo Veículo</span>
        </motion.button>
      </div>
    </header>
  );
};
