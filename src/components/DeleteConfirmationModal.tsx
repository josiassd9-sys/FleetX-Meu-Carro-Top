
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/80 backdrop-blur-md"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl text-center space-y-6"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
            >
              <X size={20} />
            </button>

            <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto shadow-sm">
              <div className="relative">
                <Trash2 size={40} className="text-red-500" />
                <AlertTriangle size={16} className="absolute -top-1 -right-1 text-red-600 animate-pulse" />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-black italic uppercase tracking-tighter text-gray-900">{title}</h2>
              <p className="text-sm text-gray-500 font-bold mt-2 leading-relaxed opacity-80">{message}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={onClose}
                className="py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-gray-500 hover:bg-gray-50 border border-gray-100 transition-all"
              >
                Manter
              </button>
              <button
                onClick={onConfirm}
                className="py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/20 transition-all active:scale-95"
              >
                Confirmar Exclusão
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
