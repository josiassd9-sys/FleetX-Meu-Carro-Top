
import React from 'react';
import { motion } from 'motion/react';
import { Globe } from 'lucide-react';
import { AppData } from '../types';

interface OnboardingModalProps {
  data: AppData;
  isDetectingRegion: boolean;
  onClose: () => void;
  getCurrencySymbol: () => string;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  data,
  isDetectingRegion,
  onClose,
  getCurrencySymbol
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/90 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="bg-white w-full max-w-md rounded-3xl p-8 text-center space-y-6 shadow-2xl overflow-hidden relative"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-brand-primary" />
        
        <div className="w-20 h-20 bg-brand-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-2">
          <Globe className="text-brand-primary animate-pulse" size={40} />
        </div>

        <div>
          <h2 className="text-2xl font-black text-gray-900">Regionalização IA</h2>
          <p className="text-gray-500 text-sm mt-2">
            O aplicativo está detectando sua localização para configurar moeda, unidades e referências locais automaticamente.
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 space-y-4 text-left">
          {isDetectingRegion ? (
            <div className="flex flex-col items-center py-4 space-y-3">
              <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase text-brand-primary animate-pulse">Sincronizando com satélites...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-gray-400">Local Detectado</p>
                  <p className="text-sm font-bold text-gray-900">{data.settings?.region || 'Detectando...'}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-black uppercase text-gray-400">Moeda Local</p>
                  <p className="text-sm font-bold text-gray-900">{data.settings?.currency} ({getCurrencySymbol()})</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-gray-400">Ref. de Mercado</p>
                  <p className="text-sm font-bold text-gray-900">{data.settings?.marketReferenceName}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-black uppercase text-gray-400">Unidade Distância</p>
                  <p className="text-sm font-bold text-gray-900">{data.settings?.distanceUnit}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          disabled={isDetectingRegion}
          className={`w-full p-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-lg ${
            isDetectingRegion 
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
            : 'bg-brand-primary text-white hover:bg-brand-primary/90 active:scale-95'
          }`}
        >
          Começar Agora
        </button>
      </motion.div>
    </div>
  );
};
