
import React from 'react';
import { motion } from 'motion/react';
import { Fuel, RefreshCw, Trash2, Zap } from 'lucide-react';
import { FuelLog } from '../../types';

interface FuelTabProps {
  fuelLogs: FuelLog[];
  onAddFuel: () => void;
  onDeleteItem: (id: string) => void;
  formatCurrency: (val: number) => string;
}

export const FuelTab: React.FC<FuelTabProps> = ({
  fuelLogs,
  onAddFuel,
  onDeleteItem,
  formatCurrency
}) => {
  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-black italic uppercase tracking-tighter text-brand-primary flex items-center gap-2">
            <Fuel size={24} className="text-brand-accent" /> LOG de Abastecimento
          </h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Controle de consumo, eficiência e telemetria financeira</p>
        </div>
        <button 
          onClick={onAddFuel}
          className="bg-brand-primary text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-accent transition-all shadow-xl shadow-brand-primary/20"
        >
          + Novo Abastecimento
        </button>
      </div>

      <div className="overflow-hidden bg-white rounded-3xl border border-gray-100 shadow-sm">
        {(!fuelLogs || fuelLogs.length === 0) ? (
          <div className="text-center py-24">
            <div className="bg-gray-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Zap size={40} className="text-gray-200" />
            </div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Sem registros de telemetria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Data</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Hodômetro</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Volume (L)</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Custo Total</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status Tanque</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[...fuelLogs].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                       <p className="text-xs font-black text-brand-primary">{new Date(log.date).toLocaleDateString('pt-BR')}</p>
                    </td>
                    <td className="px-6 py-4">
                       <p className="text-xs font-mono font-bold text-gray-600">{log.mileage.toLocaleString()} km</p>
                    </td>
                    <td className="px-6 py-4">
                       <p className="text-xs font-mono font-bold text-gray-600">{log.liters.toLocaleString()} L</p>
                    </td>
                    <td className="px-6 py-4">
                       <p className="text-sm font-mono font-black text-brand-accent">{formatCurrency(log.cost)}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        {log.fullTank ? (
                          <span className="bg-green-100 text-green-600 text-[8px] font-black uppercase px-2 py-1 rounded-lg border border-green-200">Tanque Cheio</span>
                        ) : (
                          <span className="bg-gray-100 text-gray-400 text-[8px] font-black uppercase px-2 py-1 rounded-lg border border-gray-200">Parcial</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => onDeleteItem(log.id)}
                        className="p-2 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
