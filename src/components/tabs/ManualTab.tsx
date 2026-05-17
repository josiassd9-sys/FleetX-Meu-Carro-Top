
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Book, Upload, Sparkles, RefreshCw, Wrench, AlertCircle, 
  Send, Settings 
} from 'lucide-react';
import Markdown from 'react-markdown';
import { Vehicle } from '../../types';

interface ManualTabProps {
  vehicle: Vehicle;
  isUploadingPDF: boolean;
  isGeneratingManual: boolean;
  onPDFUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateManual: () => void;
  manualChatQuery: string;
  setManualChatQuery: (val: string) => void;
  onSendManualChat: () => void;
  isChattingWithManual: boolean;
  manualChatResponse: string | null;
  manualPDFInputRef: React.RefObject<HTMLInputElement | null>;
}

export const ManualTab: React.FC<ManualTabProps> = ({
  vehicle,
  isUploadingPDF,
  isGeneratingManual,
  onPDFUpload,
  onGenerateManual,
  manualChatQuery,
  setManualChatQuery,
  onSendManualChat,
  isChattingWithManual,
  manualChatResponse,
  manualPDFInputRef
}) => {
  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-black italic uppercase tracking-tighter text-brand-primary flex items-center gap-2">
            <Book size={24} className="text-brand-accent" /> Manual & Assistente IA
          </h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Base de conhecimento técnica e consulta em linguagem natural</p>
        </div>
        <div className="flex flex-wrap gap-2">
            <input 
              type="file" 
              ref={manualPDFInputRef}
              onChange={onPDFUpload}
              accept=".pdf"
              className="hidden"
            />
            <button 
              onClick={() => manualPDFInputRef.current?.click()}
              disabled={isUploadingPDF || isGeneratingManual}
              className="bg-white border border-gray-200 text-gray-500 px-5 py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:border-brand-primary hover:text-brand-primary transition-all flex items-center gap-2 disabled:opacity-50 shadow-sm"
            >
              {isUploadingPDF ? (
                <>
                  <RefreshCw className="animate-spin" size={14} />
                  Extraindo...
                </>
              ) : (
                <>
                  <Upload size={14} />
                  Upload PDF
                </>
              )}
            </button>
            {!vehicle.manualTranscription && (
              <button 
                onClick={onGenerateManual}
                disabled={isGeneratingManual || isUploadingPDF}
                className="bg-brand-primary text-white px-5 py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-brand-accent transition-all flex items-center gap-2 disabled:opacity-50 shadow-xl shadow-brand-primary/20"
              >
                {isGeneratingManual ? (
                  <>
                    <RefreshCw className="animate-spin" size={14} />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Gerar com IA
                  </>
                )}
              </button>
            )}
        </div>
      </div>

      {!vehicle.manual && !vehicle.manualTranscription ? (
        <div className="text-center py-24 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
           <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Book size={40} className="text-gray-200" />
            </div>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs max-w-sm mx-auto leading-relaxed">
            Você ainda não possui as informações técnicas do manual para este veículo. 
            Use a IA para pesquisar ou faça upload do PDF.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Structured Manual Data */}
            {vehicle.manual && (
              <>
                {/* Maintenance Schedule */}
                {vehicle.manual.maintenanceSchedule.length > 0 && (
                  <div className="bg-blue-50/50 border border-blue-100 rounded-[2rem] p-8">
                    <h4 className="font-black text-lg text-blue-900 mb-6 flex items-center gap-3 uppercase italic tracking-tighter">
                      <Wrench size={22} className="text-blue-600" />
                      Plano de Revisão Programada
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {vehicle.manual.maintenanceSchedule.map((schedule, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-2xl border border-blue-50 shadow-sm transition-all hover:scale-[1.02]">
                          <div className="font-black text-blue-600 text-lg mb-2">
                             {schedule.mileage.toLocaleString()} <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">km</span>
                          </div>
                          <ul className="text-xs text-gray-600 space-y-2 font-medium">
                            {schedule.items.map((item, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="h-1 w-1 bg-blue-300 rounded-full mt-1.5 shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technical Sections */}
                {Object.keys(vehicle.manual.technicalSections).some(k => (vehicle.manual as any)?.technicalSections[k]) && (
                  <div className="bg-amber-50/50 border border-amber-100 rounded-[2rem] p-8">
                    <h4 className="font-black text-lg text-amber-900 mb-6 flex items-center gap-3 uppercase italic tracking-tighter">
                      <AlertCircle size={22} className="text-amber-600" />
                      Especificações de Fábrica
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(vehicle.manual.technicalSections).map(([key, value]) => {
                        if (!value) return null;
                        const labels: { [key: string]: string } = {
                          tirePressure: 'Pressão de Pneus',
                          oilSpecification: 'Óleo & Lubrificação',
                          batteryInfo: 'Sist. Elétrico / Bateria',
                          filterInfo: 'Filtros & Ar',
                          fluidsCapacities: 'Fluidos & Capacidades'
                        };
                        
                        return (
                          <div key={key} className="bg-white p-5 rounded-2xl border border-amber-50 shadow-sm transition-all hover:scale-[1.02]">
                            <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-2">
                              {labels[key] || key}
                            </p>
                            <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed font-medium">
                              {value}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Full Transcription */}
            {vehicle.manualTranscription && (
              <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm overflow-hidden prose prose-sm max-w-none prose-brand relative">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Book size={200} />
                </div>
                <div className="markdown-body relative z-10">
                  <Markdown>{vehicle.manualTranscription}</Markdown>
                </div>
              </div>
            )}

            <button 
              onClick={onGenerateManual}
              disabled={isGeneratingManual}
              className="px-6 py-3 border border-gray-100 bg-gray-50/50 text-[10px] text-gray-400 font-bold uppercase tracking-widest hover:bg-gray-100 rounded-xl flex items-center gap-2 transition-all"
            >
              <RefreshCw size={12} className={isGeneratingManual ? "animate-spin" : ""} /> 
              Sincronizar Manual Novamente via Web
            </button>
          </div>

          {/* AI Chat Sidebar */}
          <div className="bg-brand-primary rounded-[2.5rem] p-8 text-white shadow-2xl flex flex-col h-[680px] lg:h-auto border border-white/5 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-brand-accent/10 rounded-full blur-[60px] group-hover:bg-brand-accent/20 transition-all duration-1000" />
            
            <div className="flex items-center gap-4 mb-8 relative z-10">
              <div className="bg-brand-accent p-3 rounded-2xl shadow-xl shadow-brand-accent/20">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h4 className="text-lg font-black italic tracking-tighter uppercase leading-none">Mecânico Assistente</h4>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-[2px] mt-1">IA Consultiva</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto mb-6 space-y-6 pr-2 custom-scrollbar relative z-10">
              {manualChatResponse ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/10 p-6 rounded-[1.5rem] border border-white/5 text-sm leading-relaxed"
                >
                  <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                     <span className="text-[9px] font-black uppercase text-brand-accent tracking-widest">IA Sincronizada</span>
                  </div>
                  <div className="markdown-body prose prose-invert prose-xs">
                    <Markdown>{manualChatResponse}</Markdown>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-20 opacity-30 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full border border-dashed border-white/20 flex items-center justify-center">
                    <Send size={24} />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">Faça uma pergunta sobre o manual.<br/>Serei seu especialista de cabeceira.</p>
                </div>
              )}
              {isChattingWithManual && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center py-4"
                >
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 bg-brand-accent rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-2 w-2 bg-brand-accent rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 bg-brand-accent rounded-full animate-bounce"></div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="relative group relative z-10 shrink-0">
              <input 
                type="text" 
                placeholder="Pergunte ao manual..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 pr-14 text-sm focus:ring-4 focus:ring-brand-accent/20 outline-none placeholder:text-white/20 transition-all font-medium"
                value={manualChatQuery}
                onChange={(e) => setManualChatQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSendManualChat()}
              />
              <button 
                onClick={onSendManualChat}
                disabled={isChattingWithManual || !manualChatQuery}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-brand-accent text-brand-primary rounded-xl disabled:opacity-50 hover:scale-110 active:scale-95 transition-all shadow-xl shadow-brand-accent/20"
              >
                {isChattingWithManual ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
