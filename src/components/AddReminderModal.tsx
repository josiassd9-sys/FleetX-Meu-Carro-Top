import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface AddReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  newReminder: { title: string; targetMileage: string; targetDate: string; type: string };
  setNewReminder: React.Dispatch<React.SetStateAction<any>>;
  onAddReminder: () => void;
}

export const AddReminderModal = ({ isOpen, onClose, newReminder, setNewReminder, onAddReminder }: AddReminderModalProps) => {
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
            <h2 className="text-2xl font-bold mb-6 italic uppercase tracking-tighter text-brand-primary">Novo Lembrete</h2>
            <div className="space-y-4 mb-8">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Título do Lembrete</label>
                <input 
                  type="text" 
                  placeholder="Ex: Substituição das Pastilhas" 
                  className="w-full bg-gray-50 border-0 rounded-xl p-4 focus:ring-2 focus:ring-brand-accent font-bold" 
                  value={newReminder.title} 
                  onChange={e => setNewReminder({...newReminder, title: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Km Alvo (Opcional)</label>
                  <input 
                    type="number" 
                    className="w-full bg-gray-50 border-0 rounded-xl p-4 font-mono focus:ring-2 focus:ring-brand-accent" 
                    value={newReminder.targetMileage} 
                    onChange={e => setNewReminder({...newReminder, targetMileage: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Data Alvo (Opcional)</label>
                  <input 
                    type="date" 
                    className="w-full bg-gray-50 border-0 rounded-xl p-4 focus:ring-2 focus:ring-brand-accent" 
                    value={newReminder.targetDate} 
                    onChange={e => setNewReminder({...newReminder, targetDate: e.target.value})} 
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Tipo de Manutenção</label>
                <select 
                  className="w-full bg-gray-50 border-0 rounded-xl p-4 focus:ring-2 focus:ring-brand-accent font-bold" 
                  value={newReminder.type} 
                  onChange={e => setNewReminder({...newReminder, type: e.target.value as any})}
                >
                  <option value="oil">Troca de Óleo</option>
                  <option value="filter">Filtros</option>
                  <option value="tire">Pneus / Alinhamento</option>
                  <option value="brake">Freios</option>
                  <option value="other">Outros</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={onClose} 
                className="flex-1 py-4 font-bold text-gray-400 hover:text-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={onAddReminder} 
                className="flex-2 py-4 bg-brand-primary text-white rounded font-bold shadow-lg hover:bg-brand-accent transition-all"
              >
                Criar Alerta
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
