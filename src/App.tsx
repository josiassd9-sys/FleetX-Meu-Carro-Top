import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Settings, Car, Gauge, Activity, Box, Trash2, ArrowLeft, 
  Search, Shield, MapPin, Calendar, Clock, DollarSign, Download, 
  MessageSquare, Globe, ArrowRight, AlertTriangle, CheckCircle2, ChevronRight,
  TrendingUp, TrendingDown, RefreshCw, Smartphone, List, Zap, Fuel, Info,
  ExternalLink, Layers, Save, FileText, Share2, Pin, Sliders, Menu, X, Disc,
  Camera, Image as ImageIcon, Sparkles, Filter, ChevronDown, LayoutDashboard,
  LucideIcon,
  Upload,
  CarFront,
  BusFront,
  Truck,
  Bike,
  Cylinder,
  Key,
  Timer,
  Trophy,
  Flag,
  Palette,
  Database,
  Calculator,
  Cpu,
  Unplug,
  Flame,
  Wind,
  Map,
  HardHat,
  Wrench,
  Cog,
  ShieldCheck,
  BarChart3,
  Droplets,
  Coins,
  BadgePercent,
  Stethoscope,
  Book,
  Bell,
  Link,
  ChevronDown as ChevronDownIcon,
  Send,
  Pipette,
  AlertCircle,
  CheckCircle,
  DollarSign as DollarSignIcon,
  ShoppingCart
} from 'lucide-react';
import Markdown from 'react-markdown';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

// Refatoração - Componentes Extraídos
import { TiresTab } from './components/tabs/TiresTab';
import { ServicesTab } from './components/tabs/ServicesTab';
import { FuelTab } from './components/tabs/FuelTab';
import { PartsTab } from './components/tabs/PartsTab';
import { RemindersTab } from './components/tabs/RemindersTab';
import { IntelligenceTab } from './components/tabs/IntelligenceTab';
import { ManualTab } from './components/tabs/ManualTab';
import { AuditTab } from './components/tabs/AuditTab';

import { VehicleImage } from './components/VehicleImage';
import { BrandLogo } from './components/BrandLogo';
import { HeaderLogo } from './components/HeaderLogo';
import { SettingsModal } from './components/SettingsModal';
import { VehicleFormModal } from './components/VehicleFormModal';
import { AddServiceModal } from './components/AddServiceModal';
import { AddFuelModal } from './components/AddFuelModal';
import { AddReminderModal } from './components/AddReminderModal';
import { AddPartModal } from './components/AddPartModal';
import { MaintenanceSimulationModal } from './components/MaintenanceSimulationModal';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { BudgetModal } from './components/BudgetModal';
import { 
  CarFerrariTop, 
  CarMuscleTop, 
  CarSilhouette, 
  SteeringWheelCustom 
} from './components/CustomIcons';

// Hooks
import { 
  useAppData,
  useVehiclePredictions,
  useVehicleManual,
  useVehicleActions,
  useVehicleItems,
  useRobotSearch,
  useVehicleDetails,
} from './hooks';

// Tipos e Serviços
import { Vehicle, Part, ServiceEntry, FuelLog, Reminder, TireSet, AppData, VehicleSearchLink } from './types';
import { storageService } from './services/storageService';
import { geminiService } from './services/geminiService';
import { webVehicleSearchService } from './services/webVehicleSearchService';
import { formatCurrency, cn, fileToBase64, resizeImage } from './lib/utils';
import { getVehicleHealth, getMaintenanceScore, getFuelAnalytics as getFuelAnalyticsUtil } from './lib/vehicleUtils';
import { THEMES, DEFAULT_SEARCH_LINKS, AUTO_DICTIONARY } from './constants';
import { COUNTRIES } from './config/countryConfig';

const ICON_OPTIONS = {
  Car, CarFront, BusFront, Truck, Bike, Settings, Search, Wrench, Activity, Shield, Zap, Box, Gauge, Fuel, Cog, Cylinder, Key, Timer, Trophy, Flag, Palette, Database, Calculator, Cpu, Disc, Unplug, Flame, Wind, Map, HardHat,
  CarFerrariTop, CarMuscleTop, CarSilhouette, SteeringWheelCustom
};

