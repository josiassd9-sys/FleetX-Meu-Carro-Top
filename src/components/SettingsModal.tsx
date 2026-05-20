
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings, Palette, Search, Plus, Trash2, Shield, Globe, Database, BookOpen, Key, ExternalLink } from 'lucide-react';
import { AppData, VehicleSearchLink } from '../types';
import { THEMES } from '../constants';
import { AppManual } from './AppManual';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AppData;
  onUpdateSettings: (settings: AppData['settings']) => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  data,
  onUpdateSettings,
  onResetData
}) => {
  const [activeSubTab, setActiveSubTab] = React.useState<'general' | 'theme' | 'search' | 'privacy' | 'manual' | 'apiKey'>('general');

  if (!data?.settings) return null;

  const updateSettings = (updates: Partial<AppData['settings']>) => {
    onUpdateSettings({ ...data.settings, ...updates });
  };

  const addSearchLink = () => {
    const newLinks = [
      ...(data.settings.searchLinks || []),
      { id: Date.now().toString(), name: 'Nova Busca', url: 'https://...', color: 'brand' }
    ];
    updateSettings({ searchLinks: newLinks });
  };

  const removeSearchLink = (id: string) => {
    updateSettings({
      searchLinks: (data.settings.searchLinks || []).filter(l => l.id !== id)
    });
  };

  const updateSearchLink = (id: string, updates: Partial<VehicleSearchLink>) => {
    updateSettings({
      searchLinks: (data.settings.searchLinks || []).map(l => l.id === id ? { ...l, ...updates } : l)
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/80 backdrop-blur-md"
          />
            <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-white rounded-[2rem] sm:rounded-[2.5rem] w-full max-w-4xl shadow-2xl flex flex-col h-[90vh] sm:h-[85vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 sm:p-8 border-b border-gray-100 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-3 sm:gap-4 text-left">
                  <div className="bg-brand-primary p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-white shadow-xl shadow-brand-primary/20 shrink-0">
                    <Settings size={20} className="sm:w-[22px] sm:h-[22px]" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-2xl font-black italic uppercase tracking-tighter text-brand-primary leading-none">Configurações</h2>
                    <p className="text-[8px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Personalize sua experiência</p>
                  </div>
               </div>
               <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0">
                 <X size={20} className="sm:w-6 sm:h-6" />
               </button>
            </div>

            <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
               {/* Sidebar Tabs - Horizontal scroll on mobile, Vertical on desktop */}
               <div className="w-full sm:w-64 bg-gray-50/50 border-b sm:border-b-0 sm:border-r border-gray-100 p-2 sm:p-6 flex flex-row sm:flex-col gap-1 sm:gap-2 shrink-0 overflow-x-auto sm:overflow-y-auto no-scrollbar">
                  <button 
                    onClick={() => setActiveSubTab('general')}
                    className={`flex items-center gap-2 sm:gap-3 px-4 py-3 sm:p-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap sm:whitespace-normal flex-1 sm:flex-none justify-center sm:justify-start ${activeSubTab === 'general' ? 'bg-white text-brand-primary shadow-md sm:shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Globe size={14} className="sm:w-4 sm:h-4" /> Regional
                  </button>
                  <button 
                    onClick={() => setActiveSubTab('theme')}
                    className={`flex items-center gap-2 sm:gap-3 px-4 py-3 sm:p-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap sm:whitespace-normal flex-1 sm:flex-none justify-center sm:justify-start ${activeSubTab === 'theme' ? 'bg-white text-brand-primary shadow-md sm:shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Palette size={14} className="sm:w-4 sm:h-4" /> Estilo
                  </button>
                  <button 
                    onClick={() => setActiveSubTab('search')}
                    className={`flex items-center gap-2 sm:gap-3 px-4 py-3 sm:p-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap sm:whitespace-normal flex-1 sm:flex-none justify-center sm:justify-start ${activeSubTab === 'search' ? 'bg-white text-brand-primary shadow-md sm:shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Search size={14} className="sm:w-4 sm:h-4" /> Robô
                  </button>
                  <button 
                    onClick={() => setActiveSubTab('privacy')}
                    className={`flex items-center gap-2 sm:gap-3 px-4 py-3 sm:p-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap sm:whitespace-normal flex-1 sm:flex-none justify-center sm:justify-start ${activeSubTab === 'privacy' ? 'bg-white text-brand-primary shadow-md sm:shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Shield size={14} className="sm:w-4 sm:h-4" /> Dados
                  </button>
                  <button 
                    onClick={() => setActiveSubTab('apiKey')}
                    className={`flex items-center gap-2 sm:gap-3 px-4 py-3 sm:p-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap sm:whitespace-normal flex-1 sm:flex-none justify-center sm:justify-start ${activeSubTab === 'apiKey' ? 'bg-white text-brand-primary shadow-md sm:shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Key size={14} className="sm:w-4 sm:h-4" /> Chave API
                  </button>
                  <button 
                    onClick={() => setActiveSubTab('manual')}
                    className={`flex items-center gap-2 sm:gap-3 px-4 py-3 sm:p-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap sm:whitespace-normal flex-1 sm:flex-none justify-center sm:justify-start ${activeSubTab === 'manual' ? 'bg-white text-brand-primary shadow-md sm:shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <BookOpen size={14} className="sm:w-4 sm:h-4" /> Manual
                  </button>

                  <div className="hidden sm:flex mt-auto pt-6 border-t border-gray-100">
                     <button 
                       onClick={onResetData}
                       className="w-full flex items-center gap-3 p-4 rounded-2xl text-[9px] font-black uppercase tracking-widest text-red-400 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                     >
                       <Trash2 size={16} /> Resetar Dados
                     </button>
                  </div>
               </div>

               {/* Content Area */}
               <div className="flex-1 overflow-y-auto p-5 sm:p-10 custom-scrollbar">
                  {activeSubTab === 'general' && (
                    <div className="space-y-8">
                       <div>
                         <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 block">Nome da Agência / Usuário</label>
                         <input 
                           type="text" 
                           className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 font-bold text-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all"
                           value={data.settings.agencyName || ''}
                           onChange={(e) => updateSettings({ agencyName: e.target.value })}
                         />
                       </div>

                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                          <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 block text-left">Região do Usuário</label>
                            <input 
                              type="text" 
                              placeholder="Brasil"
                              className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 font-bold"
                              value={data.settings.region || ''}
                              onChange={(e) => updateSettings({ region: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 block text-left">Moeda Principal</label>
                            <input 
                              type="text" 
                              placeholder="BRL"
                              className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 font-bold"
                              value={data.settings.currency || ''}
                              onChange={(e) => updateSettings({ currency: e.target.value as any })}
                            />
                          </div>
                       </div>

                       <div>
                         <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 block">Referência de Mercado (Ex: FIPE, KBB, Webb)</label>
                         <input 
                           type="text" 
                           className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 font-bold"
                           value={data.settings.marketReferenceName || ''}
                           onChange={(e) => updateSettings({ marketReferenceName: e.target.value })}
                         />
                       </div>

                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                          <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 block text-left">Rótulo do Identificador</label>
                            <input 
                              type="text" 
                              className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 font-bold text-sm"
                              value={data.settings.vehicleIdentifierLabel || ''}
                              onChange={(e) => updateSettings({ vehicleIdentifierLabel: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 block text-left">Placeholder</label>
                            <input 
                              type="text" 
                              className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 font-bold text-sm"
                              value={data.settings.vehicleIdentifierPlaceholder || ''}
                              onChange={(e) => updateSettings({ vehicleIdentifierPlaceholder: e.target.value })}
                            />
                          </div>
                       </div>
                       
                       <div className="sm:hidden pt-8 mt-8 border-t border-gray-100">
                          <button 
                            onClick={onResetData}
                            className="w-full flex items-center justify-center gap-3 p-5 rounded-2xl text-xs font-black uppercase tracking-widest text-red-500 bg-red-50 transition-all border border-red-100 active:scale-95"
                          >
                            <Trash2 size={18} /> Resetar Todo o Sistema
                          </button>
                       </div>
                    </div>
                  )}

                  {activeSubTab === 'theme' && (
                    <div className="space-y-8">
                       <div>
                         <h3 className="text-sm font-black uppercase tracking-widest text-brand-primary mb-4">Paleta de Cores do Sistema</h3>
                         <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {Object.values(THEMES).map(theme => (
                              <button
                                key={theme.id}
                                onClick={() => updateSettings({ theme: theme.id as any })}
                                className={`group relative p-4 rounded-3xl border-2 transition-all text-left overflow-hidden ${data.settings.theme === theme.id ? 'border-brand-primary bg-brand-primary/5 shadow-xl' : 'border-gray-50 hover:bg-gray-50'}`}
                              >
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-xl shadow-lg" style={{ backgroundColor: theme.primary }} />
                                   <div>
                                      <p className={`text-[10px] font-black uppercase tracking-tighter ${data.settings.theme === theme.id ? 'text-brand-primary' : 'text-gray-400'}`}>{theme.name}</p>
                                      <p className="text-[8px] font-bold text-gray-400">{theme.id === 'default' ? 'Modo Esportivo' : 'Minimalist'}</p>
                                   </div>
                                </div>
                                {data.settings.theme === theme.id && (
                                  <div className="absolute -right-2 -bottom-2 bg-brand-primary text-white p-1 rounded-tl-xl">
                                    <Shield size={10} />
                                  </div>
                                )}
                              </button>
                            ))}
                         </div>
                       </div>
                    </div>
                  )}

                  {activeSubTab === 'search' && (
                    <div className="space-y-6 text-left">
                       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                          <h3 className="text-[11px] sm:text-sm font-black uppercase tracking-widest text-brand-primary">Atalhos de Consulta do Robô</h3>
                          <button 
                            onClick={addSearchLink}
                            className="bg-brand-primary text-white w-full sm:w-auto px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-accent transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 active:scale-95"
                          >
                            <Plus size={16} /> Adicionar Link
                          </button>
                       </div>

                       <div className="grid gap-4">
                          {(data.settings.searchLinks || []).map((link) => (
                            <div key={link.id} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center group">
                               <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                  <input 
                                    type="text" 
                                    className="bg-white border-gray-100 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-brand-primary focus:outline-none"
                                    value={link.name}
                                    placeholder="Nome do Portal"
                                    onChange={(e) => updateSearchLink(link.id, { name: e.target.value })}
                                  />
                                  <input 
                                    type="text" 
                                    className="bg-white border-gray-100 rounded-xl px-4 py-3 text-[10px] font-mono focus:ring-2 focus:ring-brand-primary focus:outline-none"
                                    value={link.url}
                                    placeholder="URL com {placa}"
                                    onChange={(e) => updateSearchLink(link.id, { url: e.target.value })}
                                  />
                               </div>
                               <div className="flex items-center gap-2 shrink-0">
                                  <input 
                                    type="color" 
                                    className="w-10 h-10 rounded-xl p-0.5 bg-white border border-gray-100 cursor-pointer"
                                    value={link.color === 'brand' ? '#FBFF00' : link.color}
                                    onChange={(e) => updateSearchLink(link.id, { color: e.target.value })}
                                  />
                                  <button 
                                    onClick={() => removeSearchLink(link.id)}
                                    className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                  )}

                  {activeSubTab === 'privacy' && (
                    <div className="space-y-8 text-left">
                       <div className="bg-blue-50/50 border border-blue-100 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform">
                             <Database size={80} className="sm:w-[100px] sm:h-[100px]" />
                          </div>
                          <div className="relative z-10">
                            <h3 className="text-lg sm:text-xl font-black text-brand-primary tracking-tight mb-4">Persistência de Dados Local</h3>
                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-bold mb-6 italic opacity-80">
                              "Seus dados são armazenados exclusivamente neste navegador. <br className="hidden sm:block"/>
                              Nada sai do seu dispositivo sem o seu comando."
                            </p>
                            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                               <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                  <span className="text-[8px] sm:text-[10px] font-black uppercase text-gray-400 tracking-widest whitespace-nowrap">Ativo</span>
                               </div>
                               <div className="flex items-center gap-2">
                                  <Shield size={12} className="text-blue-500 sm:w-[14px] sm:h-[14px]" />
                                  <span className="text-[8px] sm:text-[10px] font-black uppercase text-gray-400 tracking-widest whitespace-nowrap">Encriptado</span>
                               </div>
                            </div>
                          </div>
                       </div>
                    </div>
                  )}

                  {activeSubTab === 'apiKey' && (
                    <div className="space-y-8 text-left h-full flex flex-col">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-brand-primary mb-4">Configuração de Inteligência Artificial</h3>
                        <p className="text-xs text-gray-500 font-bold mb-6">Insira sua Chave API do Gemini para habilitar funções de análise de manutenção, leitura de manuais e diagnósticos automotivos.</p>
                        
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-primary transition-colors">
                            <Key size={18} />
                          </div>
                          <input 
                            type="password" 
                            placeholder="Insira sua Chave API aqui..."
                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 font-mono text-sm focus:bg-white focus:border-brand-primary outline-none transition-all"
                            value={data.settings.geminiApiKey || ''}
                            onChange={(e) => updateSettings({ geminiApiKey: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col border-2 border-dashed border-gray-200 rounded-[2rem] overflow-hidden min-h-[400px]">
                        <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-brand-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Google AI Studio (Gerador de Chaves)</span>
                          </div>
                          <a 
                            href="https://aistudio.google.com/app/apikey" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] font-black uppercase tracking-widest text-brand-primary hover:underline flex items-center gap-1"
                          >
                            Abrir Externo <ExternalLink size={10} />
                          </a>
                        </div>
                        <iframe 
                          src="https://aistudio.google.com/app/apikey" 
                          className="flex-1 w-full border-none"
                          title="Google AI Studio"
                          sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
                        />
                      </div>
                    </div>
                  )}

                  {activeSubTab === 'manual' && (
                    <div className="space-y-6 text-left">
                      <div className="flex flex-col gap-1 mb-6">
                        <h3 className="text-lg sm:text-xl font-black italic uppercase tracking-tighter text-brand-primary leading-none">Manual FleetX</h3>
                        <p className="text-[9px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">Domine todas as ferramentas</p>
                      </div>
                      <AppManual />
                    </div>
                  )}
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
