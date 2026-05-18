import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Gauge, Calendar, Disc, AlertCircle, CheckCircle2, Activity, Sparkles, Shield, Zap, Info, Loader2, RefreshCw } from 'lucide-react';
import { TireSet } from '../../types';
import { cn } from '../../lib/utils';
import { geminiService } from '../../services/geminiService';

interface TiresTabProps {
  tireSets: TireSet[];
  currentMileage: number;
  usageProfile: string;
  onAddTire: (tire: Omit<TireSet, 'id' | 'status'>) => void;
  onDeleteTire: (id: string) => void;
  onUpdateTire: (id: string, updates: Partial<TireSet>) => void;
}

export const TiresTab: React.FC<TiresTabProps> = ({ 
  tireSets, 
  currentMileage, 
  usageProfile,
  onAddTire, 
  onDeleteTire,
  onUpdateTire
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [newTire, setNewTire] = useState({
    brand: '',
    model: '',
    size: '',
    installationDate: new Date().toISOString().split('T')[0],
    installationMileage: currentMileage,
    expectedLifeMileage: 50000,
    position: 'all' as any,
    notes: ''
  });

  const getUsagePercentage = (tire: TireSet) => {
    const driven = currentMileage - tire.installationMileage;
    const percentage = (driven / tire.expectedLifeMileage) * 100;
    return Math.min(Math.max(percentage, 0), 100);
  };

  const getRemainingKm = (tire: TireSet) => {
    const driven = currentMileage - tire.installationMileage;
    return Math.max(tire.expectedLifeMileage - driven, 0);
  };

  const getStatusColor = (percentage: number) => {
    if (percentage > 90) return 'text-red-500';
    if (percentage > 75) return 'text-amber-500';
    return 'text-green-500';
  };

  const getBgStatusColor = (percentage: number) => {
    if (percentage > 90) return 'bg-red-500';
    if (percentage > 75) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTire(newTire);
    setIsAdding(false);
    // Reset form
    setNewTire({
      brand: '',
      model: '',
      size: '',
      installationDate: new Date().toISOString().split('T')[0],
      installationMileage: currentMileage,
      expectedLifeMileage: 50000,
      position: 'all' as any,
      notes: ''
    });
  };

  const handleAnalyzeAI = async (tire: TireSet) => {
    setAnalyzingId(tire.id);
    try {
      const insights = await geminiService.analyzeTireProfile(tire.brand, tire.model, usageProfile);
      if (insights) {
        onUpdateTire(tire.id, { aiInsights: insights });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center text-brand-primary">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Disc size={22} className="text-brand-accent" /> Gestão de Pneus
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-brand-primary text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-brand-accent transition-all flex items-center gap-2 shadow-sm"
          >
            {isAdding ? 'Cancelar' : <><Plus size={14} /> Registrar Troca</>}
          </button>
        </div>
      </div>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl"
        >
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Marca</label>
              <input 
                required
                className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-brand-accent focus:bg-white outline-none transition-all"
                value={newTire.brand}
                onChange={e => setNewTire({...newTire, brand: e.target.value})}
                placeholder="Ex: Michelin, Pirelli..."
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Modelo</label>
              <input 
                required
                className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-brand-accent focus:bg-white outline-none transition-all"
                value={newTire.model}
                onChange={e => setNewTire({...newTire, model: e.target.value})}
                placeholder="Ex: Primacy 4, P1..."
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Data da Troca</label>
              <input 
                type="date"
                required
                className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-brand-accent focus:bg-white outline-none transition-all"
                value={newTire.installationDate}
                onChange={e => setNewTire({...newTire, installationDate: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Km na Troca</label>
              <input 
                type="number"
                required
                className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-brand-accent focus:bg-white outline-none transition-all"
                value={newTire.installationMileage}
                onChange={e => setNewTire({...newTire, installationMileage: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Vida Útil Estimada (km)</label>
              <input 
                type="number"
                required
                className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-brand-accent focus:bg-white outline-none transition-all"
                value={newTire.expectedLifeMileage}
                onChange={e => setNewTire({...newTire, expectedLifeMileage: Number(e.target.value)})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Posição</label>
              <select 
                className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-brand-accent focus:bg-white outline-none transition-all"
                value={newTire.position}
                onChange={e => setNewTire({...newTire, position: e.target.value as any})}
              >
                <option value="all">Todos (Jogo)</option>
                <option value="front">Dianteiros</option>
                <option value="rear">Traseiros</option>
                <option value="spare">Estepe</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Notas Adicionais</label>
              <textarea 
                className="w-full bg-gray-50 border-gray-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-brand-accent focus:bg-white outline-none transition-all"
                rows={2}
                value={newTire.notes}
                onChange={e => setNewTire({...newTire, notes: e.target.value})}
                placeholder="Alinhamento feito, cambagem, etc..."
              />
            </div>
            <button 
              type="submit"
              className="md:col-span-2 bg-brand-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-brand-accent transition-all shadow-lg active:scale-[0.98]"
            >
              Confirmar Registro de Pneus
            </button>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {tireSets.length === 0 ? (
          <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-200">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Disc size={40} className="text-gray-300" />
            </div>
            <h4 className="text-lg font-black text-gray-900 tracking-tight">Nenhum registro de pneus</h4>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Clique no botão acima para registrar uma troca.</p>
          </div>
        ) : (
          tireSets.map((tire) => {
            const usage = getUsagePercentage(tire);
            const remaining = getRemainingKm(tire);
            const statusColor = getStatusColor(usage);
            const bgStatusColor = getBgStatusColor(usage);

            return (
              <motion.div
                layout
                key={tire.id}
                className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden relative"
              >
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner", usage > 90 ? "bg-red-50 text-red-500" : "bg-brand-primary/5 text-brand-primary")}>
                        <Disc size={32} strokeWidth={2.5} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-xl text-gray-900 leading-tight">{tire.brand} {tire.model}</h4>
                          <span className={cn("text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest", bgStatusColor, "text-white")}>
                            {usage > 90 ? 'Crítico' : usage > 75 ? 'Atenção' : 'Excelente'}
                          </span>
                        </div>
                        <p className="text-[10px] font-black uppercase text-gray-400 mt-1 tracking-widest">
                          {tire.position === 'all' ? 'Jogo Completo' : 
                           tire.position === 'front' ? 'Eixo Dianteiro' : 
                           tire.position === 'rear' ? 'Eixo Traseiro' : 'Estepe'} {tire.size ? ` • ${tire.size}` : ''}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Utilização</p>
                        <p className={cn("text-2xl font-black font-mono leading-none", statusColor)}>{usage.toFixed(0)}%</p>
                      </div>
                      <div className="flex gap-2">
                        {!tire.aiInsights && (
                          <button 
                            onClick={() => handleAnalyzeAI(tire)}
                            disabled={analyzingId === tire.id}
                            className="p-3 bg-brand-primary/5 text-brand-primary hover:bg-brand-primary hover:text-white rounded-xl transition-all shadow-sm flex items-center gap-2"
                            title="Analisar com IA"
                          >
                            {analyzingId === tire.id ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                          </button>
                        )}
                        <button 
                          onClick={() => onDeleteTire(tire.id)}
                          className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar size={12} className="text-gray-400" />
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Instalação</p>
                      </div>
                      <p className="text-sm font-black text-gray-700">{new Date(tire.installationDate).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Gauge size={12} className="text-gray-400" />
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Km Inicial</p>
                      </div>
                      <p className="text-sm font-black font-mono text-gray-700">{tire.installationMileage.toLocaleString()} km</p>
                    </div>
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity size={12} className="text-gray-400" />
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Km Rodados</p>
                      </div>
                      <p className="text-sm font-black font-mono text-gray-700">
                        {(currentMileage - tire.installationMileage).toLocaleString()} km
                      </p>
                    </div>
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 size={12} className="text-gray-400" />
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Expectativa</p>
                      </div>
                      <p className="text-sm font-black font-mono text-gray-700">{tire.expectedLifeMileage.toLocaleString()} km</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                     <div className="h-4 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100 p-1">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${usage}%` }}
                         className={cn("h-full rounded-full transition-colors relative", bgStatusColor)}
                       >
                         <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
                       </motion.div>
                     </div>
                     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-2">
                           <div className={cn("w-2 h-2 rounded-full animate-pulse", bgStatusColor)}></div>
                           <span>{remaining > 0 ? `Restam aprox. ${remaining.toLocaleString()} km` : 'Recomendamos Substituição'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="opacity-50">Score Técnico:</span>
                           <span className={cn("font-black", statusColor)}>{(100 - usage).toFixed(0)} pontos</span>
                        </div>
                     </div>
                  </div>

                  {/* AI Insights Panel */}
                  <AnimatePresence>
                    {tire.aiInsights && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-brand-primary/5 rounded-3xl p-6 border border-brand-primary/10 relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          <Sparkles size={60} />
                        </div>
                        
                        <div className="relative z-10 space-y-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="bg-brand-primary text-white p-1.5 rounded-lg shadow-lg">
                                <Sparkles size={16} />
                              </div>
                              <h5 className="font-black text-brand-primary uppercase tracking-wider text-sm">Análise de Inteligência Artificial</h5>
                            </div>
                            <div className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-full border border-brand-primary/5">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Score Qualidade:</span>
                              <span className="text-sm font-black text-brand-primary">{tire.aiInsights.score}/100</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div>
                                <h6 className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 border-b border-brand-primary/5 pb-1">
                                  <Info size={12} className="text-brand-primary" /> Características Técnicas
                                </h6>
                                <ul className="space-y-2">
                                  {tire.aiInsights.characteristics.map((c, i) => (
                                    <li key={i} className="flex items-start gap-2 text-[11px] font-bold text-gray-700 leading-tight">
                                      <div className="w-1.5 h-1.5 rounded-full bg-brand-primary/20 shrink-0 mt-1"></div>
                                      {c}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h6 className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 border-b border-brand-primary/5 pb-1">
                                  <CheckCircle2 size={12} className="text-green-500" /> Benefícios & Vantagens
                                </h6>
                                <ul className="space-y-2">
                                  {tire.aiInsights.benefits.map((b, i) => (
                                    <li key={i} className="flex items-start gap-2 text-[11px] font-bold text-green-700 leading-tight">
                                      <Zap size={10} className="shrink-0 mt-1" />
                                      {b}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <h6 className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 border-b border-brand-primary/5 pb-1">
                                  <AlertCircle size={12} className="text-red-500" /> Alertas & Riscos
                                </h6>
                                <ul className="space-y-2">
                                  {tire.aiInsights.dangers.map((d, i) => (
                                    <li key={i} className="flex items-start gap-2 text-[11px] font-bold text-red-700 leading-tight">
                                      <div className="w-1.5 h-1.5 rounded-full bg-red-500/20 shrink-0 mt-1"></div>
                                      {d}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="bg-white/60 p-4 rounded-2xl border border-brand-primary/5">
                                <h6 className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                                  <Shield size={12} className="text-brand-primary" /> Durabilidade Estimada
                                </h6>
                                <p className="text-[12px] font-black text-brand-primary leading-tight">{tire.aiInsights.estimatedDurability}</p>
                              </div>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => handleAnalyzeAI(tire)}
                            className="w-full text-[10px] font-black text-brand-primary/50 hover:text-brand-primary uppercase tracking-widest transition-colors flex items-center justify-center gap-2 pt-2 border-t border-brand-primary/5"
                          >
                            {analyzingId === tire.id ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                            Atualizar Análise de IA
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {tire.notes && (
                    <div className="bg-amber-50/30 p-4 rounded-2xl border border-amber-100/50 relative">
                      <div className="absolute -top-3 left-4 bg-amber-100 text-amber-600 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">Observações</div>
                      <p className="text-[11px] text-amber-800 italic font-bold leading-relaxed">{tire.notes}</p>
                    </div>
                  )}
                </div>

                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gray-50/50 rounded-full blur-3xl pointer-events-none opacity-50"></div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
