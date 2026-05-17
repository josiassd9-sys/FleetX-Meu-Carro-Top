import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Database, Book, Search } from 'lucide-react';

interface AddPartModalProps {
  isOpen: boolean;
  onClose: () => void;
  newPartName: string;
  setNewPartName: React.Dispatch<React.SetStateAction<string>>;
  aiSuggestions: string[];
  setAiSuggestions: React.Dispatch<React.SetStateAction<string[]>>;
  isResearching: boolean;
  onAddPart: (suggestion?: string) => void;
  onOpenDictionary: () => void;
}

export const AddPartModal = ({
  isOpen,
  onClose,
  newPartName,
  setNewPartName,
  aiSuggestions,
  setAiSuggestions,
  isResearching,
  onAddPart,
  onOpenDictionary
}: AddPartModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isResearching && onClose()}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl overflow-hidden"
          >
            {isResearching && (
                <div className="absolute inset-0 z-20 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="mb-6 text-brand-accent"
                  >
                    <Settings size={64} />
                  </motion.div>
                  <h3 className="text-2xl font-black mb-2 text-brand-primary">IA Pesquisando Peça...</h3>
                  <p className="text-gray-500 max-w-xs">Buscando códigos oficiais e especificações técnicas para seu veículo.</p>
                </div>
            )}

            <div className="flex items-center gap-3 mb-8">
              <div className="bg-brand-accent/10 p-2 rounded-lg text-brand-accent">
                <Database size={24} />
              </div>
              <h2 className="text-2xl font-bold text-brand-primary">Adicionar Peça ao Catálogo</h2>
            </div>
            
            <div className="space-y-6 mb-8">
              {aiSuggestions.length > 0 ? (
                <div>
                  <p className="text-sm font-bold text-brand-accent mb-4">Múltiplas opções encontradas. Qual você deseja catalogar?</p>
                  <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2">
                     {aiSuggestions.map((suggestion) => (
                       <button
                         key={suggestion}
                         onClick={() => onAddPart(suggestion)}
                         className="text-left bg-gray-50 hover:bg-brand-accent hover:text-white p-4 rounded-xl border border-gray-100 transition-all font-bold text-sm"
                       >
                          {suggestion}
                       </button>
                     ))}
                  </div>
                  <button 
                    onClick={() => setAiSuggestions([])}
                    className="text-xs text-gray-400 mt-4 underline"
                  >
                    Voltar para busca manual
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Informe o nome da peça. A nossa Inteligência Artificial irá preencher os detalhes técnicos, vida útil e códigos oficiais de fábrica.
                  </p>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1 ml-1">
                      <label className="text-xs font-bold text-gray-400 uppercase">Nome ou Descrição</label>
                      <button 
                        onClick={onOpenDictionary}
                        className="text-[10px] font-bold text-brand-accent flex items-center gap-1 hover:underline underline-offset-2"
                        type="button"
                      >
                        <Book size={10} /> Sugestão de Peças
                      </button>
                    </div>
                    <input 
                      type="text" 
                      autoFocus
                      placeholder="Ex: Correia Dentada"
                      className="w-full bg-gray-50 border-0 rounded-xl p-4 focus:ring-2 focus:ring-brand-accent transition-all text-lg font-medium"
                      value={newPartName}
                      onChange={(e) => setNewPartName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && onAddPart()}
                    />
                  </div>
                </>
              )}
            </div>

            {aiSuggestions.length === 0 && (
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    onClose();
                    setAiSuggestions([]);
                  }}
                  className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-all"
                  disabled={isResearching}
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => onAddPart()}
                  disabled={!newPartName || isResearching}
                  className="flex-2 py-4 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-accent disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Search size={18} /> Pesquisar com IA
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
