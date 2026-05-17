
import React from 'react';
import { motion } from 'motion/react';
import { Wrench, Trash2, Box, Info } from 'lucide-react';
import { ServiceEntry } from '../../types';

interface ServicesTabProps {
  services: ServiceEntry[];
  onAddService: () => void;
  onDeleteItem: (id: string) => void;
  formatCurrency: (val: number) => string;
}

export const ServicesTab: React.FC<ServicesTabProps> = ({
  services,
  onAddService,
  onDeleteItem,
  formatCurrency
}) => {
  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-black italic uppercase tracking-tighter text-brand-primary flex items-center gap-2">
            <Wrench size={24} className="text-brand-accent" /> Histórico de Manutenção
          </h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Registros oficiais de oficina e reparos</p>
        </div>
        <button 
          onClick={onAddService}
          className="bg-brand-primary text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-accent transition-all shadow-xl shadow-brand-primary/20"
        >
          + Registrar Serviço
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {(!services || services.length === 0) ? (
          <div className="text-center py-24 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
            <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Wrench size={40} className="text-gray-200" />
            </div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Nenhum serviço registrado ainda.</p>
          </div>
        ) : (
          [...services].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((service) => (
            <motion.div 
              key={service.id} 
              layout
              className="bg-white p-6 rounded-3xl border border-gray-100 transition-all hover:border-brand-primary/20 shadow-sm group relative overflow-hidden"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 relative z-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black bg-gray-100 text-gray-400 px-2.5 py-1 rounded-lg uppercase tracking-widest">
                      {new Date(service.date).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="text-[10px] font-black bg-brand-primary/10 text-brand-primary px-2.5 py-1 rounded-lg uppercase tracking-widest">
                      {service.mileage.toLocaleString()} km
                    </span>
                  </div>
                  <h4 className="text-lg font-black text-brand-primary uppercase tracking-tight leading-none">{service.provider}</h4>
                  <p className="text-sm font-bold text-gray-500 italic">"{service.description}"</p>
                  
                  {service.items && service.items.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                       {service.items.map((item, idx) => (
                         <div key={idx} className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl">
                            <Box size={10} className="text-brand-accent" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{item}</span>
                         </div>
                       ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-3">
                   <div className="text-right">
                      <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Custo Total</p>
                      <p className="text-2xl font-mono font-black text-brand-accent">{formatCurrency(service.cost)}</p>
                   </div>
                   <button 
                    onClick={() => onDeleteItem(service.id)}
                    className="p-2 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