export default function App() {
  const {
    data,
    setData,
    currentCountry,
    getCurrencySymbol,
    getDistanceUnit,
    formatDistance,
    marketRef,
    handleSave,
  } = useAppData();

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const {
    isAddingVehicle,
    setIsAddingVehicle,
    isEditingVehicle,
    setIsEditingVehicle,
    newVehicle,
    setNewVehicle,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    moveVehicleToTop,
    openEditModal,
    updateSelectedVehicle
  } = useVehicleActions(data, setData, handleSave, selectedVehicle, setSelectedVehicle);

  const {
    itemToDelete,
    setItemToDelete,
    handleDeleteItem,
    confirmDelete,
    isAddingPart,
    setIsAddingPart,
    newPartName,
    setNewPartName,
    aiSuggestions,
    setAiSuggestions,
    isResearching,
    addPart,
    deletePart,
    togglePartBudget,
    estimatePrice,
    isEstimatingPrice,
    updatePartPrice
  } = useVehicleItems(data, handleSave, selectedVehicle, updateSelectedVehicle);

  const {
    maintenancePredictions,
    isLoadingPredictions,
    fuelInsight,
    marketAnalysis,
    isAnalyzingMarket,
    tcoAnalysis,
    isAnalyzingTco,
    digitalPassport,
    isGeneratingPassport,
    diagnosisResult,
    isDiagnosing,
    isAnalyzingHealth,
    symptomQuery,
    setSymptomQuery,
    setMarketAnalysis,
    setDiagnosisResult,
    setTcoAnalysis,
    setDigitalPassport,
    handleDiagnose,
    runHealthAnalysis,
    handleMarketAnalysis,
    handleTCOAnalysis,
    handleGeneratePassport,
    predictCurrentMileage,
  } = useVehiclePredictions(selectedVehicle, data, handleSave);

  const {
    addTireSet,
    deleteTireSet,
    updateTireSet,
    isAddingService,
    setIsAddingService,
    isAddingFuel,
    setIsAddingFuel,
    isAddingReminder,
    setIsAddingReminder,
    newService,
    setNewService,
    newFuel,
    setNewFuel,
    newReminder,
    setNewReminder,
    addService,
    addFuel,
    addReminder,
    toggleReminder
  } = useVehicleDetails(selectedVehicle, data, handleSave, setSelectedVehicle);

  const [simulationMileage, setSimulationMileage] = useState<number | ''>('');
  const [activeTab, setActiveTab] = useState('parts');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isDetectingRegion, setIsDetectingRegion] = useState(false);
  const [showInternalBrowser, setShowInternalBrowser] = useState(false);
  const [internalBrowserUrl, setInternalBrowserUrl] = useState('');
  const [searchPortals, setSearchPortals] = useState<any[]>([]);

  useEffect(() => {
    if (data.settings?.showInternalBrowser !== undefined) {
      setShowInternalBrowser(data.settings.showInternalBrowser);
    }
  }, [data.settings?.showInternalBrowser]);

  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [isWebSearchOpen, setIsWebSearchOpen] = useState(false);
  const [webSearchMode, setWebSearchMode] = useState<'parts' | 'vehicle' | 'manual'>('parts');
  const [selectedServiceForReport, setSelectedServiceForReport] = useState<ServiceEntry | null>(null);

  const manualPDFInputRef = useRef<HTMLInputElement | null>(null);
  const importVehicleInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const vehicleImageInputRef = useRef<HTMLInputElement | null>(null);
  const brandLogoInputRef = useRef<HTMLInputElement | null>(null);
  const [newServicePart, setNewServicePart] = useState<any>({ name: '', quantity: 1, unitPrice: 0 });

  const {
    isUploadingPDF,
    isCalculatingSimulation,
    simulationResults,
    setSimulationResults,
    handleManualPDFUpload,
    runSimulation,
    isGeneratingManual,
    isChattingWithManual,
    manualChatResponse,
    manualChatQuery,
    setManualChatQuery,
    manualChatResponse: manualResponse,
    setManualChatResponse,
    generateManualInfo,
    chatWithManual
  } = useVehicleManual(selectedVehicle, data, handleSave, setSelectedVehicle);

  const onRemoveBackgroundWrapper = async () => {
    const imageUrl = isEditingVehicle ? selectedVehicle?.imageUrl : newVehicle.imageUrl;
    if (!imageUrl) return;
    const newUrl = await handleRemoveBackground(imageUrl);
    if (isEditingVehicle && selectedVehicle) {
      updateSelectedVehicle({ imageUrl: newUrl });
    } else {
      setNewVehicle(prev => ({ ...prev, imageUrl: newUrl }));
    }
  };

  const {
    isSearchingPlate,
    plateSearchStatus,
    robotLogs,
    isSearchingImage,
    isSearchingLogo,
    isRemovingBackground,
    isCapturingFromWeb,
    isProcessingAssisted,
    rawPastedData,
    setRawPastedData,
    robotLogsEndRef,
    searchImage,
    searchLogo,
    searchVehicleByPlate,
    handleAssistedProcess,
    handleCaptureFromClipboard: captureFromExternal,
    handleRemoveBackground
  } = useRobotSearch(
    currentCountry, data, newVehicle as Vehicle, setNewVehicle, 
    selectedVehicle, updateSelectedVehicle, showInternalBrowser
  );

  const fuelAnalytics = useMemo(() => getFuelAnalyticsUtil(selectedVehicle), [selectedVehicle?.fuelLogs]);
  const vehicleHealth = useMemo(() => getVehicleHealth(selectedVehicle), [selectedVehicle?.parts]);
  const maintenanceScore = useMemo(() => getMaintenanceScore(selectedVehicle), [selectedVehicle]);

  useEffect(() => {
    const theme = THEMES[(data.settings?.theme as keyof typeof THEMES) || 'default'];
    const styleId = 'theme-overrides';
    let styleTag = document.getElementById(styleId);
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = `:root { --color-brand-primary: ${theme.primary}; --color-brand-accent: ${theme.accent}; --color-brand-bg: ${theme.bg}; }`;
  }, [data.settings?.theme]);

  const handlePDFUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) await handleManualPDFUpload(file);
    if (manualPDFInputRef.current) manualPDFInputRef.current.value = '';
  };

  const shareTechnicalReport = () => {
    if (!selectedVehicle) return;
    const servicesText = (selectedVehicle.services || []).slice(-3).map(s => `• ${s.date}: ${s.description} (${s.mileage}km)`).join('\n');
    const predictionsText = (maintenancePredictions || []).map(p => `• ${p.item}: Previsto para ${p.estimatedDate}`).join('\n');
    const report = `*RELATÓRIO TÉCNICO - ${selectedVehicle.name} ${selectedVehicle.model}*\n🚗 Placa: ${selectedVehicle.plate || 'N/A'}\n📊 Saúde Atual: ${getVehicleHealth(selectedVehicle)}%\n📍 KM: ${selectedVehicle.mileage}\n\n*ÚLTIMOS SERVIÇOS:*\n${servicesText || 'Nenhum histórico recente.'}\n\n*PREVISÕES DE MANUTENÇÃO:*\n${predictionsText || 'Analise de saúde necessária.'}\n\n💬 *Análise IA:* ${maintenancePredictions.length > 0 ? 'Existem manutenções pendentes' : 'Veículo em bom estado'}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(report)}`, '_blank');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (importedData.vehicles) {
          handleSave(importedData);
          alert('Dados importados com sucesso!');
        }
      } catch (err) {
        alert('Erro ao importar arquivo. Verifique o formato.');
      }
    };
    reader.readAsText(file);
  };

  const handleVehicleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      const resized = await resizeImage(base64, 1200, 800);
      if (selectedVehicle) {
        updateSelectedVehicle({ imageUrl: resized });
      } else {
        setNewVehicle(prev => ({ ...prev, imageUrl: resized }));
      }
    } catch (error) {
      alert('Erro ao processar imagem.');
    }
  };

  const handleBrandLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      const resized = await resizeImage(base64, 400, 400);
      if (selectedVehicle) {
        updateSelectedVehicle({ brandLogoUrl: resized });
      } else {
        setNewVehicle(prev => ({ ...prev, brandLogoUrl: resized }));
      }
    } catch (error) {
      alert('Erro ao processar logotipo.');
    }
  };

  const exportVehicle = (vehicle: Vehicle) => {
    const jsonStr = JSON.stringify(vehicle, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${vehicle.plate || 'veiculo'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportVehicle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedVehicle = JSON.parse(event.target?.result as string) as Vehicle;
        if (!importedVehicle.name || !importedVehicle.id) throw new Error('Formato inválido');
        const existingIdx = data.vehicles.findIndex(v => v.id === importedVehicle.id);
        let updatedVehicles;
        if (existingIdx >= 0) {
          if (confirm('Substituir veículo existente?')) {
            updatedVehicles = [...data.vehicles];
            updatedVehicles[existingIdx] = importedVehicle;
          } else return;
        } else {
          updatedVehicles = [...data.vehicles, importedVehicle];
        }
        handleSave({ ...data, vehicles: updatedVehicles });
        setSelectedVehicle(importedVehicle);
      } catch (err) { alert('Erro na importação.'); }
    };
    reader.readAsText(file);
  };
  const [isUpdatingFipe, setIsUpdatingFipe] = useState(false);

  const updateFipeValue = async (vId: string) => {
    const vehicle = data.vehicles.find(v => v.id === vId);
    if (!vehicle) return;
    
    setIsUpdatingFipe(true);
    try {
      const value = await geminiService.fetchFipeValue(vehicle.name, vehicle.model, vehicle.year);
      setData(prev => ({
        ...prev,
        vehicles: prev.vehicles.map(v => v.id === vId ? {
          ...v,
          fipeValue: value,
          lastFipeUpdate: new Date().toISOString()
        } : v)
      }));
    } catch (error) {
      console.error("Erro ao atualizar FIPE:", error);
    } finally {
      setIsUpdatingFipe(false);
    }
  };

  useEffect(() => {
    if (data.vehicles.length > 0) {
      data.vehicles.forEach(v => {
        // Atualiza se não tiver valor ou se o valor for antigo (mais de 24h)
        const isOld = !v.lastFipeUpdate || (new Date().getTime() - new Date(v.lastFipeUpdate).getTime() > 86400000);
        if (isOld) updateFipeValue(v.id);
      });
    }
  }, []);

  return (
    <>
      {/* Modal de Onboarding / Configuração Automática */}
      {isOnboarding && (
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
              onClick={() => {
                storageService.saveData(data);
                setIsOnboarding(false);
              }}
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
      )}

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="min-h-screen bg-brand-bg tech-grid p-4 md:p-8"
      >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-2 gap-2">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="bg-brand-accent p-3 rounded shadow-lg shadow-brand-accent/20 glow-accent"
            >
              <HeaderLogo iconName={data.settings?.appIcon} className="text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-brand-primary leading-tight">
                {data.settings?.appName || 'Meu Carro Top'}
              </h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded bg-green-500 animate-pulse"></span>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Sistema de Gestão Ativo</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full lg:w-auto lg:min-w-[400px]">
            <motion.button 
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsSettingsOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white border border-gray-100 text-sm font-bold text-gray-600 hover:text-brand-primary hover:border-brand-primary/30 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
            >
              <Settings size={18} /> <span>Configurações</span>
            </motion.button>
            <motion.button 
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsAddingVehicle(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-brand-primary text-white text-sm font-bold shadow-lg shadow-brand-primary/20 hover:bg-brand-accent transition-all"
            >
              <Plus size={18} /> <span>Novo Veículo</span>
            </motion.button>
          </div>
        </header>

        {/* Compact Dashboard Status Ribbon */}
        {!selectedVehicle && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap md:flex-nowrap items-center gap-2 mb-2 pb-2 border-b border-gray-100"
          >
            <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white rounded border border-gray-50 shadow-sm min-w-[140px]">
              <Car size={14} className="text-brand-accent" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-1">Frota</span>
              <span className="text-sm font-black text-brand-primary">{data.vehicles?.length || 0}</span>
            </div>

            <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white rounded border border-gray-50 shadow-sm min-w-[140px]">
              <Activity size={14} className="text-green-500" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-1">Saúde</span>
              <span className="text-sm font-black text-green-600">
                {data.vehicles.length > 0 ? (
                  (data.vehicles[0].reminders?.some(r => {
                    const diff = new Date(r.targetDate).getTime() - new Date().getTime();
                    return diff < 1000 * 60 * 60 * 24 * 7;
                  }) ? 'Atenção' : 'Excelente')
                ) : '--'}
              </span>
            </div>
            
            <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white rounded border border-gray-50 shadow-sm min-w-[140px]">
              <Box size={14} className="text-brand-accent" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-1">Peças</span>
              <span className="text-sm font-black text-brand-primary">
                {data.vehicles.length > 0 ? (data.vehicles[0].parts?.length || 0) : 0}
              </span>
            </div>

            <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white rounded border border-gray-50 shadow-sm min-w-[140px]">
              <Disc size={14} className="text-blue-500" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-1">Pneus</span>
              <span className="text-sm font-black text-blue-600">
                {data.vehicles.length > 0 ? (data.vehicles[0].tireSets?.[0]?.brand || 'OK') : '--'}
              </span>
            </div>
          </motion.div>
        )}

        {!selectedVehicle ? (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2"
          >
            {(data.vehicles || []).map((vehicle) => (
              <motion.div
                key={vehicle.id}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                onClick={() => setSelectedVehicle(vehicle)}
                className="group relative glass-card p-4 cursor-pointer overflow-hidden"
              >
                <div className="flex flex-col items-center">
                  <div className="text-center w-full mb-2">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <BrandLogo 
                        vehicleName={vehicle.name} 
                        brandLogoUrl={vehicle.brandLogoUrl}
                        className="w-10 h-10 rounded shadow-sm"
                      />
                      <h3 className="text-lg font-black text-brand-primary tracking-tight leading-none">{vehicle.name}</h3>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest line-clamp-1">{vehicle.model} • {vehicle.year}</p>
                  </div>

                  <div className="relative w-full mb-2 group-hover:scale-[1.02] transition-transform duration-500">
                    <VehicleImage 
                      src={vehicle.imageUrl} 
                      alt={vehicle.name} 
                      className="aspect-video w-full rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] ring-2 ring-white/50 object-cover" 
                    />
                  </div>
                  
                      <div className="text-center w-full">
                    <div className="relative flex items-center justify-center gap-4 pt-2 border-t border-gray-50">
                      <div className="flex items-center gap-1.5">
                        <Gauge size={14} className="text-brand-accent" />
                        <span className="text-xs font-mono font-bold text-gray-700">{formatDistance(vehicle.mileage)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Box size={14} className="text-brand-accent" />
                        <span className="text-xs font-mono font-bold text-gray-700">{(vehicle.parts?.length || 0)} itens</span>
                      </div>
                      {vehicle.fipeValue && (
                        <div className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded text-[10px] font-black text-green-600">
                          <DollarSign size={10} />
                          {formatCurrency(vehicle.fipeValue)}
                        </div>
                      )}
                      <div className="absolute right-0 flex items-center gap-1">
                        {data.vehicles.indexOf(vehicle) !== 0 && (
                          <motion.button 
                            whileHover={{ scale: 1.2, color: 'var(--color-brand-accent)' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              moveVehicleToTop(vehicle.id);
                            }}
                            className="p-1 text-gray-300 hover:text-brand-accent transition-colors"
                            title="Colocar como principal"
                          >
                            <Pin size={14} />
                          </motion.button>
                        )}
                        <motion.button 
                          whileHover={{ scale: 1.2, color: '#ef4444' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteVehicle(vehicle.id);
                          }}
                          className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => importVehicleInputRef.current?.click()}
              className="group border-2 border-dashed border-gray-200 rounded p-8 flex flex-col items-center justify-center gap-4 text-gray-300 hover:border-blue-400 hover:text-blue-400 transition-all bg-white/30 backdrop-blur-sm min-h-[320px]"
            >
              <div className="bg-gray-50 p-6 rounded group-hover:bg-blue-50 transition-colors">
                <Download size={48} />
              </div>
              <div className="text-center">
                <span className="text-sm font-black uppercase tracking-widest block">Importar Veículo</span>
                <span className="text-[10px] font-bold opacity-60">Arquivo .json do Cliente</span>
              </div>
            </motion.button>

            <motion.button
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsAddingVehicle(true)}
              className="group border-2 border-dashed border-gray-200 rounded p-8 flex flex-col items-center justify-center gap-4 text-gray-300 hover:border-brand-primary/30 hover:text-brand-primary transition-all bg-white/30 backdrop-blur-sm min-h-[320px]"
              id="add-vehicle-btn"
            >
              <div className="bg-gray-50 p-6 rounded group-hover:bg-brand-primary/10 transition-colors">
                <Plus size={48} />
              </div>
              <span className="font-black text-lg tracking-tight">Novo Veículo</span>
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            {/* Breadcrumbs / Back and Actions Area */}
            <div className="flex items-center justify-between mb-4 px-2">
              <button 
                onClick={() => setSelectedVehicle(null)}
                className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-brand-accent transition-colors"
                id="back-btn"
              >
                <ArrowLeft size={16} /> Voltar para Meus Veículos
              </button>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => exportVehicle(selectedVehicle)}
                  className="p-2 hover:text-brand-accent transition-colors text-gray-500 bg-white/5 rounded-xl border border-white/5"
                  title="Exportar Dados do Veículo (.json)"
                >
                  <Download size={18} />
                </button>
                <button 
                  onClick={openEditModal}
                  className="p-2 hover:text-brand-accent transition-colors text-gray-500 bg-white/5 rounded-xl border border-white/5"
                  title="Configuração do Veículo"
                >
                  <Settings size={18} />
                </button>
                <button 
                  onClick={shareTechnicalReport}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-500/20 shadow-sm"
                  title="Gerar Relatório Técnico"
                >
                  <MessageSquare size={14} /> Relatório Técnico
                </button>
              </div>
            </div>

            {/* Vehicle Detail Header */}
            <div className="glass-dark text-white p-6 md:p-8 relative overflow-hidden mb-2">
               <div className="relative z-10 flex flex-col items-center text-center">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-brand-accent text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">Active System</span>
                  <span className="text-gray-500 text-[10px] font-mono">VIN: {selectedVehicle.id.slice(0, 8).toUpperCase()}</span>
                </div>

                <div className="w-full max-w-[540px] mb-2 relative">
                  {/* Alerta de Sincronização Proativa */}
                  {predictCurrentMileage(selectedVehicle) > selectedVehicle.mileage + 100 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="absolute -top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] sm:w-auto sm:min-w-[280px]"
                    >
                      <div className="bg-brand-primary text-white p-3 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-md flex items-center justify-between gap-4 overflow-hidden relative">
                        <div className="flex items-center gap-3">
                          <div className="bg-white/20 p-2 rounded-xl animate-pulse">
                            <RefreshCw size={16} />
                          </div>
                          <div className="text-left">
                            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Sincronizar Odômetro?</p>
                            <p className="text-[9px] text-white/80 font-medium">IA estima que você rodou +{Math.round(predictCurrentMileage(selectedVehicle) - selectedVehicle.mileage)} {getDistanceUnit()}.</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => updateSelectedVehicle({ mileage: predictCurrentMileage(selectedVehicle) })}
                          className="bg-white text-brand-primary px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter hover:bg-brand-accent hover:text-white transition-all shadow-lg shrink-0"
                        >
                          Sincronizar
                        </button>
                        <div className="absolute bottom-0 left-0 h-0.5 bg-brand-accent" style={{ animation: 'progress-shimmer 2s linear infinite', width: '100%' }}></div>
                      </div>
                    </motion.div>
                  )}

                  <VehicleImage 
                    src={selectedVehicle.imageUrl} 
                    alt={selectedVehicle.name} 
                    className="aspect-video w-full rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] ring-4 ring-white/20 object-cover" 
                  />
                </div>

                  <div className="flex flex-col items-center gap-1 mb-2">
                    <div className="flex items-center justify-center gap-4 mb-2">
                    <div className="relative group">
                      <BrandLogo 
                        vehicleName={selectedVehicle.name} 
                        brandLogoUrl={selectedVehicle.brandLogoUrl}
                        className="w-16 h-16 rounded-2xl shadow-xl border-2 border-white/20"
                      />
                      <div className="absolute -right-2 -bottom-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => searchLogo(selectedVehicle.name, true)}
                          disabled={isSearchingLogo}
                          className="bg-brand-primary text-white p-1.5 rounded-lg shadow-lg hover:bg-brand-accent transition-all disabled:opacity-50"
                          title="Melhorar Logo via IA"
                        >
                          {isSearchingLogo ? <RefreshCw className="animate-spin" size={10} /> : <Search size={10} />}
                        </button>
                        <button 
                          onClick={() => brandLogoInputRef.current?.click()}
                          className="bg-white text-brand-primary p-1.5 rounded-lg shadow-lg hover:bg-gray-100 transition-all border border-gray-200"
                          title="Upload de Logo Manual"
                        >
                          <Upload size={10} />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[10px] font-black uppercase text-brand-primary/60 tracking-widest mb-1 flex items-center gap-1.5">
                        <Zap size={10} className="text-brand-accent" /> Perfil: {selectedVehicle.drivingStyle === 'smooth' ? 'Motorista Pé Leve' : selectedVehicle.drivingStyle === 'aggressive' ? 'Perfil Esportivo' : 'Motorista Equilibrado'}
                      </p>
                      <h2 className="text-3xl md:text-5xl font-black tracking-tighter italic uppercase underline decoration-brand-accent/50 underline-offset-8 decoration-4">{selectedVehicle.name}</h2>
                    </div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <p className="text-lg text-gray-400 font-bold opacity-80">{selectedVehicle.model} — {selectedVehicle.year}</p>
                      
                      {/* Health Indicator Widget */}
                      <div className="flex items-center gap-4 mt-2 mb-1">
                        <button 
                          onClick={runHealthAnalysis}
                          disabled={isAnalyzingHealth}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                            selectedVehicle.healthScore 
                              ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                              : 'bg-brand-accent/20 border-brand-accent/30 hover:scale-105'
                          }`}
                        >
                          {isAnalyzingHealth ? (
                            <div className="w-4 h-4 border-2 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <ShieldCheck size={16} className={selectedVehicle.healthScore ? 'text-green-400' : 'text-brand-accent'} />
                          )}
                          <div className="text-left">
                            <p className="text-[10px] font-black uppercase text-gray-400 leading-none">Status de Saúde</p>
                            <p className="text-xs font-black text-white">
                              {selectedVehicle.healthScore ? `${selectedVehicle.healthScore}%` : 'Analisar agora'}
                            </p>
                          </div>
                        </button>

                        {(selectedVehicle.version || selectedVehicle.engine) && (
                          <div className="flex flex-wrap items-center justify-center gap-2">
                            {selectedVehicle.version && (
                              <span className="text-[10px] bg-brand-primary/20 text-brand-primary px-2 py-1 rounded-lg font-black uppercase tracking-wider">{selectedVehicle.version}</span>
                            )}
                            {selectedVehicle.engine && (
                              <span className="text-[10px] bg-brand-accent/20 text-brand-accent px-2 py-1 rounded-lg font-black uppercase tracking-wider">{selectedVehicle.engine}</span>
                            )}
                          </div>
                        )}
                      </div>

                      {selectedVehicle.healthAnalysis && (
                        <div className="max-w-md bg-green-500/10 border border-green-500/20 p-3 rounded-2xl mb-4 relative text-center">
                          <p className="text-[11px] text-green-200/80 leading-relaxed font-medium italic">
                            "{selectedVehicle.healthAnalysis}"
                          </p>
                          <div className="absolute -top-2 -left-2 bg-green-500 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest shadow-lg">IA Insight</div>
                        </div>
                      )}

                      {/* Predictive Agenda */}
                      <div className="w-full max-w-4xl mb-6">
                        <div className="flex items-center justify-between mb-4 px-2">
                           <div className="flex items-center gap-2">
                            <Calendar className="text-brand-accent" size={20} />
                            <h3 className="text-lg font-black text-white italic uppercase tracking-tighter">Agenda Preditiva IA</h3>
                           </div>
                           {isLoadingPredictions && <div className="w-4 h-4 border-2 border-brand-accent border-t-transparent rounded-full animate-spin"></div>}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {maintenancePredictions.length > 0 ? maintenancePredictions.map((pred, idx) => (
                            <motion.div 
                              key={idx}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.1 }}
                              className="bg-white/5 border border-white/10 p-4 rounded-2xl group hover:border-brand-accent/50 transition-all cursor-default"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${
                                  pred.priority === 'Alta' ? 'bg-red-500 text-white' : 
                                  pred.priority === 'Média' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
                                }`}>
                                  {pred.priority}
                                </span>
                                <p className="text-[10px] text-gray-500 font-bold">{pred.estimatedDate}</p>
                              </div>
                              <h4 className="text-sm font-black text-white uppercase mb-1 line-clamp-1">{pred.item}</h4>
                              <p className="text-xs text-brand-accent font-bold mb-3">~ {pred.daysLeft} dias restantes</p>
                              
                              <a 
                                href={`https://lista.mercadolivre.com.br/${pred.item.replace(/\s+/g, '-')}-${selectedVehicle?.name || ''}-${selectedVehicle?.model || ''}-${String(selectedVehicle?.year || '').split('/')[0]}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-2 bg-yellow-400 hover:bg-yellow-500 text-brand-primary text-[10px] font-black uppercase rounded-xl transition-colors"
                              >
                                <ExternalLink size={12} /> Comprar Peças
                              </a>
                            </motion.div>
                          )) : (
                            !isLoadingPredictions && <p className="text-xs text-gray-500 italic col-span-3 text-center">Nenhuma previsão disponível para este perfil.</p>
                          )}
                        </div>
                      </div>

                      {/* Fuel Analytics Dashboard */}
                      {fuelAnalytics && fuelAnalytics.data.length > 0 && (
                        <div className="w-full max-w-4xl mb-6">
                           <div className="flex items-center gap-2 mb-4 px-2">
                            <BarChart3 className="text-brand-accent" size={20} />
                            <h3 className="text-lg font-black text-white italic uppercase tracking-tighter">Eficiência e Telemetria</h3>
                           </div>
                           
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                                <div className="flex items-center gap-2 mb-1">
                                  <TrendingUp className="text-green-400" size={14} />
                                  <p className="text-[10px] text-gray-500 font-black uppercase">Consumo Médio</p>
                                </div>
                                <p className="text-2xl font-black text-white">{fuelAnalytics.avgKmL} <span className="text-xs text-gray-500">{getDistanceUnit().toLowerCase()}/{data.settings?.fuelUnit || 'L'}</span></p>
                              </div>
                              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                                <div className="flex items-center gap-2 mb-1">
                                  <TrendingDown className="text-blue-400" size={14} />
                                  <p className="text-[10px] text-gray-500 font-black uppercase">Custo por {getDistanceUnit()}</p>
                                </div>
                                <p className="text-2xl font-black text-white">{formatCurrency(Number(fuelAnalytics.avgCostKm))}</p>
                              </div>
                              <div className="bg-brand-primary/10 border border-brand-primary/20 p-4 rounded-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-110 transition-transform">
                                  <Droplets size={48} className="text-brand-primary" />
                                </div>
                                <p className="text-[9px] text-brand-primary font-black uppercase mb-1">Status de Combustão</p>
                                <p className="text-[11px] text-gray-300 font-bold leading-tight italic">
                                  {fuelInsight || "Calculando eficiência energética..."}
                                </p>
                              </div>
                           </div>

                           <div className="bg-white/5 border border-white/10 p-6 rounded-3xl h-[250px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={fuelAnalytics.data}>
                                  <defs>
                                    <linearGradient id="colorKmL" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#FBFF00" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#FBFF00" stopOpacity={0}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                  <XAxis 
                                    dataKey="date" 
                                    stroke="#555" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false}
                                    tick={{ fontWeight: 'bold' }}
                                  />
                                  <YAxis 
                                    stroke="#555" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false}
                                    unit=" km/L"
                                    domain={['dataMin - 1', 'dataMax + 1']}
                                  />
                                  <Tooltip 
                                    contentStyle={{ 
                                      backgroundColor: '#111', 
                                      border: '1px solid #ffffff10', 
                                      borderRadius: '16px',
                                      fontSize: '12px',
                                      fontWeight: 'bold',
                                      color: '#fff'
                                    }}
                                    itemStyle={{ color: '#FBFF00' }}
                                  />
                                  <Area 
                                    type="monotone" 
                                    dataKey="kmL" 
                                    name="Eficiência (km/L)"
                                    stroke="#FBFF00" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorKmL)" 
                                    animationDuration={2000}
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                           </div>
                        </div>
                      )}

                      {/* Market Strategy Section */}
                      <div className="w-full max-w-4xl mt-6 mb-12">
                        <div className="bg-gradient-to-br from-brand-primary/20 to-brand-accent/5 border border-brand-primary/30 rounded-3xl p-6 relative overflow-hidden">
                          <div className="absolute -right-10 -bottom-10 opacity-5 rotate-12">
                             <Coins size={200} />
                          </div>
                          
                          <div className="relative z-10">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                              <div className="flex items-center gap-3">
                                <div className="bg-brand-primary p-2 rounded-xl">
                                  <BadgePercent className="text-brand-accent" size={24} />
                                </div>
                                <div>
                                  <h3 className="text-xl font-black text-white italic uppercase tracking-tight">Estratégia de Negociação IA</h3>
                                  <p className="text-sm text-gray-400 font-bold">Argumentação de venda baseada em dados reais e saúde do veículo.</p>
                                </div>
                              </div>
                              
                              <button
                                onClick={handleMarketAnalysis}
                                disabled={isAnalyzingMarket}
                                className="px-6 py-3 bg-brand-primary border border-brand-accent/30 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                              >
                                {isAnalyzingMarket ? (
                                  <div className="w-4 h-4 border-2 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <>Analisar Revenda <Coins size={14} /></>
                                )}
                              </button>
                            </div>

                            {marketAnalysis ? (
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-black/20 p-6 rounded-2xl border border-white/5"
                              >
                                <div className="markdown-body text-sm text-gray-200 leading-relaxed font-medium mb-4">
                                  <Markdown>{marketAnalysis}</Markdown>
                                </div>
                                <button 
                                  onClick={() => setMarketAnalysis(null)}
                                  className="text-[10px] font-black uppercase text-gray-500 hover:text-white transition-colors"
                                >
                                  Ocultar Análise
                                </button>
                              </motion.div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                  <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Dica de Especialista</p>
                                  <p className="text-xs text-gray-300 font-bold italic">"O histórico de manutenção completo pode valorizar seu carro em até 15% acima da FIPE."</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                  <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Potencial de Venda</p>
                                  <p className="text-xs text-gray-300 font-bold italic">Analise a saúde técnica para descobrir se você deve pedir premium ou aceitar propostas.</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Finance & TCO Section */}
                      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 mb-12">
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
                           <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="bg-blue-500/20 p-2 rounded-xl">
                                  <Calculator className="text-blue-400" size={20} />
                                </div>
                                <h3 className="text-lg font-black text-white italic uppercase tracking-tight">Finanças & TCO</h3>
                              </div>
                              <button 
                                onClick={handleTCOAnalysis}
                                disabled={isAnalyzingTco}
                                className="text-[10px] font-black uppercase bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-lg border border-blue-500/20 hover:bg-blue-500/20 transition-all"
                              >
                                {isAnalyzingTco ? 'Analisando...' : 'Análise Financeira'}
                              </button>
                           </div>

                           {tcoAnalysis ? (
                             <div className="bg-black/20 p-4 rounded-xl border border-white/5 max-h-[300px] overflow-y-auto custom-scrollbar">
                               <div className="markdown-body text-xs text-gray-300 leading-relaxed font-medium">
                                 <Markdown>{tcoAnalysis}</Markdown>
                               </div>
                             </div>
                           ) : (
                             <p className="text-xs text-gray-500 font-bold italic">
                               Descubra o custo por KM real do seu veículo consolidando gastos de combustível e oficina.
                             </p>
                           )}
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
                           <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="bg-green-500/20 p-2 rounded-xl">
                                  <ShieldCheck className="text-green-400" size={20} />
                                </div>
                                <h3 className="text-lg font-black text-white italic uppercase tracking-tight">Passaporte IA</h3>
                              </div>
                              <button 
                                onClick={handleGeneratePassport}
                                disabled={isGeneratingPassport}
                                className="text-[10px] font-black uppercase bg-green-500/10 text-green-400 px-3 py-1.5 rounded-lg border border-green-500/20 hover:bg-green-500/20 transition-all"
                              >
                                {isGeneratingPassport ? 'Gerando...' : 'Ver Certificado'}
                              </button>
                           </div>

                           {digitalPassport ? (
                             <div className="bg-black/20 p-4 rounded-xl border border-white/5 max-h-[300px] overflow-y-auto custom-scrollbar">
                               <div className="markdown-body text-xs text-gray-300 leading-relaxed font-medium">
                                 <Markdown>{digitalPassport}</Markdown>
                               </div>
                             </div>
                           ) : (
                             <p className="text-xs text-gray-500 font-bold italic">
                               Gere um selo de procedência digital baseado na integridade do seu histórico de manutenção.
                             </p>
                           )}
                        </div>
                      </div>

                      {/* AI Mechanic Section */}
                      <div className="w-full max-w-4xl mt-6">
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Sparkles size={120} className="text-brand-accent rotate-12" />
                          </div>
                          
                          <div className="relative z-10 text-left">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="bg-brand-accent p-2 rounded-xl shadow-[0_0_20px_rgba(255,200,0,0.4)] animate-pulse">
                                <Stethoscope className="text-white" size={24} />
                              </div>
                              <div>
                                <h3 className="text-xl font-black text-white italic uppercase tracking-tight">Mecânico IA de Alta Performance</h3>
                                <p className="text-sm text-gray-400 font-bold">Descreva um problema ou comportamento estranho do veículo.</p>
                              </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-2">
                              <input 
                                type="text"
                                placeholder="Ex: Pedal de freio está trepidando ao pisar forte..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-brand-accent transition-all"
                                value={symptomQuery}
                                onChange={(e) => setSymptomQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleDiagnose()}
                              />
                              <button
                                onClick={handleDiagnose}
                                disabled={isDiagnosing || !symptomQuery}
                                className="bg-brand-accent text-brand-primary p-4 rounded-2xl font-black uppercase italic tracking-tighter disabled:opacity-50 hover:scale-105 transition-transform flex items-center justify-center gap-2"
                              >
                                {isDiagnosing ? (
                                  <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <>Diagnosticar <Sparkles size={16} /></>
                                )}
                              </button>
                            </div>

                            {diagnosisResult && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 bg-brand-primary/20 border border-brand-primary/30 p-6 rounded-2xl"
                              >
                                <div className="markdown-body text-sm text-gray-200 leading-relaxed font-medium">
                                  <Markdown>{diagnosisResult}</Markdown>
                                </div>
                                <button 
                                  onClick={() => setDiagnosisResult(null)}
                                  className="mt-4 text-[10px] font-black uppercase text-gray-500 hover:text-white transition-colors"
                                >
                                  Limpar Diagnóstico
                                </button>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                    </div>
                  </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full border-t border-white/5 pt-2 max-w-4xl">
                  <div className="bg-white/5 p-3 rounded-2xl">
                    <p className="text-gray-500 text-[9px] uppercase font-bold tracking-widest mb-1">Itens</p>
                    <p className="text-2xl font-mono font-black">{selectedVehicle.parts?.length || 0}</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl relative group">
                    <p className="text-gray-500 text-[9px] uppercase font-bold tracking-widest mb-1 flex items-center justify-between">
                      Odômetro
                      {predictCurrentMileage(selectedVehicle) > selectedVehicle.mileage && (
                        <span className="text-[8px] bg-brand-accent p-0.5 px-1.5 rounded-full text-white animate-pulse">ESTIMATIVA IA</span>
                      )}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-2xl font-mono font-black">{predictCurrentMileage(selectedVehicle).toLocaleString()}</p>
                      {predictCurrentMileage(selectedVehicle) > selectedVehicle.mileage && (
                        <span className="text-[10px] text-gray-500 font-bold">km</span>
                      )}
                    </div>
                    {predictCurrentMileage(selectedVehicle) > selectedVehicle.mileage && (
                      <button 
                        onClick={() => updateSelectedVehicle({ mileage: predictCurrentMileage(selectedVehicle) })}
                        className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-brand-primary p-1 rounded-lg text-[8px] font-black text-white uppercase"
                      >
                        Sincronizar
                      </button>
                    )}
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl">
                    <p className="text-gray-500 text-[9px] uppercase font-bold tracking-widest mb-1">Média</p>
                    <p className="text-2xl font-mono font-black text-brand-accent">
                      {(() => {
                        const logs = [...(selectedVehicle.fuelLogs || [])].sort((a, b) => a.mileage - b.mileage);
                        if (logs.length < 2) return '--';
                        const totalKm = logs[logs.length - 1].mileage - logs[0].mileage;
                        const totalL = logs.slice(1).reduce((sum, l) => sum + l.liters, 0);
                        return totalL > 0 ? (totalKm / totalL).toFixed(1) : '--';
                      })()}
                    </p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl">
                    <p className="text-gray-500 text-[9px] uppercase font-bold tracking-widest mb-1">Saúde IA</p>
                    <p className={`text-2xl font-mono font-black ${getVehicleHealth(selectedVehicle) > 80 ? 'text-green-400' : getVehicleHealth(selectedVehicle) > 50 ? 'text-amber-400' : 'text-red-400'}`}>
                      {Math.round(getVehicleHealth(selectedVehicle))}%
                    </p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl">
                    <p className="text-gray-500 text-[9px] uppercase font-bold tracking-widest mb-1">Score Valorização</p>
                    <div className="flex items-center gap-2">
                       <p className={`text-2xl font-mono font-black ${getMaintenanceScore(selectedVehicle) > 85 ? 'text-blue-400' : 'text-gray-400'}`}>
                         {getMaintenanceScore(selectedVehicle)}%
                       </p>
                       <span className="text-[8px] bg-blue-500/20 text-blue-300 px-1 py-0.5 rounded uppercase font-bold">Premium</span>
                    </div>
                  </div>
                  <motion.div 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => updateFipeValue(selectedVehicle.id)}
                    className="bg-white/5 p-3 rounded-2xl cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <p className="text-gray-500 text-[9px] uppercase font-bold tracking-widest mb-1 flex justify-between items-center">
                      {marketRef}
                      <RefreshCw size={8} className={isUpdatingFipe ? "animate-spin text-brand-accent" : "text-gray-600"} />
                    </p>
                    <div className="flex items-center gap-2">
                       <p className="text-2xl font-mono font-black text-green-400">
                         {formatCurrency(selectedVehicle.fipeValue || 0)}
                       </p>
                    </div>
                  </motion.div>
                </div>

                {/* Health Progress Bar */}
                <div className="w-full max-w-4xl mt-3 mb-1">
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${getVehicleHealth(selectedVehicle)}%` }}
                      className={`h-full rounded-full ${getVehicleHealth(selectedVehicle) > 80 ? 'bg-green-500' : getVehicleHealth(selectedVehicle) > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ boxShadow: '0 0 10px rgba(0,0,0,0.5)' }}
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-2 w-full max-w-2xl overflow-x-auto pb-2 scrollbar-hide">
                  <button 
                    onClick={() => setIsAddingPart(true)}
                    className="flex-1 bg-brand-accent hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand-accent/20 whitespace-nowrap text-sm flex items-center justify-center gap-2"
                  >
                    <Plus size={18} /> Catalogar Peça
                  </button>
                  <button 
                    onClick={() => setIsBudgetOpen(true)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold border border-white/10 transition-all whitespace-nowrap text-sm flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={18} /> Carrinho ({(selectedVehicle.parts || []).filter(p => p.isInBudget).length})
                  </button>
                  <button 
                    onClick={() => {
                      setSimulationMileage(selectedVehicle.mileage + 10000);
                      setSimulationResults([]);
                      setIsSimulating(true);
                    }}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold border border-white/10 transition-all whitespace-nowrap text-sm flex items-center justify-center gap-2"
                  >
                    <Activity size={18} /> Simular
                  </button>
                </div>
              </div>
              
              <div className="absolute top-0 left-0 w-64 h-64 bg-brand-accent/10 rounded-full -ml-32 -mt-32 blur-[100px]"></div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-primary/20 rounded-full -mr-32 -mb-32 blur-[100px]"></div>
            </div>

            {/* Tab Navigation */}
            <div className="flex overflow-x-auto gap-2 pb-1 -mx-1 scrollbar-hide">
              {[
                { id: 'parts', label: 'Componentes', icon: Box },
                { id: 'services', label: 'Serviços', icon: Wrench },
                { id: 'tires', label: 'Pneus', icon: Disc },
                { id: 'fuel', label: 'Consumo', icon: Gauge },
                { id: 'intelligence', label: 'Inteligência', icon: Cpu },
                { id: 'manual', label: 'Manual', icon: Book },
                { id: 'reminders', label: 'Alertas', icon: Bell },
                { id: 'audit', label: 'Auditoria', icon: ShieldCheck },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all font-bold text-xs ${
                    activeTab === tab.id 
                    ? 'bg-brand-primary text-white shadow-lg' 
                    : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100 shadow-sm'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Conditional Content based on Active Tab */}
            {activeTab === 'parts' && (
                <PartsTab 
                  vehicle={selectedVehicle}
                  onAddPart={() => setIsAddingPart(true)}
                  onDeleteItem={deletePart}
                  onToggleBudget={togglePartBudget}
                  predictCurrentMileage={predictCurrentMileage}
                  formatCurrency={formatCurrency}
                />
              )}

            {/* Services History Tab */}
            {activeTab === 'tires' && (
              <TiresTab 
                tireSets={selectedVehicle.tireSets || []}
                currentMileage={predictCurrentMileage(selectedVehicle)}
                usageProfile={selectedVehicle.usageProfile || 'mixed'}
                onAddTire={addTireSet}
                onDeleteTire={deleteTireSet}
                onUpdateTire={updateTireSet}
              />
            )}

            {activeTab === 'services' && (
                <ServicesTab 
                  services={selectedVehicle.services || []}
                  onAddService={() => setIsAddingService(true)}
                  onDeleteItem={(id) => handleDeleteItem('service', id)}
                  formatCurrency={formatCurrency}
                />
              )}

            {activeTab === 'fuel' && (
                <FuelTab 
                  fuelLogs={selectedVehicle.fuelLogs || []}
                  onAddFuel={() => setIsAddingFuel(true)}
                  onDeleteItem={(id) => handleDeleteItem('fuel', id)}
                  formatCurrency={formatCurrency}
                />
              )}

            {activeTab === 'reminders' && (
                <RemindersTab 
                  reminders={selectedVehicle.reminders || []}
                  onAddReminder={() => setIsAddingReminder(true)}
                  onDeleteItem={(id) => handleDeleteItem('reminder', id)}
                  onToggleReminder={toggleReminder}
                />
              )}

            {activeTab === 'intelligence' && (
                <IntelligenceTab 
                  vehicle={selectedVehicle}
                  symptomQuery={symptomQuery}
                  setSymptomQuery={setSymptomQuery}
                  runDiagnosis={handleDiagnose}
                  isDiagnosing={isDiagnosing}
                  diagnosisResult={diagnosisResult}
                  runTCOAnalysis={handleTCOAnalysis}
                  isAnalyzingTco={isAnalyzingTco}
                  tcoAnalysis={tcoAnalysis}
                  createdAt={selectedVehicle.createdAt}
                />
              )}

            {activeTab === 'manual' && (
                <ManualTab 
                  vehicle={selectedVehicle}
                  isUploadingPDF={isUploadingPDF}
                  isGeneratingManual={isGeneratingManual}
                  onPDFUpload={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleManualPDFUpload(file);
                  }}
                  onGenerateManual={generateManualInfo}
                  manualChatQuery={manualChatQuery}
                  setManualChatQuery={setManualChatQuery}
                  onSendManualChat={() => chatWithManual(manualChatQuery)}
                  isChattingWithManual={isChattingWithManual}
                  manualChatResponse={manualChatResponse || null}
                  manualPDFInputRef={manualPDFInputRef}
                />
              )}
            {activeTab === 'audit' && (
                <AuditTab 
                  vehicle={selectedVehicle}
                  digitalPassport={digitalPassport}
                  onGeneratePassport={handleGeneratePassport}
                  isGeneratingPassport={isGeneratingPassport}
                  healthScore={selectedVehicle.healthScore || 0}
                />
              )}
          </motion.div>
        )}
      </div>

      {/* MODAL: Add/Edit Vehicle */}
      <VehicleFormModal 
        isOpen={isAddingVehicle || isEditingVehicle}
        onClose={() => {
           setIsAddingVehicle(false);
           setIsEditingVehicle(false);
        }}
        isEditing={isEditingVehicle}
        newVehicle={newVehicle}
        setNewVehicle={setNewVehicle}
        onConfirm={isEditingVehicle ? updateVehicle : addVehicle}
        showInternalBrowser={showInternalBrowser}
        setShowInternalBrowser={setShowInternalBrowser}
        internalBrowserUrl={internalBrowserUrl}
        setInternalBrowserUrl={setInternalBrowserUrl}
        searchPortals={searchPortals}
        isSearchingPlate={isSearchingPlate}
        searchVehicleByPlate={searchVehicleByPlate}
        rawPastedData={rawPastedData}
        setRawPastedData={setRawPastedData}
        handleAssistedProcess={handleAssistedProcess}
        isProcessingAssisted={isProcessingAssisted}
        handleRemoveBackground={onRemoveBackgroundWrapper}
        isRemovingBackground={isRemovingBackground}
        searchImage={searchImage}
        isSearchingImage={isSearchingImage}
        handleCaptureFromClipboard={captureFromExternal}
        robotLogs={robotLogs}
        robotLogsEndRef={robotLogsEndRef}
        plateSearchStatus={plateSearchStatus}
        currentCountry={currentCountry}
      />




      {/* MODAL: Add Service */}
      <AddServiceModal 
        isOpen={isAddingService}
        onClose={() => setIsAddingService(false)}
        newService={newService}
        setNewService={setNewService}
        newServicePart={newServicePart}
        setNewServicePart={setNewServicePart}
        vehicleParts={selectedVehicle?.parts || []}
        onAddService={addService}
        onOpenAddPartCatalog={(name) => {
          setIsAddingPart(true);
          setNewPartName(name);
        }}
        vehicleNameModel={`${selectedVehicle?.name} ${selectedVehicle?.model}`}
      />

      {/* MODAL: Add Fuel */}
      <AddFuelModal 
        isOpen={isAddingFuel}
        onClose={() => setIsAddingFuel(false)}
        newFuel={newFuel}
        setNewFuel={setNewFuel}
        onAddFuel={addFuel}
      />

      {/* MODAL: Add Reminder */}
      <AddReminderModal 
        isOpen={isAddingReminder}
        onClose={() => setIsAddingReminder(false)}
        newReminder={newReminder}
        setNewReminder={setNewReminder}
        onAddReminder={addReminder}
      />

      {/* MODAL: Add Part with AI Research */}
      <AddPartModal 
        isOpen={isAddingPart}
        onClose={() => setIsAddingPart(false)}
        newPartName={newPartName}
        setNewPartName={setNewPartName}
        aiSuggestions={aiSuggestions}
        setAiSuggestions={setAiSuggestions}
        isResearching={isResearching}
        onAddPart={addPart}
        onOpenDictionary={() => setIsDictionaryOpen(true)}
      />

      {/* MODAL: Maintenance Simulation */}
      <MaintenanceSimulationModal 
        isOpen={isSimulating}
        onClose={() => setIsSimulating(false)}
        selectedVehicle={selectedVehicle}
        simulationMileage={simulationMileage}
        setSimulationMileage={setSimulationMileage}
        simulationResults={simulationResults}
        isCalculatingSimulation={isCalculatingSimulation}
        onRunSimulation={() => runSimulation(simulationMileage)}
      />
      {/* MODAL: Budget */}
      <AnimatePresence>
        {isBudgetOpen && selectedVehicle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBudgetOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded p-8 w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-brand-accent p-2 rounded text-white">
                    <ShoppingCart size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Orçamento de Manutenção</h2>
                    <p className="text-xs text-gray-400 font-bold uppercase">{selectedVehicle.name} {selectedVehicle.model}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsBudgetOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-3 mb-6">
                {(selectedVehicle.parts || []).filter(p => p.isInBudget).length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Calculator size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Nenhuma peça adicionada ao orçamento.</p>
                    <p className="text-xs">Clique no ícone de cifrão ($) em uma peça para estimar o preço e adicionar aqui.</p>
                  </div>
                ) : (
                  (selectedVehicle.parts || []).filter(p => p.isInBudget).map((part) => (
                    <div key={part.id} className="flex items-center justify-between p-4 bg-gray-50 rounded border border-gray-100">
                      <div>
                        <p className="font-bold">{part.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{part.code}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <input 
                            type="number"
                            className="w-24 bg-white border border-gray-200 rounded-lg px-2 py-1 text-sm font-mono font-bold text-right focus:ring-1 focus:ring-brand-accent focus:outline-none"
                            value={part.estimatedPrice || 0}
                            onChange={(e) => updatePartPrice(part.id, Number(e.target.value))}
                          />
                          <p className="text-[9px] text-gray-400 font-bold uppercase mr-1 mt-1">Preço (R$)</p>
                        </div>
                        <button 
                          onClick={() => togglePartBudget(part.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-gray-100 pt-6">
                <div className="flex justify-between items-center bg-brand-primary text-white p-6 rounded shadow-xl">
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Total Estimado</p>
                    <h3 className="text-3xl font-mono font-black tracking-tighter">
                      R$ {(selectedVehicle.parts || [])
                        .filter(p => p.isInBudget)
                        .reduce((sum, p) => sum + (p.estimatedPrice || 0), 0)
                        .toLocaleString()}
                    </h3>
                  </div>
                  <button 
                    onClick={() => {
                        alert('Recurso em desenvolvimento: Exportação de PDF/Relatório de Orçamento.');
                    }}
                    className="bg-brand-accent hover:bg-red-700 text-white px-6 py-3 rounded font-bold transition-all flex items-center gap-2"
                  >
                    <Download size={18} /> Salvar PDF
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* MODAL: Settings */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded p-8 w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="flex justify-between items-center mb-8 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="bg-brand-primary p-2 rounded text-white">
                    <Settings size={24} />
                  </div>
                  <h2 className="text-2xl font-bold">Configurações</h2>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-2 flex items-center gap-2">
                    <Smartphone size={14} /> Nome do Aplicativo
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ex: Meu Carro Top"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-brand-accent transition-all text-sm font-bold"
                    value={data.settings?.appName || ''}
                    onChange={(e) => {
                      const newData = { 
                        ...data, 
                        settings: { ...data.settings, appName: e.target.value } 
                      };
                      handleSave(newData);
                    }}
                  />
                </div>

                {/* Data Management Section */}
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-3 flex items-center gap-2">
                    <Database size={14} /> Gestão de Dados (Backup)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => storageService.exportData()}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-600 hover:border-brand-primary/30 hover:text-brand-primary transition-all"
                    >
                      <Download size={16} /> Exportar Backup
                    </button>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-600 hover:border-brand-primary/30 hover:text-brand-primary transition-all"
                    >
                      <Upload size={16} /> Importar Backup
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-2 flex items-center gap-2">
                    <Activity size={14} /> Ícone do App
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {Object.entries(ICON_OPTIONS).map(([name, Icon]) => (
                      <button
                        key={name}
                        onClick={() => {
                          const newData = { 
                            ...data, 
                            settings: { ...data.settings, appIcon: name } 
                          };
                          handleSave(newData);
                        }}
                        className={`aspect-square rounded-xl border-2 transition-all flex items-center justify-center ${
                          (data.settings?.appIcon || 'Cpu') === name 
                            ? 'border-brand-accent bg-brand-accent/5' 
                            : 'border-transparent bg-gray-50 hover:border-gray-200'
                        }`}
                      >
                        <Icon size={18} className={(data.settings?.appIcon || 'Cpu') === name ? 'text-brand-accent' : 'text-gray-400'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-2 flex items-center gap-2">
                    <Palette size={14} /> Tema Visual
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {(Object.keys(THEMES) as Array<keyof typeof THEMES>).map((themeKey) => (
                      <button
                        key={themeKey}
                        onClick={() => {
                          const newData = { 
                            ...data, 
                            settings: { ...data.settings, theme: themeKey } 
                          };
                          handleSave(newData);
                        }}
                        className={`aspect-square rounded-xl border-2 transition-all flex items-center justify-center ${
                          (data.settings?.theme || 'default') === themeKey 
                            ? 'border-brand-accent ring-2 ring-brand-accent/20' 
                            : 'border-transparent hover:border-gray-200'
                        }`}
                        style={{ backgroundColor: THEMES[themeKey].bg }}
                        title={themeKey}
                      >
                        <div 
                          className="w-4 h-4 rounded-full shadow-sm"
                          style={{ backgroundColor: THEMES[themeKey].accent }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-2">Chave de API Gemini</label>
                  <input 
                    type="password" 
                    placeholder="Cole sua chave aqui..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-brand-accent transition-all text-sm font-mono"
                    value={data.settings?.geminiApiKey || ''}
                    onChange={(e) => {
                      const newData = { 
                        ...data, 
                        settings: { ...data.settings, geminiApiKey: e.target.value } 
                      };
                      handleSave(newData);
                    }}
                  />
                  <div className="mt-4">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-2">Token da API Brasil para Busca de Placa (opcional)</label>
                    <input
                      type="password"
                      placeholder="Cole sua chave da API Brasil..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-brand-accent transition-all text-sm font-mono"
                      value={data.settings?.plateApiKey || ''}
                      onChange={(e) => {
                        const newData = {
                          ...data,
                          settings: { ...data.settings, plateApiKey: e.target.value }
                        };
                        handleSave(newData);
                      }}
                    />
                  </div>
                  <div className="mt-4">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-2">Device Token da API Brasil (opcional)</label>
                    <input
                      type="password"
                      placeholder="Cole seu Device Token da API Brasil..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-brand-accent transition-all text-sm font-mono"
                      value={data.settings?.apiBrasilDeviceToken || ''}
                      onChange={(e) => {
                        const newData = {
                          ...data,
                          settings: { ...data.settings, apiBrasilDeviceToken: e.target.value }
                        };
                        handleSave(newData);
                      }}
                    />
                  </div>
                  <div className="mt-4">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-2">URL do backend de placa (opcional)</label>
                    <input
                      type="text"
                      placeholder="Ex: http://localhost:3000"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-brand-accent transition-all text-sm font-mono"
                      value={data.settings?.plateApiHost || ''}
                      onChange={(e) => {
                        const newData = {
                          ...data,
                          settings: { ...data.settings, plateApiHost: e.target.value }
                        };
                        handleSave(newData);
                      }}
                    />
                    <p className="text-[10px] text-gray-400 mt-2">
                      <strong>Recomendado:</strong> Configure um backend próprio que chame a API SINESP (ex: consultaplaca-api). A chamada direta ao SINESP pode falhar por limitações de CORS. Se configurar o backend local, o app tentará usá-lo primeiro, depois SINESP direto como fallback, e por fim o Gemini.
                    </p>
                  </div>
                  <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                    <p className="text-xs font-bold text-blue-900 mb-2">ℹ️ DICA: Configurar Backend Local SINESP</p>
                    <p className="text-[10px] text-blue-800 leading-relaxed mb-2">
                      Para que a busca por placa funcione de forma confiável, crie um backend Node.js/Express que:
                    </p>
                    <ul className="text-[10px] text-blue-800 leading-relaxed list-disc list-inside space-y-1">
                      <li>Receba POST em <code className="bg-white px-1 rounded text-blue-600">/consultar-placa</code> com JSON: <code className="bg-white px-1 rounded text-blue-600">{'{placa: "ABC1234"}'}</code></li>
                      <li>Chame a API SINESP no servidor (sem CORS)</li>
                      <li>Retorne: <code className="bg-white px-1 rounded text-blue-600">{'{marca: "Toyota", modelo: "Corolla", ano: "2020"}'}</code></li>
                    </ul>
                    <p className="text-[10px] text-blue-700 mt-2">Referência: <span className="font-mono">github.com/giovannijoao/consultaplaca-api</span></p>
                  </div>

                  <div className="mt-4 p-4 bg-brand-accent/5 rounded-2xl border border-brand-accent/10">
                    <p className="text-xs text-brand-primary leading-relaxed">
                      Para que as funcionalidades de IA funcionem de forma independente (como em um APK), você precisa de uma chave própria.
                    </p>
                    <a 
                      href="https://aistudio.google.com/app/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-brand-accent text-xs font-bold mt-2 inline-flex items-center gap-1 hover:underline underline-offset-2"
                    >
                      Criar minha Chave Grátis no Google AI Studio <ChevronRight size={12} />
                    </a>
                  </div>
                </div>

                {/* Global Context Section */}
                <div className="pt-4 border-t border-gray-100">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-4 flex items-center gap-2">
                    <Globe size={14} /> Regionalização & Unidades
                  </label>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400">Moeda</label>
                        <select 
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-brand-accent outline-none"
                          value={data.settings?.currency || 'BRL'}
                          onChange={(e) => {
                            const newData = { ...data, settings: { ...data.settings, currency: e.target.value as any } };
                            handleSave(newData);
                          }}
                        >
                          <option value="BRL">Real (R$)</option>
                          <option value="USD">Dólar ($)</option>
                          <option value="EUR">Euro (€)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400">Unidade Distância</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['km', 'mi'].map(unit => (
                            <button
                              key={unit}
                              type="button"
                              onClick={() => {
                                const newData = { ...data, settings: { ...data.settings, distanceUnit: unit as any } };
                                handleSave(newData);
                              }}
                              className={`p-3 rounded-xl border text-[10px] font-black uppercase transition-all ${
                                (data.settings?.distanceUnit || 'km') === unit 
                                ? 'bg-brand-primary border-brand-primary text-white shadow-md' 
                                : 'bg-white border-gray-100 text-gray-400 hover:border-brand-primary/30'
                              }`}
                            >
                              {unit}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400">Região do Robô Extrator (Pop-up)</label>
                      <div className="grid grid-cols-2 gap-2">
                        {COUNTRIES.map(country => (
                          <button
                            key={country.id}
                            type="button"
                            onClick={() => {
                              const newData = { 
                                ...data, 
                                settings: { 
                                  ...data.settings!, 
                                  countryId: country.id 
                                } 
                              };
                              handleSave(newData);
                            }}
                            className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                              (data.settings?.countryId || 'BR') === country.id 
                                ? 'bg-brand-accent border-brand-accent text-white shadow-md' 
                                : 'bg-white border-gray-100 text-gray-400 hover:border-brand-accent/30'
                            }`}
                          >
                            <span className="text-xl">{country.flag}</span>
                            <span className="text-[10px] font-black uppercase">{country.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400">Idioma & Região (Contexto IA)</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'pt-BR', label: 'BR', region: 'Brasil' },
                          { id: 'en-US', label: 'US', region: 'USA' },
                          { id: 'es-ES', label: 'ES', region: 'Europe' }
                        ].map(opt => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              const newData = { 
                                ...data, 
                                settings: { 
                                  ...data.settings, 
                                  language: opt.id as any,
                                  region: opt.region
                                } 
                              };
                              handleSave(newData);
                            }}
                            className={`p-3 rounded-xl border flex flex-col items-center transition-all ${
                              (data.settings?.language || 'pt-BR') === opt.id 
                                ? 'bg-brand-primary border-brand-primary text-white shadow-md' 
                                : 'bg-white border-gray-100 text-gray-400 hover:border-brand-primary/30'
                            }`}
                          >
                            <span className="text-[10px] font-black">{opt.label}</span>
                            <span className="text-[8px] font-bold opacity-60">{opt.region}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1 block flex items-center gap-2">
                       <Link size={14} /> Links de Consulta Personalizados
                    </label>
                    <button 
                      onClick={() => {
                        const name = prompt('Nome do Site:');
                        const url = prompt('URL do Site (use {placa} para substituir pela placa):', 'https://');
                        if (name && url) {
                          const newLink: VehicleSearchLink = {
                            id: crypto.randomUUID(),
                            name,
                            url,
                            color: 'brand'
                          };
                          const updatedLinks = [...(data.settings?.searchLinks || DEFAULT_SEARCH_LINKS), newLink];
                          handleSave({
                            ...data,
                            settings: { ...data.settings, searchLinks: updatedLinks }
                          });
                        }
                      }}
                      className="text-[10px] font-bold text-brand-primary hover:underline"
                    >
                      + ADICIONAR SITE
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(data.settings?.searchLinks || DEFAULT_SEARCH_LINKS).map((link, idx) => (
                      <div key={link.id} className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-between group">
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{link.name}</p>
                          <p className="text-[9px] text-gray-400 truncate max-w-[180px]">{link.url}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              const newLinks = (data.settings?.searchLinks || DEFAULT_SEARCH_LINKS).filter(l => l.id !== link.id);
                              handleSave({
                                ...data,
                                settings: { ...data.settings, searchLinks: newLinks }
                              });
                            }}
                            className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                            title="Remover"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 text-center">
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-4">Privacidade</p>
                  <p className="text-xs text-gray-500">
                    Sua chave é salva apenas localmente no seu dispositivo e nunca é enviada para nossos servidores.
                  </p>
                </div>
              </div>
              
              <div className="pt-6 shrink-0">
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-full py-4 bg-brand-primary text-white font-bold rounded hover:bg-brand-accent transition-all shadow-lg"
                >
                  Salvar e Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* MODAL: Dictionary */}
      <AnimatePresence>
        {isDictionaryOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDictionaryOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded p-8 w-full max-w-4xl shadow-2xl h-[80vh] flex flex-col"
            >
              <div className="flex justify-between items-center mb-8 shrink-0">
                <div className="flex items-center gap-3">
                   <div className="bg-brand-accent p-2 rounded-xl text-white block">
                     <Book size={24} />
                   </div>
                   <div>
                     <h2 className="text-2xl font-black">Dicionário Técnico</h2>
                     <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Catálogo de Componentes Comuns</p>
                   </div>
                </div>
                <button 
                  onClick={() => setIsDictionaryOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-8 scrollbar-thin scrollbar-thumb-gray-200">
                {AUTO_DICTIONARY.map((category) => (
                  <div key={category.name}>
                    <h3 className="text-sm font-black text-brand-accent uppercase tracking-tighter mb-4 flex items-center gap-2">
                       <span className="w-8 h-[2px] bg-brand-accent/20"></span>
                       {category.name}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {category.parts.map((part) => (
                           <button
                             key={part.name}
                             onClick={() => {
                               setNewPartName(part.name);
                               setIsAddingPart(true);
                               setIsDictionaryOpen(false);
                             }}
                             className="text-left bg-gray-50 hover:bg-brand-accent hover:text-white border border-gray-100 rounded-xl p-4 transition-all group"
                           >
                              <p className="text-sm font-bold tracking-tight">{part.name}</p>
                              <p className="text-[10px] opacity-60 font-mono mt-1 group-hover:opacity-100">Vida: {part.lifecycle.toLocaleString()} km</p>
                           </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 text-center shrink-0">
                 <p className="text-gray-400 text-xs italic">
                  Este dicionário contém os componentes mais comuns. Você também pode digitar manualmente qualquer outra peça na tela anterior.
                 </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Professional Service Report Modal */}
      <AnimatePresence>
        {selectedServiceForReport && selectedVehicle && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col my-8"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="bg-brand-primary text-white p-2 rounded-xl">
                    <FileText size={20} />
                  </div>
                  <h2 className="text-xl font-black text-brand-primary tracking-tight">Relatório Técnico de Manutenção</h2>
                </div>
                <button onClick={() => setSelectedServiceForReport(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors font-bold">
                  FECHAR
                </button>
              </div>

              {/* Report Content (Printable Layout) */}
              <div className="flex-1 p-8 bg-white" id="service-report-content">
                {/* Workshop Header */}
                <div className="flex justify-between items-start border-b-4 border-brand-primary pb-6 mb-8">
                  <div>
                    <h3 className="text-3xl font-black text-brand-primary uppercase tracking-tighter mb-1 leading-none">{selectedServiceForReport.workshopName}</h3>
                    <p className="text-sm text-gray-500 font-bold mt-2">{selectedServiceForReport.workshopAddress || 'Endereço não informado'}</p>
                    <p className="text-sm text-gray-500 font-bold">Fone: {selectedServiceForReport.workshopPhone || 'Não informado'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Cód. Registro</p>
                    <p className="text-sm font-mono font-bold bg-gray-100 p-1 px-3 rounded text-brand-primary">#{selectedServiceForReport.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-[9px] text-gray-300 mt-2 font-bold uppercase tracking-widest leading-none">Original Digital</p>
                  </div>
                </div>

                {/* Vehicle & Customer Info */}
                <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-100">
                  <div>
                    <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-3 border-l-2 border-brand-accent pl-2">Dados do Veículo</h4>
                    <p className="text-xl font-black text-gray-800">{selectedVehicle.name}</p>
                    <p className="text-sm text-gray-500 font-bold">{selectedVehicle.model} — {selectedVehicle.year}</p>
                    <p className="text-xs font-mono font-bold mt-2 bg-gray-100 inline-block px-3 py-1 rounded text-gray-600">PLACA: {selectedVehicle.plate?.toUpperCase() || 'NÃO INF'}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-3 border-l-2 border-brand-accent pl-2">Informações da OS</h4>
                    <p className="text-sm font-bold text-gray-600 mb-1">Execução: <span className="font-black text-brand-primary">{new Date(selectedServiceForReport.date).toLocaleDateString('pt-BR')}</span></p>
                    <p className="text-sm font-bold text-gray-600 mb-1">Quilometragem: <span className="font-mono font-black">{selectedServiceForReport.mileage.toLocaleString()} KM</span></p>
                    <p className="text-sm font-bold text-gray-600">Técnico: <span className="italic font-black opacity-70">{selectedServiceForReport.mechanicName || 'Equipe Técnica'}</span></p>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">Descrição dos Serviços</h4>
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 text-gray-700 whitespace-pre-wrap text-sm leading-relaxed min-h-[80px]">
                    {selectedServiceForReport.description}
                  </div>
                </div>

                {/* Parts Table */}
                {selectedServiceForReport.partsList && selectedServiceForReport.partsList.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-3">Peças e Insumos</h4>
                    <div className="border border-gray-100 rounded-2xl overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="py-3 px-4 text-[10px] font-black text-gray-400 uppercase">Item</th>
                            <th className="py-3 px-4 text-[10px] font-black text-gray-400 uppercase text-center">Qtd</th>
                            <th className="py-3 px-4 text-[10px] font-black text-gray-400 uppercase text-right">Unitário</th>
                            <th className="py-3 px-4 text-[10px] font-black text-gray-400 uppercase text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(selectedServiceForReport.partsList || []).map(item => (
                            <tr key={item.id} className="border-t border-gray-50">
                              <td className="py-4 px-4">
                                <p className="text-sm font-bold text-gray-800">{item.name}</p>
                                {item.observation && (
                                  <p className="text-[10px] text-brand-accent italic font-bold mt-1 max-w-[250px]">
                                    Nota: {item.observation}
                                  </p>
                                )}
                              </td>
                              <td className="py-4 px-4 text-sm font-mono text-center">{item.quantity}</td>
                              <td className="py-4 px-4 text-sm font-mono text-right">R$ {item.unitPrice.toLocaleString()}</td>
                              <td className="py-4 px-4 text-sm font-mono font-black text-right text-brand-primary">R$ {(item.quantity * item.unitPrice).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Totals Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    {selectedServiceForReport.notes && (
                      <div className="p-4 bg-yellow-50/50 rounded-2xl border border-yellow-100">
                        <p className="text-[9px] font-black text-yellow-600 uppercase tracking-widest mb-1">Notas da Oficina</p>
                        <p className="text-xs text-yellow-800 italic leading-snug">{selectedServiceForReport.notes}</p>
                      </div>
                    )}
                    <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                       <div className="flex-1">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Mão de Obra</p>
                          <p className="text-sm font-mono font-black text-gray-700">R$ {selectedServiceForReport.laborCost.toLocaleString()}</p>
                       </div>
                       <div className="flex-1">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Peças</p>
                          <p className="text-sm font-mono font-black text-gray-700">R$ {(selectedServiceForReport.cost - selectedServiceForReport.laborCost).toLocaleString()}</p>
                       </div>
                    </div>
                  </div>
                  <div className="bg-brand-primary text-white p-6 rounded-3xl flex flex-col justify-center items-center md:items-end shadow-xl shadow-brand-primary/20">
                    <p className="text-[11px] font-bold uppercase tracking-widest opacity-80 mb-2">Total Geral do Serviço</p>
                    <p className="text-4xl font-mono font-black tracking-tighter">R$ {selectedServiceForReport.cost.toLocaleString()}</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 opacity-40 grayscale">
                  <div className="flex items-center gap-3">
                    <Activity size={24} />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-tighter">Powered by AutoTech</p>
                      <p className="text-[8px] font-bold uppercase tracking-widest">Gestão Inteligente de Veículos</p>
                    </div>
                  </div>
                  <p className="text-[9px] font-mono font-bold italic">
                    Assinado em: {new Date(selectedServiceForReport.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-4">
                <button 
                  onClick={() => window.print()}
                  className="flex-1 bg-brand-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-accent transition-all shadow-lg"
                >
                  <Download size={20} /> Baixar PDF / Imprimir
                </button>
                <button 
                  onClick={() => {
                    const text = `RELATÓRIO DE MANUTENÇÃO\nOficina: ${selectedServiceForReport.workshopName}\nVeículo: ${selectedVehicle.name}\nValor Total: R$ ${selectedServiceForReport.cost.toLocaleString()}`;
                    navigator.clipboard.writeText(text);
                    alert('Resumo copiado!');
                  }}
                  className="bg-white border border-gray-200 text-gray-600 px-6 rounded-2xl font-bold hover:bg-gray-100 transition-all"
                >
                  Compartilhar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Web Vehicle Search */}
      <AnimatePresence>
        {isWebSearchOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (webSearchMode === 'manual') setIsWebSearchOpen(false);
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col h-[90vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-2xl font-black text-brand-primary tracking-tight">🔍 Consultar Placa em Sites Públicos</h2>
                <button
                  onClick={() => setIsWebSearchOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              {webSearchMode === 'manual' ? (
                <div className="flex-1 flex flex-col">
                  <div className="p-6 bg-blue-50 border-b border-blue-100 space-y-3">
                    <p className="text-sm text-blue-900 mb-3">
                      Escolha uma opção para buscar dados da placa <strong>{newVehicle.plate}</strong>:
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={captureFromExternal}
                        disabled={isCapturingFromWeb}
                        className="flex-1 px-6 py-3 bg-brand-accent text-white font-bold rounded-xl hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isCapturingFromWeb ? (
                          <RefreshCw className="animate-spin" size={18} />
                        ) : (
                          <Zap size={18} />
                        )}
                        {isCapturingFromWeb ? 'Aguardando...' : '🚀 Robô BuscaPlacas'}
                      </button>
                      <a 
                        href={webVehicleSearchService.getSearchPageUrl(newVehicle.plate)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                      >
                        ↗ Abrir em nova aba
                      </a>
                    </div>
                  </div>

                  <iframe 
                    src={webVehicleSearchService.getSearchPageUrl(newVehicle.plate)}
                    className="flex-1 w-full border-0"
                    title="Detetive Veicular"
                  />

                  <div className="p-6 border-t border-gray-100 space-y-3">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-2">Marca</label>
                      <input
                        type="text"
                        placeholder="Ex: Toyota"
                        className="w-full bg-gray-50 border-0 rounded-xl p-4 focus:ring-2 focus:ring-brand-accent"
                        value={newVehicle.name}
                        onChange={(e) => setNewVehicle({...newVehicle, name: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-2">Modelo</label>
                        <input
                          type="text"
                          placeholder="Ex: Corolla XEi"
                          className="w-full bg-gray-50 border-0 rounded-xl p-4 focus:ring-2 focus:ring-brand-accent"
                          value={newVehicle.model}
                          onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-2">Ano</label>
                        <input
                          type="text"
                          placeholder="Ex: 2020/2021"
                          className="w-full bg-gray-50 border-0 rounded-xl p-4 focus:ring-2 focus:ring-brand-accent"
                          value={newVehicle.year}
                          onChange={(e) => setNewVehicle({...newVehicle, year: e.target.value})}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => setIsWebSearchOpen(false)}
                      className="w-full py-4 bg-brand-accent text-white font-bold rounded-xl hover:brightness-110 transition-all text-lg"
                    >
                      ✓ Fechar e continuar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Settings className="animate-spin mx-auto text-brand-accent" size={48} />
                    <p className="text-gray-600">Buscando dados públicos...</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImport} 
        className="hidden" 
        accept=".json,application/json"
      />
      
      {/* Hidden Global Inputs */}
      <input type="file" ref={vehicleImageInputRef} onChange={handleVehicleImageUpload} accept="image/*" className="hidden" />
      <input type="file" ref={brandLogoInputRef} onChange={handleBrandLogoUpload} accept="image/*" className="hidden" />
      <input type="file" ref={importVehicleInputRef} onChange={handleImportVehicle} accept=".json,application/json" className="hidden" />

      {/* MODAL: Confirmação de Exclusão (Substituído por Componente) */}
      <DeleteConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title={itemToDelete?.type === 'vehicle' ? 'Excluir Veículo' : 'Excluir Registro'}
        message={itemToDelete?.type === 'vehicle' 
          ? 'Tem certeza absoluta? Todos os dados, históricos e registros deste veículo serão apagados permanentemente.'
          : 'Deseja remover este registro? Esta ação não pode ser desfeita.'}
      />
    </motion.div>
    </>
  );
}
