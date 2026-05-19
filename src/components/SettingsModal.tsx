
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings, Palette, Search, Plus, Trash2, Shield, Globe, Database } from 'lucide-react';
import { AppData, VehicleSearchLink } from '../types';
import { THEMES } from '../constants';

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
  const [activeSubTab, setActiveSubTab] = React.useState<'general' | 'theme' | 'search' | 'privacy'>('general');

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
            className="relative bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl flex flex-col h-[85vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b border-gray-100 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-4">
                  <div className="bg-brand-primary p-3 rounded-2xl text-white shadow-xl shadow-brand-primary/20">
                    <Settings size={22} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-brand-primary leading-none">Configurações Gerais</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Personalize sua experiência de gestão</p>
                  </div>
               </div>
               <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                 <X size={24} />
               </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
               {/* Sidebar Tabs */}
               <div className="w-64 bg-gray-50/50 border-r border-gray-100 p-6 flex flex-col gap-2 shrink-0">
                  <button 
                    onClick={() => setActiveSubTab('general')}
                    className={`flex items-center gap-3 p-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === 'general' ? 'bg-white text-brand-primary shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Globe size={16} /> Regional
                  </button>
                  <button 
                    onClick={() => setActiveSubTab('theme')}
                    className={`flex items-center gap-3 p-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === 'theme' ? 'bg-white text-brand-primary shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Palette size={16} /> Identidade
                  </button>
                  <button 
                    onClick={() => setActiveSubTab('search')}
                    className={`flex items-center gap-3 p-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === 'search' ? 'bg-white text-brand-primary shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Search size={16} /> Robô de Busca
                  </button>
                  <button 
                    onClick={() => setActiveSubTab('privacy')}
                    className={`flex items-center gap-3 p-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === 'privacy' ? 'bg-white text-brand-primary shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Shield size={16} /> Segurança
                  </button>

                  <div className="mt-auto pt-6 border-t border-gray-100">
                     <button 
                       onClick={onResetData}
                       className="w-full flex items-center gap-3 p-4 rounded-2xl text-[9px] font-black uppercase tracking-widest text-red-400 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                     >
                       <Trash2 size={16} /> Resetar Dados
                     </button>
                  </div>
               </div>

               {/* Content Area */}
               <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
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

                       <div className="grid grid-cols-2 gap-8">
                          <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 block">Região do Usuário</label>
                            <input 
                              type="text" 
                              placeholder="Brasil"
                              className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 font-bold"
                              value={data.settings.region || ''}
                              onChange={(e) => updateSettings({ region: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 block">Moeda Principal</label>
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

                       <div className="grid grid-cols-2 gap-8">
                          <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 block">Rótulo do Identificador (Ex: Placa, Matrícula)</label>
                            <input 
                              type="text" 
                              className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 font-bold"
                              value={data.settings.vehicleIdentifierLabel || ''}
                              onChange={(e) => updateSettings({ vehicleIdentifierLabel: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 block">Exemplo/Dica (Placeholder)</label>
                            <input 
                              type="text" 
                              className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 font-bold"
                              value={data.settings.vehicleIdentifierPlaceholder || ''}
                              onChange={(e) => updateSettings({ vehicleIdentifierPlaceholder: e.target.value })}
                            />
                          </div>
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
                    <div className="space-y-6">
                       <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-black uppercase tracking-widest text-brand-primary">Atalhos de Consulta do Robô</h3>
                          <button 
                            onClick={addSearchLink}
                            className="bg-brand-primary text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-brand-accent transition-all flex items-center gap-2"
                          >
                            <Plus size={14} /> Novo Link
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
                    <div className="space-y-8">
                       <div className="bg-blue-50/50 border border-blue-100 p-8 rounded-[2.5rem] relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform">
                             <Database size={100} />
                          </div>
                          <div className="relative z-10">
                            <h3 className="text-xl font-black text-brand-primary tracking-tight mb-4">Persistência de Dados Local</h3>
                            <p className="text-sm text-gray-600 leading-relaxed font-bold mb-6 italic opacity-80">
                              "Seus dados são armazenados exclusivamente neste navegador (Local Storage). <br/>
                              Não enviamos suas informações para nenhum servidor centralizado."
                            </p>
                            <div className="flex items-center gap-6">
                               <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Ativo</span>
                               </div>
                               <div className="flex items-center gap-2">
                                  <Shield size={14} className="text-blue-500" />
                                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Encriptado</span>
                               </div>
                            </div>
                          </div>
                       </div>
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
