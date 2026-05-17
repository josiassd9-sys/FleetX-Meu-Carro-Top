import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, X, Settings, Play, Database, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { generateMaintenancePdf } from '../services/maintenance-pdf';

interface MaintenanceSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVehicle: any;
  simulationMileage: string | number;
  setSimulationMileage: React.Dispatch<React.SetStateAction<any>>;
  simulationResults: any[];
  isCalculatingSimulation: boolean;
  onRunSimulation: () => void;
}

export const MaintenanceSimulationModal = ({
  isOpen,
  onClose,
  selectedVehicle,
  simulationMileage,
  setSimulationMileage,
  simulationResults,
  isCalculatingSimulation,
  onRunSimulation
}: MaintenanceSimulationModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && selectedVehicle && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white rounded p-8 w-full max-w-2xl shadow-2xl h-[85vh] flex flex-col"
          >
            <div className="flex justify-between items-center mb-8 shrink-0">
              <div className="flex items-center gap-3">
                 <div className="bg-brand-accent p-2 rounded-xl text-white block">
                   <Activity size={24} />
                 </div>
                 <div>
                   <h2 className="text-2xl font-black">Simulador de Manutenção</h2>
                   <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Plano Preventivo por Quilometragem</p>
                 </div>
              </div>
              <button 
                onClick={onClose}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bg-gray-50 p-6 rounded mb-8 border border-gray-100">
              <div className="flex flex-col md:flex-row gap-6 items-end">
                <div className="flex-1 w-full">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Simular Revisão para:</label>
                  <div className="relative">
                    <input 
                      type="number"
                      placeholder="Ex: 50000"
                      className="w-full bg-white border border-gray-200 rounded p-4 focus:ring-2 focus:ring-brand-accent transition-all text-xl font-mono font-bold"
                      value={simulationMileage}
                      onChange={(e) => setSimulationMileage(e.target.value === '' ? '' : Number(e.target.value))}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">KM</span>
                  </div>
                </div>
                <button 
                  onClick={onRunSimulation}
                  disabled={!simulationMileage || isCalculatingSimulation}
                  className="bg-brand-primary text-white px-8 py-4 rounded font-bold hover:bg-brand-accent transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 whitespace-nowrap min-w-[180px] justify-center"
                >
                  {isCalculatingSimulation ? <Settings className="animate-spin" size={20} /> : <Play size={20} />}
                  Calcular Plano
                </button>
              </div>
              <p className="mt-4 text-[10px] text-gray-500 font-medium">
                * A simulação utiliza inteligência artificial baseada no catálogo técnico padrão do {selectedVehicle.name} {selectedVehicle.model}.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {isCalculatingSimulation ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-brand-accent mb-4"
                  >
                    <Database size={48} />
                  </motion.div>
                  <h4 className="font-bold text-lg mb-1">Consultando Banco de Dados Técnico...</h4>
                  <p className="text-gray-500 text-sm">Analisando histórico de revisões e vida útil de componentes.</p>
                </div>
              ) : simulationResults.length > 0 ? (
                <>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Recomendações da IA:</h4>
                  <div className="space-y-3">
                    {simulationResults.map((item, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={idx} 
                        className="bg-white border border-gray-100 p-4 rounded flex items-start gap-4 hover:border-brand-accent transition-colors"
                      >
                        <div className={`p-2 rounded-lg shrink-0 ${
                          item.urgency === 'alta' ? 'bg-red-50 text-red-500' : 
                          item.urgency === 'media' ? 'bg-amber-50 text-amber-500' : 'bg-green-50 text-green-500'
                        }`}>
                          <AlertCircle size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h5 className="font-bold tracking-tight">{item.partName}</h5>
                            <span className="text-sm font-mono font-black text-brand-primary">{formatCurrency(item.estimatedCost)}</span>
                          </div>
                          <p className="text-xs font-bold text-brand-accent uppercase mb-1">{item.action}</p>
                          <p className="text-xs text-gray-500 leading-relaxed">{item.reason}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-100 rounded">
                  <Activity size={48} className="text-gray-200 mb-4" />
                  <p className="text-gray-400 text-sm font-medium">Insira a quilometragem desejada para simular o plano de manutenção.</p>
                </div>
              )}
            </div>

            {simulationResults.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center bg-brand-primary text-white p-6 rounded relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Total Estimado da Revisão</p>
                  <h3 className="text-3xl font-mono font-black">
                    {formatCurrency(simulationResults.reduce((sum, item) => sum + item.estimatedCost, 0))}
                  </h3>
                  <div className="mt-2 flex items-center gap-2">
                     <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Saúde Estimada Pós-Revisão:</span>
                     <span className="text-sm font-mono font-bold text-white">99%</span>
                  </div>
                </div>
                <button 
                  onClick={async () => {
                      try {
                        await generateMaintenancePdf({
                          vehicleName: selectedVehicle.name,
                          vehicleModel: selectedVehicle.model,
                          vehicleYear: selectedVehicle.year,
                          simulationMileage: Number(simulationMileage),
                          recommendations: simulationResults,
                          totalEstimatedCost: simulationResults.reduce((sum, item) => sum + item.estimatedCost, 0),
                        });
                      } catch (error) {
                        alert('Erro ao gerar PDF. Tente novamente.');
                      }
                  }}
                  className="relative z-10 bg-brand-accent hover:bg-red-700 text-white px-6 py-3 rounded font-bold transition-all shadow-lg"
                >
                  Exportar Plano
                </button>
                <Activity className="absolute right-[-10px] bottom-[-10px] opacity-10" size={120} />
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
