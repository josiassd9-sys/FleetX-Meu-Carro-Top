
import React from 'react';
import { motion } from 'motion/react';
import { Cpu, Zap, RefreshCw, TrendingUp, ShieldCheck } from 'lucide-react';
import Markdown from 'react-markdown';
import { Vehicle } from '../../types';

interface IntelligenceTabProps {
  vehicle: Vehicle;
  symptomQuery: string;
  setSymptomQuery: (val: string) => void;
  runDiagnosis: () => void;
  isDiagnosing: boolean;
  diagnosisResult: string | null;
  runTCOAnalysis: () => void;
  isAnalyzingTco: boolean;
  tcoAnalysis: string | null;
  createdAt: string;
  fuelAnalytics?: {
    data: any[];
    avgKmL: number;
    avgCostKm: number;
    totalLiters: number;
    totalCost: number;
    distanceTraveled: number;
  };
}

export const IntelligenceTab: React.FC<IntelligenceTabProps> = ({
  vehicle,
  symptomQuery,
  setSymptomQuery,
  runDiagnosis,
  isDiagnosing,
  diagnosisResult,
  runTCOAnalysis,
  isAnalyzingTco,
  tcoAnalysis,
  createdAt,
  fuelAnalytics
}) => {
  const totalFuelCost = fuelAnalytics?.totalCost || (vehicle.fuelLogs || []).reduce((acc, l) => acc + l.cost, 0);
  const totalServiceCost = (vehicle.services || []).reduce((acc, l) => acc + l.cost, 0);
  
  const costPerKm = fuelAnalytics?.avgCostKm || (totalFuelCost / Math.max(1, vehicle.mileage - (vehicle.fuelLogs?.[0]?.mileage || 0)));
  const traveledKm = fuelAnalytics?.distanceTraveled || Math.max(1, vehicle.mileage - (vehicle.fuelLogs?.[0]?.mileage || vehicle.mileage));
  
  const createdDate = new Date(createdAt || new Date());
  const monthsActive = Math.max(1, (new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
  const avgMonthlyExpense = (totalFuelCost + totalServiceCost) / monthsActive;

  return (
    <div className="space-y-8 text-left">
      <div>
        <h3 className="text-xl font-black italic uppercase tracking-tighter text-brand-primary flex items-center gap-2 mb-2">
          <Cpu size={24} className="text-brand-accent" /> Intelligence Hub
        </h3>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">IA aplicada em diagnóstico, finanças e previsibilidade</p>
      </div>

      {/* Diagnostic AI Section */}
      <div className="bg-brand-primary/5 p-8 rounded-[2.5rem] border border-brand-primary/10 shadow-sm overflow-hidden relative">
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="bg-brand-primary p-3 rounded-2xl shadow-xl shadow-brand-primary/20">
            <Cpu size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black text-brand-primary tracking-tight uppercase">Mecânico IA Especialista</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">Diagnóstico por sintomas e perfil de uso</p>
          </div>
        </div>

        <div className="space-y-4 relative z-10">
          <div className="relative group">
            <textarea
              value={symptomQuery}
              onChange={(e) => setSymptomQuery(e.target.value)}
              placeholder="Ex: 'Sinto um tranco metálico quando troco da 2ª para a 3ª marcha' ou 'Barulho de grilo na roda dianteira esquerda'..."
              className="w-full bg-white border border-gray-100 rounded-3xl px-8 py-7 focus:ring-4 focus:ring-brand-primary/10 outline-none text-base font-medium min-h-[160px] shadow-inner transition-all"
            />
            <button
              onClick={runDiagnosis}
              disabled={isDiagnosing || !symptomQuery}
              className="absolute bottom-6 right-6 bg-brand-primary text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-brand-accent hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-brand-primary/20 disabled:opacity-50 disabled:scale-95 flex items-center gap-3 group"
            >
              {isDiagnosing ? <RefreshCw className="animate-spin" size={16} /> : <Zap size={16} className="group-hover:animate-pulse" />}
              Analisar Agora
            </button>
          </div>

          {diagnosisResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-[2rem] border border-brand-primary/10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-primary via-brand-accent to-brand-primary"></div>
              <div className="markdown-body text-sm leading-relaxed">
                <Markdown>{diagnosisResult}</Markdown>
              </div>
            </motion.div>
          )}
        </div>

        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/10 rounded-full blur-[80px] -mr-24 -mt-24 pointer-events-none"></div>
      </div>

      {/* TCO & Efficiency Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase tracking-[2px] text-gray-400">Eficiência Operacional Real</h4>
              <div className="bg-green-100 text-green-600 p-2.5 rounded-xl border border-green-200">
                <TrendingUp size={18} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                <p className="text-[9px] font-black uppercase text-gray-400 mb-2">Custo por KM (Comb.)</p>
                <div className="flex items-baseline gap-1">
                   <span className="text-xs font-bold text-gray-400">R$</span>
                   <p className="text-2xl font-black text-brand-primary tracking-tighter">
                     {costPerKm.toFixed(2)}
                   </p>
                </div>
              </div>
              <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                <p className="text-[9px] font-black uppercase text-gray-400 mb-2">Gasto Médio Mensal</p>
                <div className="flex items-baseline gap-1">
                   <span className="text-xs font-bold text-gray-400">R$</span>
                   <p className="text-2xl font-black text-brand-primary tracking-tighter">
                     {Math.round(avgMonthlyExpense).toLocaleString()}
                   </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 font-bold italic opacity-80 leading-relaxed">
              * Cálculo baseado em {traveledKm.toLocaleString()} KM de telemetria registrada desde o primeiro abastecimento.
            </p>
          </div>

          <div className="pt-4 space-y-4">
             <button 
              onClick={runTCOAnalysis}
              disabled={isAnalyzingTco}
              className="w-full py-5 bg-brand-primary/5 border border-brand-primary/10 text-brand-primary rounded-2xl text-[10px] font-black uppercase tracking-[2px] hover:bg-brand-primary hover:text-white transition-all flex items-center justify-center gap-3"
            >
              {isAnalyzingTco ? <RefreshCw className="animate-spin" size={14} /> : <TrendingUp size={14} />}
              Gerar Estudo de TCO IA
            </button>

            {tcoAnalysis && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 text-[11px] leading-relaxed max-h-[300px] overflow-y-auto custom-scrollbar"
              >
                <div className="markdown-body">
                   <Markdown>{tcoAnalysis}</Markdown>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="bg-brand-primary p-8 rounded-[2.5rem] shadow-2xl shadow-brand-primary/20 text-white space-y-6 relative overflow-hidden flex flex-col justify-between border border-white/5">
          <div className="space-y-6 relative z-10">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase tracking-[2px] text-white/50">Score de Saúde & Conservação</h4>
              <ShieldCheck size={24} className="text-brand-accent" />
            </div>

            <div>
              <div className="flex items-end gap-3 mb-3">
                <span className="text-7xl font-black tracking-tighter text-brand-accent leading-none">{vehicle.healthScore || 85}</span>
                <span className="text-xs font-black uppercase mb-3 tracking-widest text-white/40">Score Geral</span>
              </div>
              <p className="text-xs font-bold leading-relaxed text-white/60 max-w-[280px]">
                Seu perfil de direção <span className="font-black text-brand-accent uppercase italic">{vehicle.drivingStyle === 'smooth' ? 'PÉ LEVE' : vehicle.drivingStyle === 'aggressive' ? 'ESPORTIVO' : 'EQUILIBRADO'}</span> e regime <span className="font-black text-brand-accent uppercase italic">{vehicle.usageProfile === 'urban' ? 'URBANO' : 'Pista'}</span> influenciam diretamente este índice.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 relative z-10 space-y-3">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-white/40">Integridade dos Sistemas</span>
              <span className="text-brand-accent">Excepcional</span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${vehicle.healthScore || 85}%` }}
                className="h-full bg-gradient-to-r from-brand-accent to-yellow-400"
              />
            </div>
          </div>

          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-[80px]"></div>
        </div>
      </div>
    </div>
  );
};
