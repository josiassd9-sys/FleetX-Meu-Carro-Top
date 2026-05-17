import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface AddFuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  newFuel: { mileage: string; date: string; liters: string; cost: string; fullTank: boolean };
  setNewFuel: React.Dispatch<React.SetStateAction<any>>;
  onAddFuel: () => void;
}

export const AddFuelModal = ({ isOpen, onClose, newFuel, setNewFuel, onAddFuel }: AddFuelModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-brand-primary/40 backdrop-blur-md"
          ></motion.div>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0.9, opacity: 0 }} 
            className="relative bg-white rounded p-8 w-full max-w-md shadow-2xl"
          >
            <h2 className="text-2xl font-bold mb-6 italic uppercase tracking-tighter text-brand-primary">Novo Abastecimento</h2>
            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Km Atual</label>
                  <input 
                    type="number" 
                    className="w-full bg-gray-50 border-0 rounded-xl p-4 font-mono focus:ring-2 focus:ring-brand-accent" 
                    value={newFuel.mileage} 
                    onChange={e => setNewFuel({...newFuel, mileage: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Data</label>
                  <input 
                    type="date" 
                    className="w-full bg-gray-50 border-0 rounded-xl p-4 focus:ring-2 focus:ring-brand-accent" 
                    value={newFuel.date} 
                    onChange={e => setNewFuel({...newFuel, date: e.target.value})} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Litros</label>
                  <input 
                    type="number" 
                    className="w-full bg-gray-50 border-0 rounded-xl p-4 font-mono focus:ring-2 focus:ring-brand-accent" 
                    placeholder="0.00" 
                    value={newFuel.liters} 
                    onChange={e => setNewFuel({...newFuel, liters: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Total Pago (R$)</label>
                  <input 
                    type="number" 
                    className="w-full bg-gray-50 border-0 rounded-xl p-4 font-mono text-brand-accent font-bold focus:ring-2 focus:ring-brand-accent" 
                    value={newFuel.cost} 
                    onChange={e => setNewFuel({...newFuel, cost: e.target.value})} 
                  />
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <input 
                  type="checkbox" 
                  checked={newFuel.fullTank} 
                  onChange={e => setNewFuel({...newFuel, fullTank: e.target.checked})} 
                  className="w-5 h-5 accent-brand-primary" 
                />
                <span className="text-sm font-bold text-gray-600 uppercase tracking-widest">Encheu o Tanque?</span>
              </label>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={onClose} 
                className="flex-1 py-4 font-bold text-gray-400 hover:text-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={onAddFuel} 
                className="flex-2 py-4 bg-brand-primary text-white rounded font-bold shadow-lg hover:bg-brand-accent transition-all"
              >
                Confirmar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
