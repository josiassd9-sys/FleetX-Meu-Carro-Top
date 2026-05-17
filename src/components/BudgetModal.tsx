
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingCart, Calculator, Trash2, Download } from 'lucide-react';
import { Vehicle } from '../types';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVehicle: Vehicle | null;
  onUpdatePartPrice: (partId: string, price: number) => void;
  onTogglePartBudget: (partId: string) => void;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  selectedVehicle,
  onUpdatePartPrice,
  onTogglePartBudget
}) => {
  if (!selectedVehicle) return null;

  const budgetParts = (selectedVehicle.parts || []).filter(p => p.isInBudget);
  const totalEstimated = budgetParts.reduce((sum, p) => sum + (p.estimatedPrice || 0), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          >
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-brand-accent p-2.5 rounded-xl text-white shadow-lg shadow-brand-accent/20">
                  <ShoppingCart size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter text-brand-primary">Orçamento de Manutenção</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{selectedVehicle.name} {selectedVehicle.model}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 mb-6 custom-scrollbar">
              {budgetParts.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <Calculator size={48} className="mx-auto mb-4 opacity-10" />
                  <p className="font-bold">Nenhuma peça adicionada ao orçamento.</p>
                  <p className="text-[10px] uppercase tracking-widest mt-2 max-w-xs mx-auto">
                    Clique no ícone de cifrão ($) em uma peça para estimar o preço e adicionar aqui.
                  </p>
                </div>
              ) : (
                budgetParts.map((part) => (
                  <div key={part.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group">
                    <div>
                      <p className="font-black text-brand-primary uppercase tracking-tight">{part.name}</p>
                      <p className="text-[9px] text-gray-400 font-mono font-bold tracking-widest uppercase">{part.code || 'S/ COD'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="relative">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300">R$</span>
                           <input 
                            type="number"
                            className="w-32 bg-white border border-gray-100 rounded-xl pl-8 pr-3 py-2 text-sm font-mono font-black text-right focus:ring-2 focus:ring-brand-accent focus:outline-none shadow-sm"
                            value={part.estimatedPrice || 0}
                            onChange={(e) => onUpdatePartPrice(part.id, Number(e.target.value))}
                          />
                        </div>
                        <p className="text-[8px] text-gray-400 font-black uppercase mr-1 mt-1 tracking-widest">Preço Sugerido</p>
                      </div>
                      <button 
                        onClick={() => onTogglePartBudget(part.id)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-gray-100 pt-6">
              <div className="flex flex-col sm:flex-row justify-between items-center bg-brand-primary text-white p-6 rounded-[2rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                   <ShoppingCart size={120} />
                </div>
                <div className="mb-4 sm:mb-0 text-center sm:text-left relative z-10">
                  <p className="text-[10px] text-white/50 font-black uppercase tracking-[2px] mb-1">Total Estimado</p>
                  <h3 className="text-4xl font-mono font-black tracking-tighter text-brand-accent">
                    R$ {totalEstimated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </h3>
                </div>
                <button 
                  onClick={() => {
                      alert('Recurso em desenvolvimento: Exportação de PDF/Relatório de Orçamento.');
                  }}
                  className="bg-brand-accent hover:bg-yellow-500 text-brand-primary px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 shadow-xl shadow-brand-accent/20 relative z-10"
                >
                  <Download size={18} /> Salvar PDF
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
