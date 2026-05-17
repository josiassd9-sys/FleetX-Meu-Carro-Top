
import React from 'react';
import { motion } from 'motion/react';
import { Activity, Database, ShieldCheck, RefreshCw } from 'lucide-react';
import Markdown from 'react-markdown';
import { Vehicle } from '../../types';

interface AuditTabProps {
  vehicle: Vehicle;
  digitalPassport: string | null;
  onGeneratePassport: () => void;
  isGeneratingPassport: boolean;
  healthScore: number;
}

export const AuditTab: React.FC<AuditTabProps> = ({
  vehicle,
  digitalPassport,
  onGeneratePassport,
  isGeneratingPassport,
  healthScore
}) => {
  const allLogs = [
    ...(vehicle.fuelLogs || []), 
    ...(vehicle.services || [])
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8 text-left">
      <div>
        <h3 className="text-xl font-black italic uppercase tracking-tighter text-brand-primary flex items-center gap-2 mb-2">
          <ShieldCheck size={24} className="text-brand-accent" /> Auditoria de Procedência
        </h3>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Verificação técnica de histórico e integridade do dossiê</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Card de Resumo Técnico */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm relative overflow-hidden group">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-brand-primary p-4 rounded-2xl text-white shadow-xl shadow-brand-primary/20 transition-transform group-hover:rotate-12">
              <Activity size={24} />
            </div>
            <div>
              <h4 className="text-2xl font-black italic uppercase tracking-tighter text-brand-primary">Dossiê Técnico Pro</h4>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Visão Profissional do Ativo</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
             <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-50 transition-all hover:bg-white hover:shadow-md hover:border-gray-100">
                <p className="text-[9px] text-gray-400 font-black uppercase mb-1.5 tracking-widest">Motorização</p>
                <p className="text-sm font-black text-brand-primary uppercase italic">{vehicle.engine || 'N/A'}</p>
             </div>
             <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-50 transition-all hover:bg-white hover:shadow-md hover:border-gray-100">
                <p className="text-[9px] text-gray-400 font-black uppercase mb-1.5 tracking-widest">Versão / Série</p>
                <p className="text-sm font-black text-brand-primary uppercase italic">{vehicle.version || 'N/A'}</p>
             </div>
             <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-50 transition-all hover:bg-white hover:shadow-md hover:border-gray-100">
                <p className="text-[9px] text-gray-400 font-black uppercase mb-1.5 tracking-widest">Chassi / VIN</p>
                <p className="text-xs font-mono font-black text-brand-primary">{vehicle.chassis || 'NÃO INFORMADO'}</p>
             </div>
             <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-50 transition-all hover:bg-white hover:shadow-md hover:border-gray-100">
                <p className="text-[9px] text-gray-400 font-black uppercase mb-1.5 tracking-widest">Perfil de Uso</p>
                <div className="flex items-center gap-1.5">
                   <div className={`w-1.5 h-1.5 rounded-full ${vehicle.usageProfile === 'urban' ? 'bg-red-500' : vehicle.usageProfile === 'highway' ? 'bg-green-500' : 'bg-brand-accent'}`} />
                   <p className="text-sm font-black text-gray-700 uppercase italic">
                    {vehicle.usageProfile === 'urban' ? 'Uso Severo' : vehicle.usageProfile === 'highway' ? 'Uso Leve' : 'Misto'}
                  </p>
                </div>
             </div>
             <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-50 transition-all hover:bg-white hover:shadow-md hover:border-gray-100">
                <p className="text-[9px] text-gray-400 font-black uppercase mb-1.5 tracking-widest">KM Diário Est.</p>
                <p className="text-sm font-black text-brand-primary">{vehicle.avgDailyKm || '--'} <span className="text-[10px] text-gray-400 font-bold">KM/DIA</span></p>
             </div>
             <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-50 transition-all hover:bg-white hover:shadow-md hover:border-gray-100">
                <p className="text-[9px] text-gray-400 font-black uppercase mb-1.5 tracking-widest">Saúde Ativa</p>
                <div className="flex items-baseline gap-1">
                   <p className={`text-2xl font-black ${healthScore > 80 ? 'text-green-500' : healthScore > 50 ? 'text-brand-accent' : 'text-red-500'}`}>{Math.round(healthScore)}</p>
                   <span className="text-[8px] font-black uppercase text-gray-300">% IA</span>
                </div>
             </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={14} className="text-brand-primary" />
                <h5 className="font-black text-xs uppercase text-brand-primary tracking-widest">Certificação de Procedência IA</h5>
             </div>
             <div className={`bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100 relative ${isGeneratingPassport ? 'animate-pulse' : ''}`}>
                <div className="markdown-body text-sm leading-relaxed text-gray-600">
                  {digitalPassport ? (
                    <Markdown>{digitalPassport}</Markdown>
                  ) : (
                    <div className="text-center py-10 space-y-4">
                        <p className="text-gray-400 font-bold italic">O dossiê de auditoria ainda não foi consolidado pelo motor de IA.</p>
                        <button 
                          onClick={onGeneratePassport}
                          disabled={isGeneratingPassport}
                          className="flex items-center gap-2 text-brand-primary font-black uppercase tracking-[2px] text-[10px] hover:text-brand-accent transition-all mx-auto bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-100"
                        >
                          {isGeneratingPassport ? <RefreshCw className="animate-spin" size={14} /> : <RefreshCw size={14} />} 
                          Gerar Auditoria de Procedência
                        </button>
                    </div>
                  )}
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
             </div>
          </div>
        </div>

        {/* Sidebar de Logs de Sistema */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm flex flex-col h-full">
            <h4 className="font-black text-[10px] uppercase text-gray-400 mb-6 flex items-center gap-3 tracking-[2px]">
              <Database size={16} className="text-brand-primary" /> Histórico de Odômetro
            </h4>
            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {allLogs.length > 0 ? (
                allLogs.map((log, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 hover:bg-gray-50 transition-all group"
                  >
                     <div className="text-left">
                        <p className="text-xs font-black text-gray-700 tracking-tight group-hover:text-brand-primary transition-colors">{log.mileage.toLocaleString()} KM</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{new Date(log.date).toLocaleDateString('pt-BR')}</p>
                     </div>
                     <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg border ${'liters' in log ? 'bg-amber-50 text-amber-600 border-amber-100 shadow-sm shadow-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100 shadow-sm shadow-blue-100'}`}>
                       {'liters' in log ? 'Comb.' : 'Serv.'}
                     </span>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-20 opacity-50">
                    <Database size={32} className="mx-auto mb-2 text-gray-200" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 italic">Sem logs registrados para auditoria.</p>
                </div>
              )}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100">
               <div className="bg-brand-primary/5 p-4 rounded-2xl border border-brand-primary/10">
                  <p className="text-[9px] text-brand-primary font-black uppercase tracking-widest mb-1">Dica Pro</p>
                  <p className="text-[10px] text-gray-500 font-bold leading-relaxed italic opacity-80">"Registros frequentes aumentam a confiança da IA e valorizam o ativo."</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
