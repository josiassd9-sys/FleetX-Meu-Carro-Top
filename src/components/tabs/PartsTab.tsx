
import React from 'react';
import { motion } from 'motion/react';
import { 
  Box, Search, Package, ExternalLink, Calculator, Trash2, 
  Settings, CheckCircle2, AlertTriangle, Clock 
} from 'lucide-react';
import { Part, Vehicle } from '../../types';

interface PartsTabProps {
  vehicle: Vehicle;
  onAddPart: () => void;
  onDeleteItem: (id: string) => void;
  onToggleBudget: (id: string) => void;
  predictCurrentMileage: (v: Vehicle) => number;
  formatCurrency: (val: number) => string;
}

export const PartsTab: React.FC<PartsTabProps> = ({
  vehicle,
  onAddPart,
  onDeleteItem,
  onToggleBudget,
  predictCurrentMileage,
  formatCurrency
}) => {
  const currentMileage = predictCurrentMileage(vehicle);

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-black italic uppercase tracking-tighter text-brand-primary flex items-center gap-2">
            <Box size={24} className="text-brand-accent" /> Stock & Componentes
          </h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Catálogo de peças e monitoramento de vida útil</p>
        </div>
        <button 
          onClick={onAddPart}
          className="bg-brand-primary text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-accent transition-all shadow-xl shadow-brand-primary/20"
        >
          + Acervo de Peças
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(!vehicle.parts || vehicle.parts.length === 0) ? (
          <div className="col-span-full text-center py-24 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
            <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Box size={40} className="text-gray-200" />
            </div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Inventário vazio.</p>
          </div>
        ) : (
          vehicle.parts.map((part) => {
            const currentKm = currentMileage;
            const installedKm = part.installedAtMileage || 0;
            const lifeKm = part.expectedLifeMileage || 50000;
            const usedKm = Math.max(0, currentKm - installedKm);
            const replacedDate = part.installedAtDate ? new Date(part.installedAtDate) : null;
            const healthPercent = Math.max(0, Math.min(100, 100 - (usedKm / lifeKm * 100)));
            
            return (
              <motion.div 
                key={part.id} 
                layout
                className="bg-white p-6 rounded-3xl border border-gray-100 transition-all hover:border-brand-primary/20 shadow-sm flex flex-col relative overflow-hidden group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="shrink-0 bg-gray-50 p-3 rounded-2xl group-hover:bg-brand-primary/10 transition-colors">
                    <Package size={20} className="text-brand-primary" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onToggleBudget(part.id)}
                      className={`p-2 rounded-xl transition-all ${part.isInBudget ? 'bg-brand-accent text-brand-primary' : 'bg-gray-50 text-gray-400 hover:text-brand-primary'}`}
                      title={part.isInBudget ? "No Orçamento" : "Adicionar ao Orçamento"}
                    >
                      <Calculator size={14} />
                    </button>
                    <button 
                      onClick={() => onDeleteItem(part.id)}
                      className="p-2 bg-gray-50 text-gray-400 hover:text-red-500 rounded-xl transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-base font-black text-brand-primary uppercase tracking-tight line-clamp-1">{part.name}</h4>
                  <p className="text-[10px] text-gray-400 font-mono font-bold tracking-widest uppercase">{part.code || 'S/ COD'}</p>
                </div>

                <div className="mt-auto space-y-4">
                  <div>
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-1.5 grayscale group-hover:grayscale-0 transition-all">
                      <span className="flex items-center gap-1">
                        {healthPercent > 20 ? <CheckCircle2 size={10} className="text-green-500" /> : healthPercent > 0 ? <AlertTriangle size={10} className="text-amber-500" /> : <Clock size={10} className="text-red-500" />}
                        Saúde IA: {Math.round(healthPercent)}%
                      </span>
                      <span className="text-gray-400">{usedKm.toLocaleString()} / {lifeKm.toLocaleString()} KM</span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${healthPercent}%` }}
                        className={`h-full rounded-full ${healthPercent > 50 ? 'bg-green-500' : healthPercent > 20 ? 'bg-amber-500' : 'bg-red-500'}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 p-2 rounded-xl">
                       <p className="text-[8px] text-gray-400 font-black uppercase mb-0.5">Instalado em</p>
                       <p className="text-[10px] font-bold text-gray-700">{replacedDate ? replacedDate.toLocaleDateString('pt-BR') : '--'}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-xl">
                       <p className="text-[8px] text-gray-400 font-black uppercase mb-0.5">Quilometragem</p>
                       <p className="text-[10px] font-bold text-gray-700">{installedKm.toLocaleString()} KM</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <a 
                      href={`https://lista.mercadolivre.com.br/${part.name.replace(/\s+/g, '-')}-${vehicle.name}-${vehicle.model}-${String(vehicle.year).split('/')[0]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-yellow-400 hover:bg-yellow-500 text-brand-primary text-[10px] font-black uppercase rounded-xl transition-all shadow-lg shadow-yellow-400/20"
                    >
                      <ExternalLink size={12} /> Comprar Peça
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
