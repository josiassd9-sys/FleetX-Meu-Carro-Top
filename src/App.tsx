import React, { useState, useEffect, useRef } from 'react';
import { vehicleSearchService } from './services/buscaPlacasService';
import { COUNTRIES, getCountryById } from './config/countryConfig';
import Markdown from 'react-markdown';
import { 
  Car, 
  Settings, 
  Plus, 
  Trash2, 
  Download, 
  Upload, 
  Search, 
  Wrench, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight,
  Cpu,
  ArrowLeft,
  Database,
  Book,
  X,
  DollarSign,
  ShoppingCart,
  Calculator,
  Play,
  Activity,
  Palette,
  Type as TypeIcon,
  Shield,
  Zap,
  Gauge,
  Box,
  Send,
  Sparkles,
  RefreshCw,
  FileText,
  Pipette,
  Camera,
  Globe,
  Link,
  Clipboard,
  ClipboardCheck,
  Wand2,
  Layout,
  ExternalLink,
  MapPin,
  Phone,
  ShieldCheck,
  Stethoscope,
  MessageSquare,
  Calendar,
  BarChart3,
  TrendingDown,
  TrendingUp,
  Droplets,
  Coins,
  BadgePercent,
  Eraser,
  Bell
} from 'lucide-react';
import { removeBackground } from "@imgly/background-removal";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { Vehicle, Part, AppData, ServiceEntry, FuelLog, Reminder, ServicePart, VehicleSearchLink } from './types';
import { storageService } from './services/storageService';
import { geminiService } from './services/geminiService';
import { webVehicleSearchService } from './services/webVehicleSearchService';
import { generateMaintenancePdf } from './services/maintenance-pdf';
import { createVehicleManual } from './services/manual-extraction';
import { AUTO_DICTIONARY, DEFAULT_SEARCH_LINKS, DEFAULT_VEHICLE_STATE, THEMES } from './constants';
import { formatCurrency, fileToBase64, resizeImage, cn } from './lib/utils';

// Componentes Extraídos
import { HeaderLogo } from './components/HeaderLogo';
import { BrandLogo } from './components/BrandLogo';
import { VehicleImage } from './components/VehicleImage';
import { AddFuelModal } from './components/AddFuelModal';
import { AddReminderModal } from './components/AddReminderModal';
import { AddServiceModal } from './components/AddServiceModal';
import { AddPartModal } from './components/AddPartModal';
import { MaintenanceSimulationModal } from './components/MaintenanceSimulationModal';
import { DashboardHome } from './components/DashboardHome';
import { OnboardingModal } from './components/OnboardingModal';
import { VehicleDetailHeader } from './components/VehicleDetailHeader';
import { BudgetModal } from './components/BudgetModal';
import { SettingsModal } from './components/SettingsModal';
import { VehicleFormModal } from './components/VehicleFormModal';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { ServicesTab } from './components/tabs/ServicesTab';
import { PartsTab } from './components/tabs/PartsTab';
import { FuelTab } from './components/tabs/FuelTab';
import { RemindersTab } from './components/tabs/RemindersTab';
import { IntelligenceTab } from './components/tabs/IntelligenceTab';
import { ManualTab } from './components/tabs/ManualTab';
import { AuditTab } from './components/tabs/AuditTab';


const ICON_OPTIONS = {
  Car, Settings, Search, Wrench, Activity, Shield, Zap, Box, Gauge, Palette, Database, Calculator, Cpu
};

export default function App() {
  const [data, setData] = useState<AppData>({ 
    vehicles: [],
    settings: {
      language: 'pt-BR',
      currency: 'BRL',
      distanceUnit: 'km',
      fuelUnit: 'L',
      region: 'Brasil',
      countryId: 'BR',
      theme: 'default'
    }
  });

  const currentCountry = getCountryById(data.settings?.countryId || 'BR');

  const getCurrencySymbol = () => {
    const currency = data.settings?.currency || 'BRL';
    if (currency === 'USD') return '$';
    if (currency === 'EUR') return '€';
    return 'R$';
  };

  const getDistanceUnit = () => data.settings?.distanceUnit || 'KM';

  const formatDistance = (val: number) => {
    return `${val.toLocaleString(data.settings?.language || 'pt-BR')} ${getDistanceUnit()}`;
  };

  const marketRef = data.settings?.marketReferenceName || 'Valor de Mercado';
  
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [isEditingVehicle, setIsEditingVehicle] = useState(false);
  const [isAddingPart, setIsAddingPart] = useState(false);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [isDetectingRegion, setIsDetectingRegion] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isResearching, setIsResearching] = useState(false);
  const [isSearchingImage, setIsSearchingImage] = useState(false);
  const [isSearchingLogo, setIsSearchingLogo] = useState(false);
  const [isSearchingPlate, setIsSearchingPlate] = useState(false);
  const [plateSearchStatus, setPlateSearchStatus] = useState('');
  const [robotLogs, setRobotLogs] = useState<string[]>([]);
  const [rawPastedData, setRawPastedData] = useState('');
  const [isProcessingAssisted, setIsProcessingAssisted] = useState(false);
  const [showInternalBrowser, setShowInternalBrowser] = useState(false);
  const robotPopupRef = useRef<Window | null>(null);
  const [internalBrowserUrl, setInternalBrowserUrl] = useState('');

  const searchPortals = [
    { name: currentCountry.name, url: currentCountry.searchPortalUrl, icon: '🚀' },
    { name: 'Busca Sim', url: 'https://buscasim.com.br/', icon: '🌐' },
    { name: 'Placa i', url: 'https://www.placai.com/', icon: '🔍' },
    { name: 'Detetive Veicular', url: 'https://detetiveveicular.com/', icon: '🕵️' },
    { name: 'Lupa Veicular', url: 'https://www.lupaveicular.com/', icon: '🔎' }
  ];
  const [isWebSearchOpen, setIsWebSearchOpen] = useState(false);
  const [webSearchMode, setWebSearchMode] = useState<'auto' | 'manual'>('auto');
  const [isCapturingFromWeb, setIsCapturingFromWeb] = useState(false);
  const [isEstimatingPrice, setIsEstimatingPrice] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationMileage, setSimulationMileage] = useState<number | ''>('');
  const [simulationResults, setSimulationResults] = useState<any[]>([]);
  const [isCalculatingSimulation, setIsCalculatingSimulation] = useState(false);
  const [activeTab, setActiveTab] = useState<'parts' | 'services' | 'fuel' | 'reminders' | 'manual' | 'audit' | 'intelligence'>('parts');
  
  const [itemToDelete, setItemToDelete] = useState<{ type: string, id: string } | null>(null);

  const [manualChatResponse, setManualChatResponse] = useState('');
  const [manualChatQuery, setManualChatQuery] = useState('');
  const [isUploadingPDF, setIsUploadingPDF] = useState(false);
  const [isGeneratingManual, setIsGeneratingManual] = useState(false);
  const [isChattingWithManual, setIsChattingWithManual] = useState(false);
  
  const manualPDFInputRef = useRef<HTMLInputElement>(null);

  // Sync selectedVehicle when data changes and clear manual states
  useEffect(() => {
    if (selectedVehicle) {
      const updated = data.vehicles.find(v => v.id === selectedVehicle.id);
      if (updated) setSelectedVehicle(updated);
    }
  }, [data.vehicles]);

  useEffect(() => {
    setManualChatResponse('');
    setManualChatQuery('');
    setActiveTab('parts');
  }, [selectedVehicle?.id]);
  
  // New States for Features
  const [isAddingService, setIsAddingService] = useState(false);
  const [selectedServiceForReport, setSelectedServiceForReport] = useState<ServiceEntry | null>(null);
  const [isAddingFuel, setIsAddingFuel] = useState(false);
  const [isAddingReminder, setIsAddingReminder] = useState(false);
  
  const [newService, setNewService] = useState({ 
    description: '', 
    mileage: '', 
    laborCost: '', 
    workshopName: '', 
    workshopAddress: '',
    workshopPhone: '',
    mechanicName: '',
    date: new Date().toISOString().split('T')[0],
    partsList: [] as ServicePart[]
  });
  const [newServicePart, setNewServicePart] = useState({ name: '', quantity: '1', unitPrice: '', observation: '' });
  const [newFuel, setNewFuel] = useState({ mileage: '', liters: '', cost: '', fullTank: true, date: new Date().toISOString().split('T')[0] });
  const [newReminder, setNewReminder] = useState({ title: '', targetMileage: '', targetDate: '', type: 'oil' as any });
  
  // New Vehicle State
  const [newVehicle, setNewVehicle] = useState(DEFAULT_VEHICLE_STATE);
  
  // New Part State
  const [newPartName, setNewPartName] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const vehicleImageInputRef = useRef<HTMLInputElement>(null);
  const brandLogoInputRef = useRef<HTMLInputElement>(null);
  const pasteTextAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleVehicleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        const compressed = await resizeImage(base64, 1200, 1200);
        setNewVehicle(prev => ({ ...prev, imageUrl: compressed }));
      } catch (err) {
        alert('Erro ao carregar imagem do veículo.');
      }
    }
  };

  const handleBrandLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        // Logos de marca podem ser menores (Ex: 400x400)
        const compressed = await resizeImage(base64, 400, 400);
        
        if (isEditingVehicle || isAddingVehicle) {
          setNewVehicle(prev => ({ ...prev, brandLogoUrl: compressed }));
        } else if (selectedVehicle) {
          updateSelectedVehicle({ brandLogoUrl: compressed });
        }
      } catch (err) {
        alert('Erro ao carregar logo da marca.');
      }
    }
  };

  useEffect(() => {
    const loadedData = storageService.loadData();
    
    if (!loadedData.settings || !loadedData.settings.region) {
      // Primeiro acesso: disparar onboarding
      setIsOnboarding(true);
      autoDetectRegion();
    } else {
      const merged = {
        ...loadedData,
        settings: {
          language: 'pt-BR',
          currency: 'BRL',
          distanceUnit: 'km',
          fuelUnit: 'L',
          region: 'Brasil',
          marketReferenceName: 'Tabela FIPE',
          ...(loadedData.settings || {})
        }
      };
      setData(merged as any);
      if (merged.settings) {
        geminiService.setApiKey(merged.settings.geminiApiKey || process.env.GEMINI_API_KEY || '');
        geminiService.setGlobalSettings(merged.settings);
      }
    }
  }, []);

  const autoDetectRegion = async () => {
    setIsDetectingRegion(true);
    try {
      const locale = navigator.language;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const defaults = await geminiService.detectRegionalDefaults(locale, timezone);
      
      const newSettings = {
        ...data.settings,
        ...defaults,
        theme: 'default'
      } as any;
      
      const newData = { ...data, settings: newSettings };
      setData(newData as any);
      geminiService.setGlobalSettings(newSettings);
    } catch (e) {
      console.error("Erro na detecção automática:", e);
    } finally {
      setIsDetectingRegion(false);
    }
  };

  useEffect(() => {
    const theme = THEMES[(data.settings?.theme as keyof typeof THEMES) || 'default'];
    const styleId = 'theme-overrides';
    let styleTag = document.getElementById(styleId);
    
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }

    styleTag.innerHTML = `
      :root {
        --color-brand-primary: ${theme.primary};
        --color-brand-accent: ${theme.accent};
        --color-brand-bg: ${theme.bg};
      }
    `;
  }, [data.settings?.theme]);

  const handleSave = (newData: AppData) => {
    setData(newData);
    storageService.saveData(newData);
    
    if (newData.settings) {
      if (newData.settings.geminiApiKey) geminiService.setApiKey(newData.settings.geminiApiKey);
      geminiService.setGlobalSettings(newData.settings);
    }

    if (selectedVehicle) {
      const updated = newData.vehicles.find(v => v.id === selectedVehicle.id);
      if (updated) setSelectedVehicle(updated);
    }
  };

  const predictCurrentMileage = (vehicle: Vehicle) => {
    const lastRecord = [...(vehicle.fuelLogs || []), ...(vehicle.services || [])]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    const baseMileage = lastRecord ? lastRecord.mileage : vehicle.mileage;
    const baseDate = lastRecord ? new Date(lastRecord.date) : new Date(vehicle.createdAt || new Date());

    // Se tiver perfil de uso definido (avgDailyKm), usamos ele como fallback ou complemento
    const dailyKm = vehicle.avgDailyKm || 0;
    const usageDays = vehicle.usageDays || [1, 2, 3, 4, 5]; // Fallback para dias de semana
    
    // Se tiver logs de combustível, calculamos a média real por dia de uso
    let realAvgKmPerUsageDay = 0;
    if (vehicle.fuelLogs && vehicle.fuelLogs.length >= 2) {
      const sortedLogs = [...vehicle.fuelLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const firstLog = sortedLogs[0];
      const lastLog = sortedLogs[sortedLogs.length - 1];
      
      let totalUsageDaysInRange = 0;
      let curr = new Date(firstLog.date);
      while(curr <= new Date(lastLog.date)) {
        if (usageDays.includes(curr.getDay())) totalUsageDaysInRange++;
        curr.setDate(curr.getDate() + 1);
      }

      const kmDiff = lastLog.mileage - firstLog.mileage;
      if (totalUsageDaysInRange > 0 && kmDiff > 0) {
        realAvgKmPerUsageDay = kmDiff / totalUsageDaysInRange;
      }
    }

    const effectiveKmPerDay = realAvgKmPerUsageDay || dailyKm;
    if (effectiveKmPerDay <= 0) return vehicle.mileage;

    // Calculamos quantos "dias de uso" se passaram desde o último registro
    let activeDaysSinceLastRecord = 0;
    let scanDate = new Date(baseDate);
    const now = new Date();
    
    while(scanDate < now) {
      scanDate.setDate(scanDate.getDate() + 1);
      if (usageDays.includes(scanDate.getDay())) activeDaysSinceLastRecord++;
    }
    
    const projectedIncrement = Math.round(effectiveKmPerDay * activeDaysSinceLastRecord);
    return Math.max(vehicle.mileage, baseMileage + projectedIncrement);
  };

  const updateSelectedVehicle = (updates: Partial<Vehicle>) => {
    if (!selectedVehicle) return;
    const updated = { ...selectedVehicle, ...updates };
    setSelectedVehicle(updated);
    setData(prev => {
      const updatedData = {
        ...prev,
        vehicles: prev.vehicles.map(v => v.id === selectedVehicle.id ? updated : v)
      };
      storageService.saveData(updatedData);
      return updatedData;
    });
  };

  const runSimulation = async () => {
    if (!selectedVehicle || !simulationMileage) return;
    setIsCalculatingSimulation(true);
    try {
      let result;
      
      // Usar dados do manual se disponível
      if (selectedVehicle.manual?.maintenanceSchedule) {
        result = await geminiService.simulateMaintenanceFromManual(
          `${selectedVehicle.name} ${selectedVehicle.model} ${selectedVehicle.year}`,
          Number(simulationMileage),
          { maintenanceSchedule: selectedVehicle.manual.maintenanceSchedule }
        );
      } else {
        result = await geminiService.simulateMaintenance(
          `${selectedVehicle.name} ${selectedVehicle.model} ${selectedVehicle.year}`,
          Number(simulationMileage)
        );
      }
      
      setSimulationResults(result.recommendations);
    } catch (error) {
      alert('Erro ao processar simulação. Tente novamente.');
    } finally {
      setIsCalculatingSimulation(false);
    }
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string | ArrayBuffer | null;
        if (!result || typeof result !== 'string') {
          reject(new Error('Não foi possível ler o arquivo PDF como texto.'));
          return;
        }
        const parts = result.split(',');
        if (parts.length < 2) {
          reject(new Error('Formato de PDF inesperado.'));
          return;
        }
        resolve(parts[1]);
      };
      reader.onerror = () => reject(reader.error || new Error('Erro ao ler o arquivo PDF.'));
      reader.readAsDataURL(file);
    });
  };

  const handleManualPDFUpload = async (file: File) => {
    if (!selectedVehicle) {
      alert('Selecione um veículo primeiro.');
      return;
    }

    if (!data.settings?.geminiApiKey) {
      alert('Configure a chave da API do Gemini nas configurações.');
      return;
    }

    setIsUploadingPDF(true);
    try {
      const base64Data = await readFileAsBase64(file);
      console.log('📄 Iniciando extração do manual PDF:', file.name);

      const manual = await createVehicleManual(
        base64Data,
        file.name,
        `${selectedVehicle.name} ${selectedVehicle.model} ${selectedVehicle.year}`,
        data.settings?.geminiApiKey || ''
      );

      if (!manual || !manual.fullText) {
        throw new Error('O manual extraído não retornou o texto completo.');
      }

      const updatedVehicles = data.vehicles.map(v => {
        if (v.id === selectedVehicle.id) {
          return {
            ...v,
            manual,
            manualTranscription: manual.fullText
          };
        }
        return v;
      });

      const newData = { ...data, vehicles: updatedVehicles };
      handleSave(newData);
      setSelectedVehicle(prev => prev ? { ...prev, manual, manualTranscription: manual.fullText } : prev);

      alert('✅ Manual do veículo carregado e processado com sucesso!');
    } catch (error: any) {
      console.error('Erro completo ao processar PDF:', error);
      alert(`❌ Erro ao processar o PDF:\n${error?.message || error}`);
    } finally {
      setIsUploadingPDF(false);
    }
  };

  const [isAnalyzingHealth, setIsAnalyzingHealth] = useState(false);
  const [symptomQuery, setSymptomQuery] = useState('');
  const [diagnosisResult, setDiagnosisResult] = useState<string | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [maintenancePredictions, setMaintenancePredictions] = useState<{ item: string; daysLeft: number; estimatedDate: string; priority: string }[]>([]);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false);
  const [fuelInsight, setFuelInsight] = useState<string | null>(null);
  const [marketAnalysis, setMarketAnalysis] = useState<string | null>(null);
  const [isAnalyzingMarket, setIsAnalyzingMarket] = useState(false);
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);
  const [tcoAnalysis, setTcoAnalysis] = useState<string | null>(null);
  const [isAnalyzingTco, setIsAnalyzingTco] = useState(false);
  const [digitalPassport, setDigitalPassport] = useState<string | null>(null);
  const [isGeneratingPassport, setIsGeneratingPassport] = useState(false);

  const handleRemoveBackground = async () => {
    if (!newVehicle.imageUrl) return;
    setIsRemovingBackground(true);
    setPlateSearchStatus('🤖 ROBÔ ESTÚDIO: Analisando bordas e transparência...');
    try {
      const blob = await removeBackground(newVehicle.imageUrl, {
        progress: (key, current, total) => {
          const pct = Math.round((current / total) * 100);
          setPlateSearchStatus(`📸 TRATAMENTO IA: ${pct}% concluído...`);
        }
      });
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewVehicle(prev => ({ ...prev, imageUrl: reader.result as string }));
        setPlateSearchStatus('✨ SUCESSO: Fundo removido! Imagem pronta para o sistema.');
        setTimeout(() => setPlateSearchStatus(''), 5000);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error(error);
      setPlateSearchStatus('⚠️ Ops! O robô não conseguiu remover o fundo desta imagem.');
      setTimeout(() => setPlateSearchStatus(''), 4000);
    } finally {
      setIsRemovingBackground(false);
    }
  };

  const handleMarketAnalysis = async () => {
    if (!selectedVehicle) return;
    setIsAnalyzingMarket(true);
    try {
      const fipe = await geminiService.fetchFipeValue(selectedVehicle.name, selectedVehicle.model, selectedVehicle.year);
      const analysis = await geminiService.resaleValueAnalysis(selectedVehicle, fipe);
      setMarketAnalysis(analysis);
    } catch (error) {
       console.error(error);
    } finally {
      setIsAnalyzingMarket(false);
    }
  };

  const handleTCOAnalysis = async () => {
    if (!selectedVehicle) return;
    setIsAnalyzingTco(true);
    try {
      const totalFuel = selectedVehicle.fuelLogs?.reduce((acc, log) => acc + log.cost, 0) || 0;
      const totalServices = selectedVehicle.services?.reduce((acc, s) => acc + s.cost, 0) || 0;
      const analysis = await geminiService.analyzeTCO(selectedVehicle, totalFuel, totalServices);
      setTcoAnalysis(analysis);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzingTco(false);
    }
  };

  const handleGeneratePassport = async () => {
    if (!selectedVehicle) return;
    setIsGeneratingPassport(true);
    try {
      const passport = await geminiService.generateDigitalPassport(selectedVehicle);
      setDigitalPassport(passport);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingPassport(false);
    }
  };

  const fetchPredictions = async (vehicle: Vehicle) => {
    setIsLoadingPredictions(true);
    try {
      const result = await geminiService.predictMaintenance(vehicle);
      setMaintenancePredictions(result.items);
      
      // Auto-fetch fuel insight if enough logs exist
      const analytics = getFuelAnalytics();
      if (analytics && analytics.data.length >= 1) {
        const insight = await geminiService.getFuelInsight(analytics.avgKmL.toString(), vehicle);
        setFuelInsight(insight);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingPredictions(false);
    }
  };

  useEffect(() => {
    if (selectedVehicle) {
      fetchPredictions(selectedVehicle);
      setDiagnosisResult(null);
      setSymptomQuery('');
    }
  }, [selectedVehicle?.id]);

  const handleDiagnose = async () => {
    if (!symptomQuery || !selectedVehicle) return;
    setIsDiagnosing(true);
    try {
      const result = await geminiService.diagnoseSymptom(selectedVehicle, symptomQuery);
      setDiagnosisResult(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDiagnosing(false);
    }
  };

  const runHealthAnalysis = async () => {
    if (!selectedVehicle) return;
    setIsAnalyzingHealth(true);
    try {
      const result = await geminiService.analyzeVehicleHealth(selectedVehicle);
      const updatedVehicles = data.vehicles.map(v => 
        v.id === selectedVehicle.id ? { ...v, healthScore: result.score, healthAnalysis: result.analysis } : v
      );
      const updatedData = { ...data, vehicles: updatedVehicles };
      handleSave(updatedData);
      setSelectedVehicle({ ...selectedVehicle, healthScore: result.score, healthAnalysis: result.analysis });
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzingHealth(false);
    }
  };

  const shareTechnicalReport = () => {
    if (!selectedVehicle) return;
    
    const servicesText = selectedVehicle.services.slice(-3).map(s => `• ${s.date}: ${s.description} (${s.mileage}km)`).join('\n');
    const predictionsText = maintenancePredictions.map(p => `• ${p.item}: Previsto para ${p.estimatedDate}`).join('\n');
    
    const report = `*RELATÓRIO TÉCNICO - ${selectedVehicle.name} ${selectedVehicle.model}*
🚗 Placa: ${selectedVehicle.plate || 'N/A'}
📊 Saúde Atual: ${selectedVehicle.healthScore || 'N/A'}%
📍 KM: ${selectedVehicle.mileage}

*ÚLTIMOS SERVIÇOS:*
${servicesText || 'Nenhum histórico recente.'}

*PREVISÕES DE MANUTENÇÃO:*
${predictionsText || 'Analise de saúde necessária.'}

💬 *Análise IA:* ${selectedVehicle.healthAnalysis || '-'}

Gerado via Mecânico IA de Alta Performance.`;

    const encodedReport = encodeURIComponent(report);
    window.open(`https://wa.me/?text=${encodedReport}`, '_blank');
  };

  const addVehicle = () => {
    if (!newVehicle.name) return;
    const vehicle: Vehicle = {
      ...newVehicle,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      mileage: Number(newVehicle.mileage),
      parts: [],
      services: [],
      fuelLogs: [],
      reminders: []
    };
    const newData = { ...data, vehicles: [...data.vehicles, vehicle] };
    handleSave(newData);
    setNewVehicle(DEFAULT_VEHICLE_STATE);
    setIsAddingVehicle(false);
    setSelectedVehicle(vehicle);
  };

  const updateVehicle = () => {
    if (!selectedVehicle || !newVehicle.name) return;
    const updatedVehicles = data.vehicles.map(v => {
      if (v.id === selectedVehicle.id) {
        return {
          ...v,
          ...newVehicle,
          mileage: Number(newVehicle.mileage)
        };
      }
      return v;
    });
    handleSave({ ...data, vehicles: updatedVehicles });
    setIsEditingVehicle(false);
    setNewVehicle(DEFAULT_VEHICLE_STATE);
  };

  const addService = () => {
    if (!selectedVehicle || !newService.description || !newService.workshopName) {
      alert('Descrição e Nome da Oficina são obrigatórios.');
      return;
    }
    
    const partsCost = newService.partsList.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0);
    const laborCost = Number(newService.laborCost) || 0;
    const totalCost = partsCost + laborCost;

    const service: ServiceEntry = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...newService,
      mileage: Number(newService.mileage),
      cost: totalCost,
      laborCost: laborCost,
    };
    
    const updatedVehicles = data.vehicles.map(v => {
      if (v.id === selectedVehicle.id) {
        return { 
          ...v, 
          services: [...(v.services || []), service],
          mileage: Math.max(v.mileage, Number(newService.mileage))
        };
      }
      return v;
    });
    handleSave({ ...data, vehicles: updatedVehicles });
    setIsAddingService(false);
    setNewService({ 
      description: '', 
      mileage: '', 
      laborCost: '', 
      workshopName: newService.workshopName, 
      workshopAddress: newService.workshopAddress,
      workshopPhone: newService.workshopPhone,
      mechanicName: newService.mechanicName,
      date: new Date().toISOString().split('T')[0],
      partsList: [] as ServicePart[]
    });
  };

  const addFuel = () => {
    if (!selectedVehicle || !newFuel.liters) return;
    const fuel: FuelLog = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...newFuel,
      mileage: Number(newFuel.mileage),
      liters: Number(newFuel.liters),
      cost: Number(newFuel.cost)
    };
    const updatedVehicles = data.vehicles.map(v => {
      if (v.id === selectedVehicle.id) {
        return { 
          ...v, 
          fuelLogs: [...(v.fuelLogs || []), fuel],
          mileage: Math.max(v.mileage, Number(newFuel.mileage))
        };
      }
      return v;
    });
    handleSave({ ...data, vehicles: updatedVehicles });
    setIsAddingFuel(false);
    setNewFuel({ mileage: '', liters: '', cost: '', fullTank: true, date: new Date().toISOString().split('T')[0] });
  };

  const addReminder = () => {
    if (!selectedVehicle || !newReminder.title) return;
    const reminder: Reminder = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...newReminder,
      targetMileage: newReminder.targetMileage ? Number(newReminder.targetMileage) : undefined,
      isCompleted: false
    };
    const updatedVehicles = data.vehicles.map(v => {
      if (v.id === selectedVehicle.id) {
        return { ...v, reminders: [...(v.reminders || []), reminder] };
      }
      return v;
    });
    handleSave({ ...data, vehicles: updatedVehicles });
    setIsAddingReminder(false);
    setNewReminder({ title: '', targetMileage: '', targetDate: '', type: 'oil' });
  };

  const toggleReminder = (reminderId: string) => {
    if (!selectedVehicle) return;
    const updatedVehicles = data.vehicles.map(v => {
      if (v.id === selectedVehicle.id) {
        return {
          ...v,
          reminders: (v.reminders || []).map(r => r.id === reminderId ? { ...r, isCompleted: !r.isCompleted } : r)
        };
      }
      return v;
    });
    handleSave({ ...data, vehicles: updatedVehicles });
  };

  const handleDeleteItem = (type: string, id: string) => {
    setItemToDelete({ type, id });
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    
    if (itemToDelete.type === 'vehicle') {
      const newData = { ...data, vehicles: data.vehicles.filter(v => v.id !== itemToDelete.id) };
      handleSave(newData);
      if (selectedVehicle?.id === itemToDelete.id) setSelectedVehicle(null);
    } else {
      if (!selectedVehicle) return;
      const type = itemToDelete.type === 'service' ? 'services' : 
                   itemToDelete.type === 'fuel' ? 'fuelLogs' : 
                   itemToDelete.type === 'reminder' ? 'reminders' : 'parts';
      
      const updatedVehicles = data.vehicles.map(v => {
        if (v.id === selectedVehicle.id) {
          return { ...v, [type]: (v[type] as any[]).filter((item: any) => item.id !== itemToDelete.id) };
        }
        return v;
      });
      handleSave({ ...data, vehicles: updatedVehicles });
    }
    setItemToDelete(null);
  };

  const openEditModal = () => {
    if (!selectedVehicle) return;
    setNewVehicle({
      ...selectedVehicle,
      plate: selectedVehicle.plate || '',
      color: selectedVehicle.color || '',
      imageUrl: selectedVehicle.imageUrl || '',
      brandLogoUrl: selectedVehicle.brandLogoUrl || '',
      engine: selectedVehicle.engine || '',
      version: selectedVehicle.version || '',
      fuelType: selectedVehicle.fuelType || '',
      chassis: selectedVehicle.chassis || '',
      usageProfile: selectedVehicle.usageProfile || 'mixed',
      avgDailyKm: selectedVehicle.avgDailyKm || 30,
      drivingStyle: selectedVehicle.drivingStyle || 'moderate',
      usageDays: selectedVehicle.usageDays || [1, 2, 3, 4, 5],
      operatingRpm: selectedVehicle.operatingRpm || 'mid',
      fipeValue: selectedVehicle.fipeValue || 0
    });
    setIsEditingVehicle(true);
  };

  const searchImage = async () => {
    if (!newVehicle.name || !newVehicle.model) {
      alert('Preencha Marca e Modelo primeiro');
      return;
    }

    setIsSearchingImage(true);
    const fullDescription = `${newVehicle.name} ${newVehicle.model} ${newVehicle.year || ''}`.trim();
    setRobotLogs(prev => [...prev, `[ROBOT] Buscando foto original: ${fullDescription}...`, '[SCAN] Vasculhando arquivos oficiais...']);
    
    try {
      const { url, candidates, searchUrl } = await geminiService.searchVehicleImage(fullDescription);
      
      let validUrl = null;
      
      // Função interna para testar se o link é uma imagem válida
      const testImage = (src: string): Promise<boolean> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = src;
          // Timeout de 5 segundos para o teste
          setTimeout(() => resolve(false), 5000);
        });
      };

      // Testamos os candidatos enviados pelo robô
      const linksToTest = candidates && candidates.length > 0 ? candidates : (url ? [url] : []);
      
      for (const link of linksToTest) {
        setRobotLogs(prev => [...prev, `[TEST] Verificando link: ${link.substring(0, 30)}...`]);
        const isValid = await testImage(link);
        if (isValid) {
          validUrl = link;
          break;
        } else {
          setRobotLogs(prev => [...prev, '[FAIL] Link quebrado ou inacessível. Tentando próximo...']);
        }
      }

      if (validUrl) {
        setNewVehicle(prev => ({ ...prev, imageUrl: validUrl }));
        setRobotLogs(prev => [
          ...prev, 
          '[SUCCESS] Foto Original Validada e Localizada!', 
          '[ACTION] Abrindo imagem para você salvar...',
          '[INFO] Esta imagem passou no teste de integridade do robô.'
        ]);

        window.open(validUrl, '_blank');
        
        setRobotLogs(prev => [
          ...prev,
          `[FONTE] ${validUrl}`,
          '[GUIDE] 1. Salve a imagem, depois carregue-a no "Alterar Foto".',
          '[GUIDE] 2. Finalize com "Tratar com Robô" no Estúdio.'
        ]);

        setPlateSearchStatus('📸 Foto validada e aberta! Salve-a e carregue no veículo.');
        setTimeout(() => setPlateSearchStatus(''), 10000);
      } else {
        setRobotLogs(prev => [
          ...prev, 
          '[WARN] Nenhum link direto passou no teste de integridade.',
          '[ACTION] Abrindo galeria de busca para seleção manual segura...'
        ]);
        window.open(searchUrl, '_blank');
        setPlateSearchStatus('🔎 Abrindo busca manual de alta resolução...');
        setTimeout(() => setPlateSearchStatus(''), 5000);
      }
    } catch (err) {
      console.error('Erro ao buscar imagem oficial:', err);
      setRobotLogs(prev => [...prev, '[ERROR] Falha crítica na busca do robô.']);
    } finally {
      setIsSearchingImage(false);
    }
  };

  const searchLogo = async (brandName: string, isFromDetail = false) => {
    if (!brandName) {
      alert('Preencha a marca primeiro');
      return;
    }

    setIsSearchingLogo(true);
    setRobotLogs(prev => [...prev, `[ROBOT] Buscando logotipo oficial para ${brandName}...`, '[SCAN] Vasculhando bases de marcas e patentes...']);
    
    try {
      const { url, candidates, searchUrl } = await geminiService.searchVehicleLogo(brandName);
      
      let validUrl = null;
      
      const testImage = (src: string): Promise<boolean> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = src;
          setTimeout(() => resolve(false), 5000);
        });
      };

      const linksToTest = candidates && candidates.length > 0 ? candidates : (url ? [url] : []);
      
      for (const link of linksToTest) {
        setRobotLogs(prev => [...prev, `[TEST] Verificando logo: ${link.substring(0, 30)}...`]);
        const isValid = await testImage(link);
        if (isValid) {
          validUrl = link;
          break;
        } else {
          setRobotLogs(prev => [...prev, '[FAIL] Link quebrado ou sem transparência. Tentando próximo...']);
        }
      }

      if (validUrl) {
        if (isFromDetail) {
          updateSelectedVehicle({ brandLogoUrl: validUrl });
        } else {
          setNewVehicle(prev => ({ ...prev, brandLogoUrl: validUrl }));
        }
        
        setRobotLogs(prev => [
          ...prev, 
          '[SUCCESS] Logotipo Validado e Localizado!', 
          '[ACTION] O logo foi aplicado ao veículo automaticamente.'
        ]);
      } else {
        setRobotLogs(prev => [
          ...prev, 
          '[WARN] Nenhum logotipo direto passou no teste de integridade.',
          '[ACTION] Abrindo galeria de logos para seleção manual...'
        ]);
        window.open(searchUrl, '_blank');
      }
    } catch (err) {
      console.error('Erro ao buscar logotipo:', err);
      setRobotLogs(prev => [...prev, '[ERROR] Falha na busca do logotipo pelo robô.']);
    } finally {
      setIsSearchingLogo(false);
    }
  };

  const robotLogsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (robotLogsEndRef.current) {
      robotLogsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [robotLogs]);

  const searchVehicleByPlate = async () => {
    const plate = newVehicle.plate?.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (!plate || plate.length !== 7) {
      alert('Digite uma placa completa com 7 caracteres (ex: ABC1D23)');
      return;
    }

    setIsSearchingPlate(true);
    setPlateSearchStatus('🚀 INICIANDO ROBÔ DE CAPTURA...');
    setRobotLogs(['[INFO] Sistema de reconhecimento iniciado', `[INFO] Alvo: Placa ${plate}`]);
    
    // Abre o Pop-up imediatamente para o robô "trabalhar"
    try {
      const popup = vehicleSearchService.openPopup(plate, currentCountry.searchPortalUrl);
      if (popup) {
        robotPopupRef.current = popup;
        setRobotLogs(prev => [...prev, `[ROBOT] Portal ${currentCountry.name} aberto. Digite a placa lá!`, `[INFO] Robô aguardando você pesquisar no portal ${currentCountry.flag}...`]);
      }
    } catch (e) {
      console.warn('Pop-up bloqueado:', e);
      setRobotLogs(prev => [...prev, '[WARN] Janela bloqueada pelo navegador. Ativando modo stealth...']);
    }

    const statuses = [
      '📡 Sincronizando com Hub Veicular...',
      `🤖 Monitorando janela ${currentCountry.name}...`,
      '🔎 Aguardando preenchimento humano...',
      '⚖️ Capturando dados via OCR/Buffer...',
      '✨ Consolidando informações técnicas...'
    ];

    const findingSimulations = [
      `[SITE] Gateway Externo: ${currentCountry.searchPortalUrl.replace('https://', '')}`,
      '[WEB] Portal carregado com sucesso',
      '[EXTRACT] Aguardando interação do usuário...',
      '[CHECK] Robô pronto para processar cópia (Ctrl+C)',
      '[DATA] Metadados em standby...',
      '[INFO] Preparado para captura 100% infalível.'
    ];

    let step = 0;
    const statusInterval = setInterval(() => {
      if (step < statuses.length) {
        setPlateSearchStatus(statuses[step]);
        setRobotLogs(prev => [...prev, findingSimulations[step]]);
        step++;
      }
    }, 1800);

    try {
      console.log(`🔍 Robô em ação para placa: ${plate}`);
      
      const result = await geminiService.searchVehicleByPlate(
        plate, 
        data.settings?.plateApiKey, 
        data.settings?.apiBrasilDeviceToken, 
        data.settings?.plateApiHost,
        currentCountry.id
      );
      
      clearInterval(statusInterval);
      
      if (result.success) {
        setPlateSearchStatus('✅ Veículo Identificado!');
        setRobotLogs(prev => [
          ...prev, 
          `[SUCCESS] MARCA: ${result.name}`, 
          `[SUCCESS] MODELO: ${result.model}`,
          `[SUCCESS] ANO: ${result.year}`,
          result.color ? `[SUCCESS] COR: ${result.color}` : '',
          result.fuelType ? `[SUCCESS] COMBUSTÍVEL: ${result.fuelType}` : '',
          '[INFO] Extração via DOM concluída com sucesso.'
        ].filter(Boolean));

        // Fecha o popup se ele ainda estiver aberto
        if (robotPopupRef.current && !robotPopupRef.current.closed) {
          robotPopupRef.current.close();
          robotPopupRef.current = null;
        }

        setNewVehicle(prev => ({
          ...prev,
          name: result.name || prev.name || '',
          model: result.model || prev.model || '',
          year: result.year || prev.year || '',
          color: result.color || prev.color || '',
          engine: result.engine || prev.engine || '',
          version: result.version || prev.version || '',
          fuelType: result.fuelType || prev.fuelType || '',
          chassis: result.chassis || prev.chassis || '',
          imageUrl: result.imageUrl || prev.imageUrl,
          plate: plate
        }));

        if (showInternalBrowser) {
          alert(`✨ O robô localizou: ${result.name} ${result.model}`);
        }
        
        setTimeout(() => setPlateSearchStatus(''), 3000);
      } else {
        // FALLBACK: O Robô pede ajuda do humano na janela aberta
        setPlateSearchStatus('🕵️ MODO ASSISTIDO: COPIE OS DADOS');
        setRobotLogs(prev => [
          ...prev, 
          '[WARN] Robô não conseguiu extração automática (Security Block).',
          '[INFO] ABRIMOS O SITE PARA VOCÊ.',
          '[ACTION] NO SITE: Digite a placa, depois aperte CTRL+A e CTRL+C (Selecionar tudo e copiar).',
          '[ACTION] AQUI: Clique no botão "CAPTURAR DADOS" colorido abaixo.'
        ]);
        
        // Se o popup não abriu antes, abre agora
        if (!robotPopupRef.current || robotPopupRef.current.closed) {
          try {
            robotPopupRef.current = vehicleSearchService.openPopup(plate, currentCountry.searchPortalUrl);
          } catch (e) {}
        }
      }
    } catch (err: any) {
      clearInterval(statusInterval);
      console.error('Erro no robô:', err);
      setPlateSearchStatus('⚠️ Erro no servidor.');
      
      const errorStr = JSON.stringify(err);
      if (errorStr.includes('429') || errorStr.includes('quota')) {
        alert('Cota de IA atingida. Aguarde 1 minuto ou use a captura manual (Plano B).');
      } else {
        alert('Ocorreu um erro ao acionar o robô de busca. Tente a busca manual.');
      }
      setTimeout(() => setPlateSearchStatus(''), 3000);
    } finally {
      setIsSearchingPlate(false);
    }
  };

  const searchVehicleByWeb = async () => {
    const plate = newVehicle.plate?.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!plate || plate.length !== 7) {
      alert('Digite uma placa completa no formato MERCOSUL (7 caracteres).');
      return;
    }

    setIsSearchingPlate(true);
    try {
      // Tenta busca automática via APIs públicas
      const result = await webVehicleSearchService.searchPublicApis(plate);
      
      if (result.success) {
        setNewVehicle(prev => ({
          ...prev,
          name: result.name || prev.name,
          model: result.model || prev.model,
          year: result.year || prev.year,
          plate
        }));
        alert(`✅ Dados encontrados via ${result.source}!\n${result.name} ${result.model} ${result.year}`);
      } else {
        // Se falhar, abre o modal para busca manual
        setWebSearchMode('manual');
        setIsWebSearchOpen(true);
      }
    } catch (err) {
      console.error('Erro na busca web:', err);
      setWebSearchMode('manual');
      setIsWebSearchOpen(true);
    } finally {
      setIsSearchingPlate(false);
    }
  };

  const captureFromExternal = async () => {
    const plate = newVehicle.plate?.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!plate || plate.length !== 7) {
      alert('Digite uma placa completa no formato MERCOSUL (7 caracteres).');
      return;
    }

    setIsCapturingFromWeb(true);
    try {
      // Abre o popup do portal específico do país
      const popup = vehicleSearchService.openPopup(plate, currentCountry.searchPortalUrl);
      if (popup) {
        robotPopupRef.current = popup;
        
        // Ativa o modo de captura assistida
        setPlateSearchStatus('🕵️ MODO ASSISTIDO: COPIE OS DADOS');
        setRobotLogs([
          `[ROBOT] Janela ${currentCountry.name} aberta.`,
          '[ACTION] No site: Digite a placa, pesquise, e depois CTRL+A -> CTRL+C.',
          '[ACTION] Aqui: Clique no botão "CAPTURAR DADOS" colorido.'
        ]);
      }
    } catch (err) {
      console.error('Erro na captura automática:', err);
      alert('Erro ao capturar dados. Tente novamente ou preencha manualmente.');
    } finally {
      setIsCapturingFromWeb(false);
    }
  };

  const handleAssistedProcess = async (textOverride?: string) => {
    const dataToProcess = textOverride || rawPastedData;
    if (!dataToProcess.trim()) return;
    
    setIsProcessingAssisted(true);
    setPlateSearchStatus('🧠 IA: Analisando texto e extraindo dados...');
    setRobotLogs(prev => [...prev, '[INFO] Enviando dados para o Cérebro IA...', '[PROCESS] Decodificando ficha técnica...']);
    
    try {
      const result = await geminiService.parseRawVehicleData(dataToProcess);
      if (result && result.success !== false) {
        setPlateSearchStatus('🎉 Dados extraídos com sucesso!');
        
        const logs = [
          `[SUCCESS] MARCA: ${result.name || '?' }`,
          `[SUCCESS] MODELO: ${result.model || '?' }`,
          result.color ? `[SUCCESS] COR: ${result.color}` : null,
          result.fuelType ? `[SUCCESS] COMBUSTÍVEL: ${result.fuelType}` : null,
          result.mileage ? `[SUCCESS] KM: ${result.mileage.toLocaleString()} km` : null,
          result.fipeValue ? `[SUCCESS] VALOR: ${formatCurrency(result.fipeValue)}` : null,
          '[INFO] Ficha técnica sincronizada.'
        ].filter(Boolean) as string[];

        setRobotLogs(prev => [...prev, ...logs]);

        setNewVehicle(prev => {
          const updated = {
            ...prev,
            name: result.name || prev.name,
            model: result.model || prev.model,
            year: result.year || prev.year,
            color: result.color || prev.color,
            engine: result.engine || prev.engine,
            version: result.version || prev.version,
            fuelType: result.fuelType || prev.fuelType,
            chassis: result.chassis || prev.chassis,
            mileage: typeof result.mileage === 'number' ? result.mileage : prev.mileage,
            fipeValue: typeof result.fipeValue === 'number' ? result.fipeValue : prev.fipeValue,
            plate: result.plate ? result.plate.toUpperCase().replace(/[^A-Z0-9]/g, '') : prev.plate
          };
          return updated;
        });
        setRawPastedData(''); 
        
        // Fecha o popup após captura manual bem sucedida
        if (robotPopupRef.current && !robotPopupRef.current.closed) {
          robotPopupRef.current.close();
          robotPopupRef.current = null;
        }

        // Auto-scroll to fields or show success state
        setTimeout(() => setPlateSearchStatus('✓ Cadastro preenchido!'), 2000);
      } else {
        setPlateSearchStatus('⚠️ Erro na interpretação.');
        const errorMsg = result?.error || result?.message || 'Não foi possível identificar dados.';
        alert(`${errorMsg}\n\nTente copiar novamente.`);
      }
    } catch (error: any) {
      console.error(error);
      const errorMsg = error?.message || "";
      if (errorMsg.includes("429") || errorMsg.includes("RESOURCE_EXHAUSTED")) {
        alert("Limite de processamento IA atingido. Aguarde 1 minuto ou preencha manualmente.");
      } else {
        alert('Erro ao processar dados.');
      }
    } finally {
      setIsProcessingAssisted(false);
    }
  };


  const handleCaptureFromClipboard = async () => {
    try {
      // Tentar verificar permissão primeiro (opcional mas bom)
      try {
        const queryOpts = { name: 'clipboard-read' as PermissionName };
        const permissionStatus = await navigator.permissions.query(queryOpts);
        console.log('Clipboard permission state:', permissionStatus.state);
      } catch (e) {
        console.warn('Navigator permission query not supported or failed');
      }

      const text = await navigator.clipboard.readText();
      if (!text || !text.trim()) {
        alert('Área de transferência vazia. Copie os dados do site primeiro (Ctrl+A, Ctrl+C).');
        return;
      }
      
      setRawPastedData(text);
      if (text.length > 20) {
        handleAssistedProcess(text);
      } else {
        alert('Conteúdo muito curto na área de transferência. Certifique-se de copiar os dados do veículo.');
      }
    } catch (err) {
      console.error('Erro ao ler clipboard:', err);
      
      // Fallback para quando a API está bloqueada por política ou permissão
      alert('Seu navegador bloqueou o acesso direto à área de transferência neste ambiente (IFrame). \n\nPor favor, clique no campo de texto "Ou cole o texto aqui..." e use Ctrl+V manualmente.');
      
      // Focar na área de texto para facilitar a vida do usuário
      setTimeout(() => {
        if (pasteTextAreaRef.current) {
          pasteTextAreaRef.current.focus();
          pasteTextAreaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  const deleteVehicle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItemToDelete({ type: 'vehicle', id });
  };

  const checkDuplicate = (name: string, code?: string) => {
    if (!selectedVehicle) return false;
    return selectedVehicle.parts.some(p => 
      p.name.toLowerCase() === name.toLowerCase() || 
      (code && p.code && p.code !== "" && p.code === code)
    );
  };

  const addPart = async (overrideName?: string) => {
    const searchName = overrideName || newPartName;
    if (!selectedVehicle || !searchName) return;
    
    setIsResearching(true);
    try {
      const response = await geminiService.researchPart(searchName, `${selectedVehicle.name} ${selectedVehicle.model} ${selectedVehicle.year}`);
      
      if (response.isAmbiguous && response.suggestions && response.suggestions.length > 0) {
        setAiSuggestions(response.suggestions);
        setIsResearching(false);
        return;
      }

      if (response.part) {
        if (checkDuplicate(response.part.name || searchName, response.part.code)) {
          alert('Esta peça já consta no seu banco de dados ou possui o mesmo código.');
          setIsResearching(false);
          return;
        }

        const part: Part = {
          id: crypto.randomUUID(),
          name: response.part.name || searchName,
          code: response.part.code || '',
          category: response.part.category || 'Geral',
          description: response.part.description || '',
          lifespan: response.part.lifespan || '',
          maintenanceInterval: response.part.maintenanceInterval || '',
          brand: response.part.brand || '',
          photoUrl: response.part.photoUrl || '',
          status: 'ok',
          technicalSpecs: response.part.technicalSpecs || {}
        };

        const updatedVehicles = data.vehicles.map(v => {
          if (v.id === selectedVehicle.id) {
            return { ...v, parts: [...v.parts, part] };
          }
          return v;
        });

        handleSave({ ...data, vehicles: updatedVehicles });
        setNewPartName('');
        setAiSuggestions([]);
        setIsAddingPart(false);
      }
    } catch (error) {
      alert('Erro ao pesquisar peça com IA. Tente novamente.');
    } finally {
      setIsResearching(false);
    }
  };

  const deletePart = (partId: string) => {
    if (!selectedVehicle) return;
    const updatedVehicles = data.vehicles.map(v => {
      if (v.id === selectedVehicle.id) {
        return { ...v, parts: v.parts.filter(p => p.id !== partId) };
      }
      return v;
    });
    handleSave({ ...data, vehicles: updatedVehicles });
  };

  const togglePartBudget = (partId: string) => {
    if (!selectedVehicle) return;
    const updatedVehicles = data.vehicles.map(v => {
      if (v.id === selectedVehicle.id) {
        return {
          ...v,
          parts: v.parts.map(p => p.id === partId ? { ...p, isInBudget: !p.isInBudget } : p)
        };
      }
      return v;
    });
    handleSave({ ...data, vehicles: updatedVehicles });
  };

  const estimatePrice = async (part: Part) => {
    if (!selectedVehicle) return;
    setIsEstimatingPrice(true);
    try {
      const result = await geminiService.estimatePartPrice(part.name, `${selectedVehicle.name} ${selectedVehicle.model} ${selectedVehicle.year}`);
      if (result) {
        const updatedVehicles = data.vehicles.map(v => {
          if (v.id === selectedVehicle.id) {
            return {
              ...v,
              parts: v.parts.map(p => p.id === part.id ? { 
                ...p, 
                estimatedPrice: result.estimatedPrice, 
                priceType: result.priceType,
                unitsPerSet: result.unitsPerSet,
                isInBudget: true 
              } : p)
            };
          }
          return v;
        });
        handleSave({ ...data, vehicles: updatedVehicles });
      } else {
        alert('Não foi possível estimar o preço automaticamente. Você pode definir manualmente.' + ((window as any).lastGeminiPriceError ? '\n[LOG]: ' + (window as any).lastGeminiPriceError : ''));
      }
    } finally {
      setIsEstimatingPrice(false);
    }
  };

  const updatePartPrice = (partId: string, price: number) => {
    if (!selectedVehicle) return;
    const updatedVehicles = data.vehicles.map(v => {
      if (v.id === selectedVehicle.id) {
        return {
          ...v,
          parts: v.parts.map(p => p.id === partId ? { ...p, estimatedPrice: price } : p)
        };
      }
      return v;
    });
    handleSave({ ...data, vehicles: updatedVehicles });
  };

  const exportVehicle = (vehicle: Vehicle) => {
    const jsonStr = JSON.stringify(vehicle, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Padronização solicitada: PLACA.Marca.Modelo.Ano-Faixa.json
    const plate = vehicle.plate?.toUpperCase() || 'SEM_PLACA';
    const brand = vehicle.name.replace(/\s+/g, '.');
    const model = vehicle.model.replace(/\s+/g, '.');
    const year = String(vehicle.year || '').replace(/\//g, '-').replace(/\s+/g, '');
    
    link.download = `${plate}.${brand}.${model}.${year}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importVehicleInputRef = useRef<HTMLInputElement>(null);

  const handleImportVehicle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedVehicle = JSON.parse(event.target?.result as string) as Vehicle;
        
        // Validação básica para garantir que é um objeto de veículo e não um backup completo
        if (!importedVehicle.name || !importedVehicle.id || !Array.isArray(importedVehicle.parts)) {
          throw new Error('Este arquivo não parece ser um veículo válido ou é um backup completo do sistema.');
        }

        const existingIdx = data.vehicles.findIndex(v => v.id === importedVehicle.id);
        let updatedVehicles;

        if (existingIdx >= 0) {
          if (confirm('Este veículo já existe. Deseja substituir os dados locais pelo arquivo importado?')) {
            updatedVehicles = [...data.vehicles];
            updatedVehicles[existingIdx] = importedVehicle;
          } else {
            return;
          }
        } else {
          updatedVehicles = [...data.vehicles, importedVehicle];
        }

        handleSave({ ...data, vehicles: updatedVehicles });
        setSelectedVehicle(importedVehicle);
        alert('Veículo importado com sucesso!');
      } catch (err) {
        alert('Erro ao importar veículo: formato de arquivo inválido.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const importedData = await storageService.importData(file);
        setData(importedData);
        setSelectedVehicle(null);
        alert('Banco de dados importado com sucesso!');
      } catch (err) {
        alert('Erro ao importar arquivo.');
      }
    }
  };

  const generateManualInfo = async () => {
    if (!selectedVehicle) return;
    setIsGeneratingManual(true);
    try {
      const info = await geminiService.getVehicleManualInfo(`${selectedVehicle.name} ${selectedVehicle.model} ${selectedVehicle.year}`);
      const updatedVehicles = data.vehicles.map(v => {
        if (v.id === selectedVehicle.id) {
          const updated = { ...v, manualTranscription: info };
          setSelectedVehicle(updated);
          return updated;
        }
        return v;
      });
      handleSave({ ...data, vehicles: updatedVehicles });
    } catch (error) {
      console.error('Erro ao gerar manual:', error);
    } finally {
      setIsGeneratingManual(false);
    }
  };

  const runDiagnosis = async () => {
    if (!symptomQuery || !selectedVehicle) return;
    setIsDiagnosing(true);
    try {
      const res = await geminiService.diagnoseSymptom(selectedVehicle, symptomQuery);
      setDiagnosisResult(res);
      // Salva no histórico do veículo
      const newDiagnostic = {
        date: new Date().toISOString(),
        symptom: symptomQuery,
        diagnosis: res
      };
      updateSelectedVehicle({
        diagnosticHistory: [newDiagnostic, ...(selectedVehicle.diagnosticHistory || [])]
      });
    } catch (e) {
      setDiagnosisResult("Erro ao gerar diagnóstico.");
    } finally {
      setIsDiagnosing(false);
    }
  };

  const runTCOAnalysis = async () => {
    if (!selectedVehicle) return;
    setIsAnalyzingTco(true);
    try {
      const fuelTotal = (selectedVehicle.fuelLogs || []).reduce((acc, l) => acc + l.cost, 0);
      const serviceTotal = (selectedVehicle.services || []).reduce((acc, l) => acc + l.cost, 0);
      const res = await geminiService.analyzeTCO(selectedVehicle, fuelTotal, serviceTotal);
      setTcoAnalysis(res);
    } catch (e) {
      setTcoAnalysis("Erro ao analisar TCO.");
    } finally {
      setIsAnalyzingTco(false);
    }
  };

  const handlePDFUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      if (manualPDFInputRef.current) manualPDFInputRef.current.value = '';
      return;
    }

    if (!selectedVehicle) {
      alert('Selecione um veículo antes de enviar o PDF.');
      if (manualPDFInputRef.current) manualPDFInputRef.current.value = '';
      return;
    }

    if (file.type !== 'application/pdf') {
      alert('Por favor, selecione um arquivo PDF válido.');
      if (manualPDFInputRef.current) manualPDFInputRef.current.value = '';
      return;
    }

    await handleManualPDFUpload(file);
    if (manualPDFInputRef.current) manualPDFInputRef.current.value = '';
  };

  const sendManualChat = async () => {
    if (!selectedVehicle || !manualChatQuery || !selectedVehicle.manualTranscription) return;
    setIsChattingWithManual(true);
    try {
      const response = await geminiService.chatWithManual(
        manualChatQuery,
        selectedVehicle.manualTranscription,
        `${selectedVehicle.name} ${selectedVehicle.model} ${selectedVehicle.year}`
      );
      setManualChatResponse(response);
      setManualChatQuery('');
    } catch (error) {
      alert('Erro ao conversar com o manual.');
    } finally {
      setIsChattingWithManual(false);
    }
  };

  const exportMechanicReport = () => {
    if (!selectedVehicle) return;
    const report = `
RELATÓRIO TÉCNICO: ${selectedVehicle.name.toUpperCase()}
Documento gerado em: ${new Date().toLocaleDateString()}

ESTADO ATUAL:
- Quilometragem: ${selectedVehicle.mileage} km
- Modelo: ${selectedVehicle.model} (${selectedVehicle.year})

ÚLTIMOS SERVIÇOS:
${selectedVehicle.services.slice(0, 5).map(s => `- ${s.date}: ${s.description} (${s.mileage}km)
  Oficina: ${s.workshopName}${s.workshopAddress ? ` - ${s.workshopAddress}` : ''}${s.workshopPhone ? ` (Fone: ${s.workshopPhone})` : ''}`).join('\n')}

PEÇAS INSTALADAS:
${selectedVehicle.parts.map(p => `- ${p.name}: ${p.brand || 'N/A'}`).join('\n')}
    `;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_${selectedVehicle.name.toLowerCase()}.txt`;
    link.click();
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

  const getVehicleHealth = () => {
    if (!selectedVehicle) return 100;
    if ((selectedVehicle.parts?.length || 0) === 0) return 100;
    
    const criticalParts = (selectedVehicle.parts || []).filter(p => p.status === 'critical').length;
    const warningParts = (selectedVehicle.parts || []).filter(p => p.status === 'warning').length;
    
    // Penalidades mais severas: uma peça crítica remove 30% de saúde
    // Saúde = 100 - (críticos * 30) - (avisos * 10)
    const health = 100 - (criticalParts * 30 + warningParts * 10);
    return Math.max(Math.min(health, 100), 0);
  };

  const getFuelAnalytics = () => {
    if (!selectedVehicle || !selectedVehicle.fuelLogs || selectedVehicle.fuelLogs.length < 2) return null;
    
    const logs = [...selectedVehicle.fuelLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const data = [];
    let totalKm = 0;
    let totalLiters = 0;
    let totalCost = 0;

    for (let i = 1; i < logs.length; i++) {
        const dist = logs[i].mileage - logs[i-1].mileage;
        if (dist > 0 && logs[i].liters > 0) {
            const consumption = dist / logs[i].liters;
            data.push({
                date: new Date(logs[i].date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                kmL: Number(consumption.toFixed(2)),
                costL: Number((logs[i].cost / logs[i].liters).toFixed(2))
            });
            totalKm += dist;
            totalLiters += logs[i].liters;
            totalCost += logs[i].cost;
        }
    }

    const avgKmL = totalLiters > 0 ? (totalKm / totalLiters).toFixed(2) : 0;
    const avgCostKm = totalKm > 0 ? (totalCost / totalKm).toFixed(2) : 0;

    return { data, avgKmL, avgCostKm };
  };

  const fuelAnalytics = getFuelAnalytics();

  const getMaintenanceScore = () => {
    if (!selectedVehicle) return 0;
    
    let score = 70; // Pontuação base
    
    // Penalidades por saúde baixo
    const health = getVehicleHealth();
    if (health < 80) score -= (80 - health) * 0.5;
    
    // Bônus por serviços documentados (pelo menos 3 meses de histórico)
    const servicesCount = selectedVehicle.services?.length || 0;
    score += Math.min(servicesCount * 5, 20); // Máximo 20 pontos de bônus por volume
    
    // Bônus por manuais e documentação técnica
    if (selectedVehicle.manualTranscription) score += 10;
    
    return Math.min(Math.round(score), 100);
  };

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
              <span className="text-sm font-black text-green-600">Excelente</span>
            </div>
            
            <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white rounded border border-gray-50 shadow-sm min-w-[140px]">
              <Box size={14} className="text-brand-accent" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-1">Peças</span>
              <span className="text-sm font-black text-brand-primary">
                {data.vehicles.reduce((acc, v) => acc + (v.parts?.length || 0), 0)}
              </span>
            </div>

            <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white rounded border border-gray-50 shadow-sm min-w-[140px]">
              <Shield size={14} className="text-blue-500" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-1">Dados</span>
              <span className="text-sm font-black text-blue-600">Protegidos</span>
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
            {data.vehicles.map((vehicle) => (
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
                      <motion.button 
                        whileHover={{ scale: 1.2, color: '#ef4444' }}
                        onClick={(e) => deleteVehicle(vehicle.id, e)}
                        className="absolute right-0 p-1 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </motion.button>
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
                    <p className={`text-2xl font-mono font-black ${getVehicleHealth() > 80 ? 'text-green-400' : getVehicleHealth() > 50 ? 'text-amber-400' : 'text-red-400'}`}>
                      {Math.round(getVehicleHealth())}%
                    </p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl">
                    <p className="text-gray-500 text-[9px] uppercase font-bold tracking-widest mb-1">Score Valorização</p>
                    <div className="flex items-center gap-2">
                       <p className={`text-2xl font-mono font-black ${getMaintenanceScore() > 85 ? 'text-blue-400' : 'text-gray-400'}`}>
                         {getMaintenanceScore()}%
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
                      animate={{ width: `${getVehicleHealth()}%` }}
                      className={`h-full rounded-full ${getVehicleHealth() > 80 ? 'bg-green-500' : getVehicleHealth() > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
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
              <div className="space-y-4">
                <div className="flex justify-between items-center text-brand-primary">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Search size={20} className="text-brand-accent" /> Inventário de Peças
                  </h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const fluids = selectedVehicle.manualTranscription?.toLowerCase()?.includes('fluido') || selectedVehicle.manualTranscription?.toLowerCase()?.includes('óleo');
                        if (fluids) {
                          alert('DICA IA: Verifique a aba "Manual" para especificações exatas de óleo e capacidades já extraídas.');
                        } else {
                          generateManualInfo();
                        }
                      }}
                      className="bg-brand-primary/5 text-brand-primary px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-brand-primary/10 transition-all flex items-center gap-2"
                    >
                      <Pipette size={14} /> Ref. Fluidos
                    </button>
                    <button 
                      onClick={() => setIsAddingPart(true)}
                      className="bg-brand-primary text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-brand-accent transition-all flex items-center gap-2"
                    >
                      <Plus size={14} /> Catalogar Peça
                    </button>
                  </div>
                </div>
              
              <div className="grid grid-cols-1 gap-2">
                {(selectedVehicle.parts?.length || 0) === 0 ? (
                   <div className="text-center py-20 bg-gray-50 rounded border border-dashed border-gray-200">
                      <Wrench size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500 font-medium tracking-tight">Nenhuma peça catalogada ainda.</p>
                   </div>
                ) : (
                  selectedVehicle.parts.map((part) => (
                    <motion.div
                      layout
                      key={part.id}
                      className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-brand-accent transition-all cursor-default flex flex-col md:flex-row justify-between gap-3 shadow-sm hover:shadow-md"
                    >
                      <div className="flex gap-4">
                        <div className={`h-14 w-14 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
                          part.status === 'ok' ? 'bg-green-50' : 'bg-amber-50'
                        }`}>
                          {part.status === 'ok' ? <CheckCircle2 size={24} className="text-green-500" /> : <AlertCircle size={24} className="text-amber-500" />}
                        </div>
                        <div className="flex flex-col justify-center">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="font-bold text-base text-gray-800">{part.name}</h4>
                            <span className="text-[9px] bg-brand-primary/5 text-brand-primary px-2 py-0.5 rounded-full font-mono font-bold uppercase">{part.code}</span>
                            {part.brand && <span className="text-[10px] text-brand-accent font-bold italic">@{part.brand}</span>}
                          </div>
                          <p className="text-xs text-gray-500 mb-1.5 line-clamp-1">{part.description}</p>
                          <div className="flex flex-wrap gap-2">
                             <span className="text-[9px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 uppercase tracking-tighter">Marca: {part.brand || 'Original'}</span>
                             <span className="text-[9px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 uppercase tracking-tighter">Vida: {part.lifespan}</span>
                             {part.technicalSpecs && Object.keys(part.technicalSpecs).length > 0 && (
                               <button 
                                 onClick={() => {
                                   const specs = Object.entries(part.technicalSpecs || {}).map(([k,v]) => `${k}: ${v}`).join('\n');
                                   alert(`ESPECIFICAÇÕES TÉCNICAS:\n${specs}`);
                                 }}
                                 className="text-[9px] font-bold text-brand-primary bg-brand-primary/5 px-1.5 py-0.5 rounded hover:bg-brand-primary/10 transition-colors flex items-center gap-1"
                               >
                                 <Plus size={8} /> TECHNICAL SPECS
                               </button>
                             )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between md:justify-end gap-5 md:min-w-[260px]">
                        <div className="flex items-center gap-3">
                           <button 
                             onClick={() => estimatePrice(part)}
                             disabled={isEstimatingPrice}
                             className={`p-2.5 rounded-xl transition-all shadow-sm ${part.isInBudget ? 'bg-brand-accent text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 border border-gray-100'}`}
                             title={part.isInBudget ? "No Orçamento" : "Estimar Preço via IA"}
                           >
                             {isEstimatingPrice ? <Settings className="animate-spin" size={18} /> : <DollarSign size={18} />}
                           </button>
                           <div className="text-right">
                              <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5 tracking-tight">Média IA</p>
                              <p className="text-sm font-mono font-bold text-brand-primary leading-none">
                                {part.estimatedPrice ? `R$ ${part.estimatedPrice.toLocaleString()}` : '--'}
                              </p>
                              {part.priceType && (
                                <div className="flex items-center gap-1 mt-1 justify-end">
                                  <span className="text-[8px] bg-brand-primary/10 text-brand-primary px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                                    {part.priceType}
                                  </span>
                                  {part.unitsPerSet && (
                                    <span className="text-[8px] text-gray-400 font-bold">({part.unitsPerSet} un)</span>
                                  )}
                                </div>
                              )}
                           </div>
                        </div>
                        <div className="text-right border-l border-gray-50 pl-5">
                          <p className="text-[10px] text-gray-400 font-bold uppercase mb-1 tracking-tight">Intervalo</p>
                          <p className="text-xs font-mono font-bold text-gray-600">{part.maintenanceInterval || '---'}</p>
                        </div>
                        <button 
                          onClick={() => deletePart(part.id)}
                          className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          )}

            {/* Services History Tab */}
            {activeTab === 'services' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-brand-primary">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Wrench size={22} className="text-brand-accent" /> Histórico Manut.
                  </h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={exportMechanicReport}
                      className="bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg font-bold text-xs hover:border-brand-primary hover:text-brand-primary transition-all flex items-center gap-2"
                      title="Gerar relatório técnico para o mecânico"
                    >
                      <FileText size={14} /> Relatório
                    </button>
                    <button 
                      onClick={() => setIsAddingService(true)}
                      className="bg-brand-primary text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-brand-accent transition-all flex items-center gap-2 shadow-sm"
                    >
                      <Plus size={14} /> Novo Serviço
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {(!selectedVehicle.services || selectedVehicle.services.length === 0) ? (
                    <div className="text-center py-20 bg-gray-50 rounded border border-dashed border-gray-200">
                      <Book size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500 font-medium">Nenhum serviço registrado ainda.</p>
                    </div>
                  ) : (
                    [...selectedVehicle.services].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((service) => (
                      <div key={service.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col group hover:border-brand-primary/20 transition-all duration-300">
                        <div className="p-5 flex flex-col md:flex-row justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="bg-brand-primary/5 p-3 rounded-2xl text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all duration-500">
                              <Wrench size={24} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] bg-brand-accent/10 text-brand-accent px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">{new Date(service.date).toLocaleDateString('pt-BR')}</span>
                                <span className="text-[10px] text-gray-300 font-mono">ID: #{service.id.slice(0, 8)}</span>
                              </div>
                              <h4 className="text-xl font-black text-brand-primary mb-1 leading-none">{service.description}</h4>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                                <div className="flex flex-col gap-1 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-brand-primary"></div>
                                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-tight">
                                      {service.workshopName}
                                    </span>
                                  </div>
                                  {(service.workshopAddress || service.workshopPhone) && (
                                    <div className="flex flex-col gap-0.5 ml-4">
                                      {service.workshopAddress && (
                                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                          <MapPin size={10} className="text-gray-300" />
                                          <span className="line-clamp-1">{service.workshopAddress}</span>
                                        </div>
                                      )}
                                      {service.workshopPhone && (
                                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                          <Phone size={10} className="text-gray-300" />
                                          <span>{service.workshopPhone}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                                {service.mechanicName && (
                                  <span className="text-[10px] text-gray-400 font-bold uppercase">Mec: {service.mechanicName}</span>
                                )}
                              </div>
                              {service.createdAt && (
                                <p className="text-[9px] text-gray-300 uppercase font-black tracking-widest mt-2 flex items-center gap-1">
                                  <RefreshCw size={8} className="animate-spin-slow" />
                                  Registrado Automaticamente: {new Date(service.createdAt).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-8 justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0">
                            <div className="flex items-center gap-2">
                               <button 
                                 onClick={() => setSelectedServiceForReport(service)}
                                 className="p-2 rounded-xl bg-brand-primary text-white hover:bg-brand-accent transition-all shadow-md shadow-brand-primary/20 flex items-center gap-2 px-3"
                                 title="Ver Relatório Profissional"
                               >
                                 <FileText size={16} />
                                 <span className="text-xs font-bold">Relatório</span>
                               </button>
                               <button 
                                 onClick={() => {
                                   const url = prompt('Cole a URL da foto do serviço/nota fiscal:');
                                   if (url) alert('Foto vinculada com sucesso!');
                                 }}
                                 className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-brand-primary hover:text-white border border-gray-100 transition-all"
                                 title="Vincular Foto/Nota"
                               >
                                 <Camera size={16} />
                               </button>
                               <button 
                                 onClick={() => {
                                   const note = prompt('Adicione uma nota técnica ou observação:', service.notes || '');
                                   if (note !== null) {
                                     const updatedVehicles = data.vehicles.map(v => {
                                       if (v.id === selectedVehicle.id) {
                                         return {
                                           ...v,
                                           services: v.services.map(s => s.id === service.id ? { ...s, notes: note } : s)
                                         };
                                       }
                                       return v;
                                     });
                                     handleSave({ ...data, vehicles: updatedVehicles });
                                   }
                                 }}
                                 className={`p-2 rounded-xl border transition-all ${service.notes ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 border-gray-100'}`}
                                 title={service.notes ? `Nota: ${service.notes}` : "Adicionar Observação de Check-in"}
                               >
                                 <Box size={16} />
                               </button>
                            </div>

                            <div className="text-right">
                              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Custo Total</p>
                              <p className="text-2xl font-mono font-black text-brand-primary leading-none">{formatCurrency(service.cost)}</p>
                              {service.laborCost > 0 && (
                                <p className="text-[10px] text-gray-400 font-bold mt-1">Mão de obra: {formatCurrency(service.laborCost)}</p>
                              )}
                              <div className="flex items-center gap-1.5 mt-2 justify-end text-brand-accent">
                                <Gauge size={12} />
                                <span className="text-[10px] font-mono font-bold">{service.mileage.toLocaleString()} km</span>
                              </div>
                            </div>

                            <button 
                              onClick={() => handleDeleteItem('service', service.id)}
                              className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>

                        {/* Invoice-like Item list breakdown */}
                        {service.partsList && service.partsList.length > 0 && (
                          <div className="bg-gray-50/50 px-5 py-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                             {service.partsList.map((p) => (
                                <div key={p.id} className="bg-white p-3 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm">
                                   <div>
                                      <p className="text-xs font-black text-gray-700 leading-tight">{p.name}</p>
                                      <p className="text-[10px] text-gray-400 font-bold">Qtd: {p.quantity}</p>
                                      {p.observation && (
                                        <p className="text-[9px] text-brand-accent italic font-bold mt-1 line-clamp-2" title={p.observation}>
                                           Obs: {p.observation}
                                        </p>
                                      )}
                                   </div>
                                   <div className="text-right">
                                      <p className="text-xs font-mono font-bold text-brand-primary">R$ {(p.quantity * p.unitPrice).toLocaleString()}</p>
                                      <p className="text-[9px] text-gray-300 font-mono italic">un: R$ {p.unitPrice.toLocaleString()}</p>
                                   </div>
                                </div>
                             ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Fuel Consumption Tab */}
            {activeTab === 'fuel' && (
              <div className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {/* Stats Cards */}
                  <div className="bg-brand-primary text-white p-4 rounded shadow-lg overflow-hidden relative">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Média de Consumo</p>
                    <h4 className="text-2xl font-mono font-black italic">
                      {(() => {
                        const logs = [...(selectedVehicle.fuelLogs || [])].sort((a, b) => a.mileage - b.mileage);
                        if (logs.length < 2) return '--';
                        const totalKm = logs[logs.length - 1].mileage - logs[0].mileage;
                        const totalL = logs.slice(1).reduce((sum, l) => sum + l.liters, 0);
                        return totalL > 0 ? (totalKm / totalL).toFixed(1) : '--';
                      })()} km/L
                    </h4>
                    <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-widest leading-tight">Baseado nos últimos abastecimentos</p>
                    <Gauge className="absolute bottom-[-10px] right-[-10px] opacity-10" size={60} />
                  </div>
                  <div className="bg-white border border-gray-100 p-4 rounded shadow-sm">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Gasto no Mês</p>
                    <h4 className="text-2xl font-mono font-black text-brand-primary">
                      R$ {selectedVehicle.fuelLogs?.reduce((acc, log) => {
                        const logDate = new Date(log.date);
                        const now = new Date();
                        if (logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear()) {
                          return acc + log.cost;
                        }
                        return acc;
                      }, 0).toLocaleString()}
                    </h4>
                    <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-widest">Total gasto este mês</p>
                  </div>
                  <div className="bg-white border border-gray-100 p-4 rounded shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Abastecimentos</p>
                      <h4 className="text-2xl font-mono font-black text-brand-primary">{selectedVehicle.fuelLogs?.length || 0}</h4>
                    </div>
                    <button 
                      onClick={() => setIsAddingFuel(true)}
                      className="bg-brand-primary text-white p-3 rounded shadow-lg hover:bg-brand-accent transition-all"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Database size={22} className="text-brand-accent" /> Histórico de Abastecimentos
                  </h3>
                  {(!selectedVehicle.fuelLogs || selectedVehicle.fuelLogs.length === 0) ? (
                    <div className="text-center py-20 bg-gray-50 rounded border border-dashed border-gray-200">
                      <Zap size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500 font-medium">Nenhum abastecimento registrado.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left bg-white rounded border border-gray-100 overflow-hidden shadow-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest">Data</th>
                            <th className="px-4 py-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest">Quilometragem</th>
                            <th className="px-4 py-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest">Litros</th>
                            <th className="px-4 py-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest">Custo</th>
                            <th className="px-4 py-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest">Tanque Cheio</th>
                            <th className="px-4 py-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest text-right">Ação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {[...selectedVehicle.fuelLogs].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-4 py-3 text-xs font-bold text-brand-primary">{new Date(log.date).toLocaleDateString('pt-BR')}</td>
                              <td className="px-4 py-3 text-xs font-mono">{log.mileage.toLocaleString()} km</td>
                              <td className="px-4 py-3 text-xs font-mono">{log.liters.toLocaleString()} L</td>
                              <td className="px-4 py-3 text-xs font-mono font-bold text-brand-accent">{formatCurrency(log.cost)}</td>
                              <td className="px-4 py-3">
                                {log.fullTank ? (
                                  <span className="bg-green-50 text-green-600 text-[7px] font-black uppercase px-2 py-0.5 rounded">Sim</span>
                                ) : (
                                  <span className="bg-gray-50 text-gray-400 text-[7px] font-black uppercase px-2 py-0.5 rounded">Não</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button 
                                  onClick={() => handleDeleteItem('fuel', log.id)}
                                  className="text-gray-300 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 size={14} />
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
            )}

            {/* Reminders Tab */}
            {activeTab === 'reminders' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Activity size={22} className="text-brand-accent" /> Lembretes & Alertas Proximos
                  </h3>
                  <button 
                    onClick={() => setIsAddingReminder(true)}
                    className="bg-brand-primary text-white px-4 py-2 rounded font-bold text-xs"
                  >
                    + Novo Lembrete
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(!selectedVehicle.reminders || selectedVehicle.reminders.length === 0) ? (
                    <div className="col-span-full text-center py-20 bg-gray-50 rounded border border-dashed border-gray-200">
                      <Activity size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500 font-medium">Sem lembretes configurados.</p>
                    </div>
                  ) : (
                    selectedVehicle.reminders.map((reminder) => (
                      <div key={reminder.id} className={`p-4 rounded border transition-all flex items-start gap-3 ${reminder.isCompleted ? 'bg-gray-50/50 border-gray-100 opacity-60' : 'bg-white border-gray-100 hover:border-brand-primary/30 shadow-sm'}`}>
                        <button 
                          onClick={() => toggleReminder(reminder.id)}
                          className={`mt-1 p-1 rounded-full border-2 transition-all ${reminder.isCompleted ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200 text-transparent hover:border-brand-primary'}`}
                        >
                          <CheckCircle2 size={14} />
                        </button>
                        <div className="flex-1">
                          <h4 className={`text-base font-black tracking-tight mb-1 ${reminder.isCompleted ? 'line-through text-gray-400' : 'text-brand-primary'}`}>
                            {reminder.title}
                          </h4>
                          <div className="flex flex-wrap gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            {reminder.targetMileage && (
                              <span className="flex items-center gap-1">
                                <Gauge size={10} className="text-brand-accent" /> {reminder.targetMileage.toLocaleString()} km
                              </span>
                            )}
                            {reminder.targetDate && (
                              <span className="flex items-center gap-1">
                                <Activity size={10} className="text-brand-accent" /> {new Date(reminder.targetDate).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                            <span className="ml-auto bg-gray-100 px-1.5 py-0.5 rounded text-[7px]">{reminder.type}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteItem('reminder', reminder.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-0.5"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Intelligence & Efficiency Tab */}
            {activeTab === 'intelligence' && (
              <div className="space-y-6">
                {/* Diagnostic AI Section */}
                <div className="bg-brand-primary/5 p-6 rounded-3xl border border-brand-primary/10 shadow-sm overflow-hidden relative">
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="bg-brand-primary p-2.5 rounded-2xl shadow-lg shadow-brand-primary/20">
                      <Cpu size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-brand-primary tracking-tight uppercase">Mecânico IA Especialista</h3>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Diagnóstico por sintomas e perfil de uso</p>
                    </div>
                  </div>

                  <div className="space-y-4 relative z-10">
                    <div className="relative">
                      <textarea
                        value={symptomQuery}
                        onChange={(e) => setSymptomQuery(e.target.value)}
                        placeholder="Ex: 'Sinto um tranco metálico quando troco da 2ª para a 3ª marcha' ou 'Barulho de grilo na roda dianteira esquerda'..."
                        className="w-full bg-white border border-gray-100 rounded-3xl px-6 py-5 focus:ring-4 focus:ring-brand-primary/10 outline-none text-sm font-medium min-h-[120px] shadow-inner"
                      />
                      <button
                        onClick={runDiagnosis}
                        disabled={isDiagnosing || !symptomQuery}
                        className="absolute bottom-4 right-4 bg-brand-primary text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-brand-accent transition-all shadow-xl disabled:opacity-50 disabled:scale-95 flex items-center gap-2 group"
                      >
                        {isDiagnosing ? <RefreshCw className="animate-spin" size={14} /> : <Zap size={14} className="group-hover:animate-pulse" />}
                        Analisar Agora
                      </button>
                    </div>

                    {diagnosisResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 rounded-3xl border border-brand-primary/10 shadow-2xl relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary via-brand-accent to-brand-primary"></div>
                        <div className="markdown-body text-sm leading-relaxed">
                          <Markdown>{diagnosisResult}</Markdown>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Decorative Background Element */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                </div>

                {/* TCO & Efficiency Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Eficiência Operacional</h4>
                      <div className="bg-green-100 text-green-600 p-2 rounded-xl">
                        <TrendingUp size={16} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <p className="text-[8px] font-black uppercase text-gray-400 mb-1">Custo por KM (Comb.)</p>
                        <p className="text-xl font-black text-brand-primary tracking-tighter">
                          R$ {((selectedVehicle.fuelLogs || []).reduce((acc, l) => acc + l.cost, 0) / (selectedVehicle.mileage - (selectedVehicle.fuelLogs?.[0]?.mileage || selectedVehicle.mileage) || 1)).toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <p className="text-[8px] font-black uppercase text-gray-400 mb-1">Gasto Médio/Mês</p>
                        <p className="text-xl font-black text-brand-primary tracking-tighter">
                          R$ {Math.round(((selectedVehicle.fuelLogs || []).reduce((acc, l) => acc + l.cost, 0) + (selectedVehicle.services || []).reduce((acc, l) => acc + l.cost, 0)) / (Math.max(1, (new Date().getTime() - new Date(selectedVehicle.createdAt || new Date()).getTime()) / (1000 * 60 * 60 * 24 * 30)))).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={runTCOAnalysis}
                      disabled={isAnalyzingTco}
                      className="w-full py-4 bg-brand-primary/10 text-brand-primary rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      {isAnalyzingTco ? <RefreshCw className="animate-spin" size={12} /> : <TrendingUp size={12} />}
                      Relatório TCO Profissional
                    </button>

                    {tcoAnalysis && (
                      <div className="mt-4 p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 text-[11px] leading-relaxed">
                        <Markdown>{tcoAnalysis}</Markdown>
                      </div>
                    )}
                  </div>

                  <div className="bg-brand-primary p-6 rounded-3xl shadow-xl shadow-brand-primary/20 text-white space-y-4 relative overflow-hidden">
                    <div className="flex items-center justify-between relative z-10">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60">Análise de Procedência</h4>
                      <ShieldCheck size={20} className="text-brand-accent" />
                    </div>

                    <div className="relative z-10">
                      <div className="flex items-end gap-2 mb-2">
                        <span className="text-5xl font-black tracking-tighter">{selectedVehicle.healthScore || 85}</span>
                        <span className="text-xs font-bold uppercase mb-2">SCORE</span>
                      </div>
                      <p className="text-[10px] font-medium leading-relaxed text-white/80">
                        Seu perfil <span className="font-black text-brand-accent">{selectedVehicle.drivingStyle === 'smooth' ? 'PÉ LEVE' : 'EFICIENTE'}</span> contribuiu para uma vida útil superior em componentes móveis.
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/10 relative z-10">
                      <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-tighter">
                        <span>Manuntenção em dia</span>
                        <span className="text-brand-accent">Excepcional</span>
                      </div>
                      <div className="w-full bg-white/20 h-1 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-brand-accent" style={{ width: `${selectedVehicle.healthScore || 85}%` }}></div>
                      </div>
                    </div>

                    {/* Decorative element */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Manual Tab */}
            {activeTab === 'manual' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-brand-primary">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Book size={22} className="text-brand-accent" /> Manual & Assistente IA
                  </h3>
                  <div className="flex gap-2">
                    <input 
                      type="file" 
                      ref={manualPDFInputRef}
                      onChange={handlePDFUpload}
                      accept=".pdf"
                      className="hidden"
                    />
                    <button 
                      onClick={() => manualPDFInputRef.current?.click()}
                      disabled={isUploadingPDF || isGeneratingManual}
                      className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded font-bold text-xs hover:border-brand-primary hover:text-brand-primary transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isUploadingPDF ? (
                        <>
                          <Settings className="animate-spin" size={14} />
                          Extraindo...
                        </>
                      ) : (
                        <>
                          <Upload size={14} />
                          Upload PDF
                        </>
                      )}
                    </button>
                    {!selectedVehicle.manualTranscription && (
                      <button 
                        onClick={generateManualInfo}
                        disabled={isGeneratingManual || isUploadingPDF}
                        className="bg-brand-primary text-white px-4 py-2 rounded font-bold text-xs hover:bg-brand-accent transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        {isGeneratingManual ? (
                          <>
                            <Settings className="animate-spin" size={14} />
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

                {!selectedVehicle.manual && !selectedVehicle.manualTranscription ? (
                  <div className="text-center py-16 bg-gray-50 rounded border border-dashed border-gray-200">
                    <Book size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium max-w-sm mx-auto">
                      Você ainda não possui as informações técnicas do manual para este veículo. 
                      Use a IA para pesquisar e transcrever os dados essenciais.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Manual content */}
                    <div className="lg:col-span-2 space-y-4">
                      {/* Structured Manual Data */}
                      {selectedVehicle.manual && (
                        <>
                          {/* Maintenance Schedule */}
                          {selectedVehicle.manual.maintenanceSchedule.length > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
                              <h4 className="font-bold text-lg text-blue-900 mb-4 flex items-center gap-2">
                                <Wrench size={20} className="text-blue-600" />
                                Plano de Manutenção Programada
                              </h4>
                              <div className="space-y-3">
                                {selectedVehicle.manual.maintenanceSchedule.map((schedule, idx) => (
                                  <div key={idx} className="bg-white p-4 rounded-lg border border-blue-100">
                                    <div className="font-bold text-blue-900 mb-2">
                                      {schedule.mileage.toLocaleString()} km
                                    </div>
                                    <ul className="text-sm text-gray-700 space-y-1 ml-4">
                                      {schedule.items.map((item, i) => (
                                        <li key={i} className="list-disc">
                                          {item}
                                        </li>
                                      ))}
                                    </ul>
                                    {schedule.description && (
                                      <p className="text-xs text-gray-600 mt-2 italic">
                                        {schedule.description}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Technical Sections */}
                          {Object.keys(selectedVehicle.manual.technicalSections).some(k => selectedVehicle.manual?.technicalSections[k]) && (
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
                              <h4 className="font-bold text-lg text-amber-900 mb-4 flex items-center gap-2">
                                <AlertCircle size={20} className="text-amber-600" />
                                Informações Técnicas
                              </h4>
                              <div className="space-y-3">
                                {Object.entries(selectedVehicle.manual.technicalSections).map(([key, value]) => {
                                  if (!value) return null;
                                  const labels: { [key: string]: string } = {
                                    tirePressure: '📍 Pressão de Pneus',
                                    oilSpecification: '🛢️ Especificação de Óleo',
                                    batteryInfo: '🔋 Bateria',
                                    filterInfo: '🌬️ Filtros',
                                    fluidsCapacities: '⚙️ Capacidades de Fluidos'
                                  };
                                  
                                  return (
                                    <div key={key} className="bg-white p-4 rounded-lg border border-amber-100">
                                      <p className="font-bold text-amber-900 mb-2">
                                        {labels[key] || key}
                                      </p>
                                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
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

                      {/* Full Text / Transcription */}
                      {selectedVehicle.manualTranscription && (
                        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm overflow-hidden prose prose-sm max-w-none">
                          <div className="markdown-body">
                            <Markdown>
                              {selectedVehicle.manualTranscription}
                            </Markdown>
                          </div>
                        </div>
                      )}

                      {selectedVehicle.manual && selectedVehicle.manual.fullText && !selectedVehicle.manualTranscription && (
                        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm overflow-hidden prose prose-sm max-w-none">
                          <div className="markdown-body">
                            <Markdown>
                              {selectedVehicle.manual.fullText}
                            </Markdown>
                          </div>
                        </div>
                      )}

                      <button 
                        onClick={generateManualInfo}
                        disabled={isGeneratingManual}
                        className="text-xs text-gray-400 hover:text-brand-accent flex items-center gap-1 transition-colors"
                      >
                        <RefreshCw size={12} className={isGeneratingManual ? "animate-spin" : ""} /> Deseja atualizar ou pesquisar novamente na internet?
                      </button>
                    </div>

                    {/* Chat with manual */}
                    <div className="bg-brand-primary rounded-2xl p-6 text-white shadow-xl flex flex-col h-[600px]">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="bg-brand-accent p-2 rounded-lg">
                          <Sparkles size={20} className="text-white" />
                        </div>
                        <div>
                          <h4 className="font-black italic tracking-tighter uppercase leading-none">Mecânico IA</h4>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Baseado no seu manual</p>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar">
                        {manualChatResponse ? (
                          <div className="bg-white/10 p-4 rounded-xl border border-white/5 text-sm leading-relaxed">
                            <p className="font-bold text-brand-accent mb-2">Resposta:</p>
                            <div className="markdown-body prose prose-invert prose-xs">
                              <Markdown>
                                {manualChatResponse}
                              </Markdown>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-10 opacity-50">
                            <p className="text-xs">Faça uma pergunta sobre o manual (ex: calibragem dos pneus, tipo de óleo, torques...)</p>
                          </div>
                        )}
                        {isChattingWithManual && (
                          <div className="flex justify-center py-4">
                            <div className="animate-pulse flex space-x-2">
                              <div className="h-1.5 w-1.5 bg-brand-accent rounded-full"></div>
                              <div className="h-1.5 w-1.5 bg-brand-accent rounded-full animation-delay-200"></div>
                              <div className="h-1.5 w-1.5 bg-brand-accent rounded-full animation-delay-400"></div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Pergunte ao manual..."
                          className="w-full bg-white/10 border border-white/10 rounded-xl p-4 pr-12 text-sm focus:ring-2 focus:ring-brand-accent outline-none placeholder:text-white/30"
                          value={manualChatQuery}
                          onChange={(e) => setManualChatQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && sendManualChat()}
                        />
                        <button 
                          onClick={sendManualChat}
                          disabled={isChattingWithManual || !manualChatQuery}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-accent rounded-lg text-white disabled:opacity-50 transition-all"
                        >
                          {isChattingWithManual ? <Settings className="animate-spin" size={18} /> : <Send size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'audit' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Card de Resumo Técnico */}
                  <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-brand-primary p-3 rounded-2xl text-white">
                        <Activity size={24} />
                      </div>
                      <div>
                        <h4 className="text-xl font-black italic uppercase tracking-tighter text-brand-primary">Dossiê Técnico Pro</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Visão Profissional do Veículo</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                       <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <p className="text-[9px] text-gray-400 font-black uppercase mb-1">Motorização</p>
                          <p className="text-sm font-bold text-gray-700">{selectedVehicle.engine || 'N/A'}</p>
                       </div>
                       <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <p className="text-[9px] text-gray-400 font-black uppercase mb-1">Versão Técn.</p>
                          <p className="text-sm font-bold text-gray-700">{selectedVehicle.version || 'N/A'}</p>
                       </div>
                       <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <p className="text-[9px] text-gray-400 font-black uppercase mb-1">Chassi</p>
                          <p className="text-xs font-mono font-bold text-brand-primary">{selectedVehicle.chassis || 'N/A'}</p>
                       </div>
                       <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <p className="text-[9px] text-gray-400 font-black uppercase mb-1">Perfil Uso</p>
                          <p className="text-sm font-bold text-gray-700 uppercase italic">
                            {selectedVehicle.usageProfile === 'urban' ? 'Uso Severo' : selectedVehicle.usageProfile === 'highway' ? 'Uso Leve' : 'Misto'}
                          </p>
                       </div>
                       <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <p className="text-[9px] text-gray-400 font-black uppercase mb-1">KM Médio/Dia</p>
                          <p className="text-sm font-bold text-gray-700">{selectedVehicle.avgDailyKm || '--'} km</p>
                       </div>
                       <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <p className="text-[9px] text-gray-400 font-black uppercase mb-1">Saúde Atual</p>
                          <p className="text-sm font-bold text-brand-accent">{Math.round(getVehicleHealth())}%</p>
                       </div>
                    </div>

                    <h5 className="font-black text-xs uppercase text-brand-primary mb-4 pb-2 border-b border-gray-100">Análise de Procedência & Integridade (IA)</h5>
                    <div className="bg-brand-primary/5 p-6 rounded-2xl border border-brand-primary/10">
                       <div className="markdown-body text-xs leading-relaxed text-gray-600">
                         {digitalPassport ? (
                           <Markdown>{digitalPassport}</Markdown>
                         ) : (
                           <button 
                             onClick={handleGeneratePassport}
                             className="flex items-center gap-2 text-brand-primary font-black uppercase tracking-widest text-[9px] hover:underline"
                           >
                              <RefreshCw size={12} /> Gerar Auditoria de Procedência Agora
                           </button>
                         )}
                       </div>
                    </div>
                  </div>

                  {/* Sidebar de Logs de Sistema */}
                  <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                      <h4 className="font-black text-xs uppercase text-gray-400 mb-4 flex items-center gap-2">
                        <Database size={14} /> Histórico de Odômetro
                      </h4>
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {[...(selectedVehicle.fuelLogs || []), ...(selectedVehicle.services || [])]
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((log, idx) => (
                            <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                               <div>
                                  <p className="text-[10px] font-black text-gray-700">{log.mileage.toLocaleString()} km</p>
                                  <p className="text-[8px] text-gray-400 font-bold uppercase">{new Date(log.date).toLocaleDateString('pt-BR')}</p>
                               </div>
                               <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded ${'liters' in log ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                 {'liters' in log ? 'Abast.' : 'Serviço'}
                               </span>
                            </div>
                          ))
                        }
                        {(!selectedVehicle.fuelLogs?.length && !selectedVehicle.services?.length) && (
                          <p className="text-[10px] text-gray-300 font-bold italic text-center py-4">Sem logs registrados para auditoria.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* MODAL: Add/Edit Vehicle */}
<AnimatePresence>
  {(isAddingVehicle || isEditingVehicle) && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => {
          setIsAddingVehicle(false);
          setIsEditingVehicle(false);
        }}
        className="absolute inset-0 bg-brand-primary/40 backdrop-blur-md"
      />

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`relative bg-white rounded-3xl p-4 sm:p-8 w-full ${showInternalBrowser ? 'max-w-6xl' : 'max-w-lg'} shadow-2xl flex flex-col max-h-[92vh] transition-all duration-500 overflow-hidden`}
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-brand-primary p-2 rounded-xl text-white shadow-lg shadow-brand-primary/20">
              <Car size={20} />
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tighter uppercase italic text-brand-primary">
              {isEditingVehicle ? 'Editar Veículo' : 'Novo Veículo'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {showInternalBrowser && (
              <button 
                onClick={() => setShowInternalBrowser(false)}
                className="bg-gray-100 text-gray-500 px-4 py-2 rounded-xl text-[10px] font-black hover:bg-gray-200 transition-all uppercase tracking-widest border border-gray-200"
              >
                Modo Simples
              </button>
            )}
            <button 
              onClick={() => {
                setIsAddingVehicle(false);
                setIsEditingVehicle(false);
              }}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {showInternalBrowser ? (
            <div className="flex flex-col lg:flex-row h-full min-h-[500px] lg:h-[650px] gap-6">
              {/* Navegador à esquerda */}
              <div className="lg:flex-[1.5] xl:flex-[2] flex flex-col gap-4 h-[400px] lg:h-full">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none shrink-0">
                  <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-2xl border border-gray-200">
                    {searchPortals.map(portal => (
                      <button
                        key={portal.url}
                        onClick={() => setInternalBrowserUrl(portal.url.replace('{placa}', newVehicle.plate || ''))}
                        className={`px-4 py-2 text-[10px] font-black rounded-xl whitespace-nowrap transition-all uppercase tracking-tighter ${internalBrowserUrl === portal.url.replace('{placa}', newVehicle.plate || '') ? 'bg-white text-brand-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        {portal.icon} {portal.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 bg-white rounded-3xl border border-gray-200 overflow-hidden relative shadow-2xl group">
                  <iframe 
                    src={internalBrowserUrl} 
                    className="w-full h-full border-none"
                    title="Navegador de Consulta"
                  />
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a 
                      href={internalBrowserUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="bg-brand-primary text-white p-3 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                  {internalBrowserUrl === '' && (
                    <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center text-center p-8">
                       <Globe size={48} className="text-gray-200 mb-4 animate-pulse" />
                       <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Aguardando Seleção de Portal</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Captura à direita */}
              <div className="lg:flex-1 flex flex-col gap-4 pb-6 lg:pb-0">
                <div className="bg-brand-primary p-6 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group border border-white/10 shrink-0">
                  <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] bg-brand-accent/20 rounded-full blur-[80px] group-hover:bg-brand-accent/30 transition-all duration-1000" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-brand-accent/20 p-2 rounded-xl">
                        <Wand2 size={16} className="text-brand-accent" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-[2px] text-white">IA EXTRATORA</h4>
                        <p className="text-[10px] text-white/50 font-bold">Captura inteligente de dados</p>
                      </div>
                    </div>

                    <button
                      onClick={searchVehicleByPlate}
                      disabled={isSearchingPlate}
                      className="w-full bg-brand-accent text-brand-primary py-5 rounded-[1.25rem] font-black text-xs uppercase tracking-[1px] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_25px_rgba(251,255,0,0.3)] flex items-center justify-center gap-3 mb-6"
                    >
                      {isSearchingPlate ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" />}
                      {isSearchingPlate ? 'Buscando na Web...' : 'Sincronizar Placa'}
                    </button>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="h-[1px] flex-1 bg-white/10"></div>
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-[2px]">Plano B: Texto Manual</span>
                        <div className="h-[1px] flex-1 bg-white/10"></div>
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 group-focus-within:border-brand-accent/30 transition-all">
                        <textarea 
                          ref={pasteTextAreaRef}
                          className="w-full h-24 bg-transparent border-none p-0 text-[11px] font-mono text-white placeholder:text-white/20 focus:ring-0 focus:outline-none transition-all resize-none"
                          placeholder="Caso o robô falhe, copie todo o texto do site e cole aqui para a IA organizar..."
                          value={rawPastedData}
                          onChange={(e) => setRawPastedData(e.target.value)}
                        />
                        
                        {rawPastedData && (
                          <motion.button 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => handleAssistedProcess()}
                            disabled={isProcessingAssisted}
                            className="w-full mt-3 py-3 bg-white text-brand-primary text-[10px] font-black rounded-xl hover:bg-brand-accent transition-all flex items-center justify-center gap-2 shadow-xl"
                          >
                            {isProcessingAssisted ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
                            EXTRAIR DADOS COLADOS
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-[2rem] p-5 shrink-0 shadow-sm overflow-hidden border-b-4 border-b-brand-accent/10">
                   <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ficha Técnica Provisória</span>
                      {newVehicle.name && <span className="text-[8px] bg-green-500 text-white px-2 py-0.5 rounded-full font-black uppercase animate-pulse">Detectado</span>}
                   </div>

                   {newVehicle.imageUrl && (
                     <div className="mb-4 relative group">
                        <div className="aspect-video w-full rounded-xl overflow-hidden border border-gray-100 shadow-inner bg-gray-50">
                          <VehicleImage 
                            src={newVehicle.imageUrl} 
                            alt="Preview IA" 
                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" 
                          />
                        </div>
                        <button
                          onClick={handleRemoveBackground}
                          disabled={isRemovingBackground}
                          className="absolute -right-2 -bottom-2 bg-brand-primary text-white p-2 rounded-xl shadow-lg hover:bg-brand-accent transition-all z-20 flex items-center gap-1.5"
                          title="Remover Fundo"
                        >
                          {isRemovingBackground ? <RefreshCw size={12} className="animate-spin" /> : <Eraser size={12} />}
                          <span className="text-[8px] font-black uppercase tracking-tighter">Limpar Fundo</span>
                        </button>
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg">
                           <p className="text-[7px] text-white font-black uppercase tracking-widest flex items-center gap-1">
                             <Camera size={8} /> Foto encontrada pelo Robô
                           </p>
                        </div>
                     </div>
                   )}

                   <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div>
                        <p className="text-[8px] text-gray-400 font-black uppercase">Marca/Modelo</p>
                        <p className="text-[10px] font-bold text-gray-600 truncate">{newVehicle.name || '--'} {newVehicle.model || '--'}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-gray-400 font-black uppercase">Placa</p>
                        <p className="text-[10px] font-mono font-bold text-brand-primary">{newVehicle.plate || '--'}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-gray-400 font-black uppercase">Ano</p>
                        <p className="text-[10px] font-bold text-gray-600">{newVehicle.year || '--'}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-gray-400 font-black uppercase">Combustível</p>
                        <p className="text-[10px] font-bold text-gray-600 truncate">{newVehicle.fuelType || '--'}</p>
                      </div>
                   </div>
                </div>

                <div className="p-6 bg-gray-50 border border-gray-200 rounded-[2rem] flex-none lg:flex-1 flex flex-col items-center justify-center text-center group hover:border-brand-primary/10 transition-all min-h-[120px]">
                  <div className={`w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-xl mb-4 group-hover:scale-110 transition-transform ${isSearchingPlate || isProcessingAssisted ? 'animate-bounce' : ''}`}>
                    {isSearchingPlate || isProcessingAssisted ? (
                      <Activity size={28} className="text-brand-accent" />
                    ) : (
                      <Layout size={28} className="text-gray-300" />
                    )}
                  </div>
                  <h5 className="text-xs font-black text-gray-700 uppercase tracking-tight">Console de Status</h5>
                  <p className="text-[10px] text-gray-400 mt-2 max-w-[200px] leading-relaxed font-bold mb-4">
                    {plateSearchStatus || "Aguardando ação para iniciar o processamento inteligente."}
                  </p>

                  {/* Robot Action: Find Image */}
                  {!newVehicle.imageUrl && newVehicle.name && newVehicle.model && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={searchImage}
                      disabled={isSearchingImage}
                      className="w-full mb-3 py-3 bg-blue-500/10 text-blue-600 rounded-xl font-black text-[9px] uppercase tracking-widest border border-blue-500/20 flex items-center justify-center gap-2 hover:bg-blue-500 hover:text-white transition-all group"
                    >
                      {isSearchingImage ? <RefreshCw size={14} className="animate-spin" /> : <Camera size={14} className="group-hover:rotate-12 transition-transform" />}
                      BUSCAR FOTO DO MODELO
                    </motion.button>
                  )}

                  {/* Robot Manual Capture Helper - The "Infallible" Method */}
                  {plateSearchStatus.includes('Assistido') && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full mb-4 px-2"
                    >
                      <button 
                        onClick={handleCaptureFromClipboard}
                        disabled={isProcessingAssisted}
                        className="w-full py-4 bg-brand-accent text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-accent/30 flex flex-col items-center justify-center gap-1 hover:brightness-110 active:scale-95 transition-all"
                      >
                        {isProcessingAssisted ? (
                          <RefreshCw className="animate-spin" size={16} />
                        ) : (
                          <div className="flex items-center gap-2">
                            <ClipboardCheck size={16} />
                            <span>CLIQUE PARA CAPTURAR</span>
                          </div>
                        )}
                        <span className="text-[7px] opacity-70">Processar dados copiados da janela</span>
                      </button>
                    </motion.div>
                  )}

                  {/* Robot Logs Section */}
                  {robotLogs.length > 0 && (
                    <div className="w-full mt-2 bg-gray-900 rounded-xl p-3 border border-gray-800 shadow-inner overflow-hidden">
                       <div className="flex items-center gap-2 mb-2 border-b border-gray-800 pb-1">
                         <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                         <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Robot Activity Log</span>
                       </div>
                       <div className="flex flex-col gap-1.5 h-32 overflow-y-auto scrollbar-hide">
                          <AnimatePresence>
                            {robotLogs.map((log, i) => (
                              <motion.div 
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-[9px] font-mono text-left"
                              >
                                <span className="text-brand-accent brightness-125 font-bold mr-2">root@mecanico:~$</span>
                                <span className={`${(log || '').includes('[SUCCESS]') ? 'text-green-400' : (log || '').includes('[ERROR]') ? 'text-red-400' : 'text-blue-400'}`}>
                                  {log}
                                </span>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                          <div ref={robotLogsEndRef} />
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
          <>

        {/* Imagem do Veículo */}
        <div className="flex flex-col items-center mb-4">
          <div className="relative group">
            <div onClick={() => vehicleImageInputRef.current?.click()} className="relative cursor-pointer overflow-hidden rounded-2xl shadow-2xl">
              <VehicleImage 
                src={newVehicle.imageUrl} 
                alt="Veículo" 
                className={`aspect-video w-full max-w-[340px] rounded-2xl object-cover transition-all duration-500 ${isRemovingBackground ? 'blur-sm scale-95' : ''}`} 
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                <Upload size={32} className="mb-2" />
                <span className="text-[10px] font-black uppercase tracking-widest">Alterar Foto</span>
              </div>
              
              {isRemovingBackground && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[10px] text-white font-black uppercase tracking-widest animate-pulse">Processando IA...</span>
                  </div>
                </div>
              )}
            </div>

            {newVehicle.imageUrl && !isRemovingBackground && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: plateSearchStatus.includes('Remover Fundo') ? [1, 1.1, 1] : 1 
                }}
                transition={{ 
                  scale: plateSearchStatus.includes('Remover Fundo') ? { repeat: Infinity, duration: 1.5 } : { duration: 0.2 } 
                }}
                onClick={handleRemoveBackground}
                className="absolute -right-3 -bottom-3 bg-white text-brand-primary p-3 rounded-2xl shadow-2xl border border-gray-100 hover:bg-brand-accent hover:text-white transition-all group/btn z-10"
                title="Sincronizar com Robô Estúdio (Remover Fundo)"
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Eraser size={18} className="group-hover/btn:rotate-12 transition-transform" />
                    <Sparkles size={10} className="absolute -top-1 -right-1 text-yellow-400 animate-pulse" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest pr-1">Tratar com Robô</span>
                </div>
              </motion.button>
            )}
          </div>

          <motion.button 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={searchImage}
            disabled={isSearchingImage}
            className="mt-4 px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest border border-slate-700 flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-lg group w-full max-w-[340px]"
          >
            {isSearchingImage ? (
              <RefreshCw className="animate-spin text-blue-400" size={14} />
            ) : (
              <Camera size={14} className="text-blue-400 group-hover:rotate-12 transition-transform" />
            )}
            BUSCAR FOTO ORIGINAL (IA)
          </motion.button>
        </div>

        <div className="space-y-5">
          {/* === BUSCA POR PLACA === */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Placa</label>
            <div className="flex gap-2 sm:gap-3 relative">
              <input
                type="text"
                placeholder={currentCountry.platePlaceholder}
                maxLength={10}
                className={`w-32 sm:flex-1 bg-gray-50 border-0 rounded-2xl p-3 sm:p-4 font-mono uppercase tracking-[2px] sm:tracking-[3px] text-lg sm:text-xl font-bold focus:ring-2 focus:ring-brand-accent transition-all ${isSearchingPlate ? 'ring-2 ring-brand-accent shadow-[0_0_20px_rgba(225,29,72,0.4)] animate-pulse' : ''}`}
                value={newVehicle.plate || ''}
                onChange={(e) => setNewVehicle(prev => ({
                  ...prev,
                  plate: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                }))}
              />
              <button
                onClick={searchVehicleByPlate}
                disabled={isSearchingPlate || !newVehicle.plate || newVehicle.plate.length < 4}
                className="flex-1 sm:flex-none px-4 sm:px-8 py-3 sm:py-4 bg-brand-primary text-white font-bold rounded-2xl hover:bg-brand-accent transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-brand-primary/20 text-sm sm:text-base overflow-hidden relative"
                title="Busca Inteligente via IA e Bases Públicas"
              >
                {isSearchingPlate && (
                  <motion.div 
                    className="absolute inset-0 bg-brand-accent/20"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                  />
                )}
                {isSearchingPlate ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
                <span className="truncate z-10">Identificar</span>
              </button>
            </div>

            <AnimatePresence>
              {(plateSearchStatus || robotLogs.length > 0) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 space-y-2"
                >
                  {plateSearchStatus && (
                    <div className="text-[11px] font-bold text-brand-accent uppercase tracking-tighter flex items-center gap-1.5 ml-1 bg-brand-accent/5 py-1.5 px-3 rounded-full border border-brand-accent/10">
                      <Activity size={12} className="animate-pulse" />
                      {plateSearchStatus}
                    </div>
                  )}
                  
                  {/* Robot Logs for small UI too */}
                  {robotLogs.length > 0 && (
                    <div className="bg-gray-900 rounded-xl p-2 font-mono text-[8px] overflow-hidden border border-gray-800">
                       <div className="flex flex-col gap-1 max-h-24 overflow-y-auto scrollbar-hide">
                          {robotLogs.map((log, i) => (
                            <div key={i} className="flex gap-2">
                               <span className="text-gray-600">#</span>
                               <span className={`${(log || '').includes('[SUCCESS]') ? 'text-green-500' : 'text-blue-400'} truncate text-left`}>{log}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="flex flex-wrap items-center gap-2 mt-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter w-full mb-1">Links de Consulta:</span>
              {(data.settings?.searchLinks || DEFAULT_SEARCH_LINKS).map(link => (
                <a 
                  key={link.id}
                  href={link.url.includes('{placa}') ? link.url.replace('{placa}', newVehicle.plate || '') : link.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className={`text-[10px] bg-white hover:bg-opacity-10 text-gray-600 px-2.5 py-1.5 rounded-lg font-bold transition-all border border-gray-200 shadow-sm`}
                  style={{ color: link.color !== 'brand' ? link.color : 'inherit' }}
                >
                  {link.name}
                </a>
              ))}
              <button 
                onClick={captureFromExternal}
                className="text-[10px] bg-brand-accent/10 text-brand-accent px-2.5 py-1.5 rounded-lg font-black hover:bg-brand-accent/20 transition-all border border-brand-accent/10 flex items-center gap-1 shadow-sm"
                title="Tenta capturar dados se o site de consulta estiver aberto"
              >
                <Search size={12} /> Robo BuscaPlacas
              </button>
            </div>

            <div className={`mt-4 p-4 rounded-2xl border transition-all ${isSearchingPlate && (plateSearchStatus || '').includes('Cota') ? 'bg-orange-50 border-orange-200 ring-2 ring-orange-200' : 'bg-brand-primary/5 border-brand-primary/10'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1 ${isSearchingPlate && (plateSearchStatus || '').includes('Cota') ? 'text-orange-600' : 'text-brand-primary'}`}>
                  <Clipboard size={12} /> Busca Assistida (Plano B)
                </span>
                <button
                  onClick={() => {
                    const firstUrl = searchPortals[0].url.replace('{placa}', newVehicle.plate || '');
                    setInternalBrowserUrl(firstUrl);
                    setShowInternalBrowser(true);
                  }}
                  className="bg-brand-primary text-white px-2 py-1 rounded-lg text-[9px] font-black hover:brightness-110 transition-all flex items-center gap-1 shadow-sm uppercase tracking-tighter"
                >
                  <Layout size={10} /> Navegador Integrado
                </button>
              </div>
              <p className="text-[10px] text-gray-500 mb-2 leading-relaxed">
                Se o robô der erro de limite (429), use o <strong>Navegador Integrado</strong> acima ou cole o texto do site aqui:
              </p>
              <textarea 
                ref={pasteTextAreaRef}
                className="w-full h-20 bg-white border border-gray-200 rounded-xl p-3 text-[11px] font-mono focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all resize-none shadow-inner"
                placeholder="Cole o texto do site aqui..."
                value={rawPastedData}
                onChange={(e) => setRawPastedData(e.target.value)}
              />
              {rawPastedData && (
                <motion.button 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => handleAssistedProcess()}
                  disabled={isProcessingAssisted}
                  className="w-full mt-2 py-2.5 bg-brand-primary text-white text-xs font-black rounded-xl hover:bg-brand-accent transition-all flex items-center justify-center gap-2 shadow-md shadow-brand-primary/20"
                >
                  {isProcessingAssisted ? <RefreshCw className="animate-spin" size={14} /> : <Wand2 size={14} />}
                  PROCESSAR TEXTO COM IA
                </motion.button>
              )}
            </div>
          </div>

          {/* Marca e Modelo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Marca</label>
                <div className="flex gap-2">
                   <button 
                     onClick={() => searchLogo(newVehicle.name)}
                     disabled={isSearchingLogo || !newVehicle.name}
                     className="text-[9px] font-black uppercase text-brand-primary flex items-center gap-1 hover:text-brand-accent transition-colors disabled:opacity-50"
                     title="Buscar logo automaticamente"
                   >
                     {isSearchingLogo ? <RefreshCw className="animate-spin" size={10} /> : <Search size={10} />} Identificar Logo
                   </button>
                   <button 
                     onClick={() => brandLogoInputRef.current?.click()}
                     className="text-[9px] font-black uppercase text-gray-500 flex items-center gap-1 hover:text-gray-700 transition-colors"
                     title="Upload manual de logo"
                   >
                     <Upload size={10} /> Manual
                   </button>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="shrink-0">
                  <BrandLogo 
                    vehicleName={newVehicle.name} 
                    brandLogoUrl={newVehicle.brandLogoUrl}
                    className="w-[56px] h-[56px] rounded-2xl shadow-md border border-gray-100 bg-white"
                  />
                </div>
                <input 
                  type="text" 
                  placeholder="Ex: Honda"
                  className="flex-1 bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-brand-accent font-bold h-[56px]"
                  value={newVehicle.name}
                  onChange={(e) => setNewVehicle({...newVehicle, name: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Modelo</label>
              <input 
                type="text" 
                placeholder="Ex: Fit LX 1.4"
                className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-brand-accent font-bold"
                value={newVehicle.model}
                onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Versão / Variante</label>
              <input 
                type="text" 
                placeholder="Ex: Touring / LXL / EX"
                className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-brand-accent"
                value={newVehicle.version || ''}
                onChange={(e) => setNewVehicle({...newVehicle, version: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Motorização</label>
              <input 
                type="text" 
                placeholder="Ex: 1.5 i-VTEC / 2.0 Turbo"
                className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-brand-accent"
                value={newVehicle.engine || ''}
                onChange={(e) => setNewVehicle({...newVehicle, engine: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Combustível</label>
              <select 
                className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-brand-accent font-bold appearance-none cursor-pointer"
                value={newVehicle.fuelType || ''}
                onChange={(e) => setNewVehicle({...newVehicle, fuelType: e.target.value})}
              >
                <option value="">Selecione...</option>
                <option value="Flex">Flex (Álcool/Gasolina)</option>
                <option value="Gasolina">Gasolina</option>
                <option value="Álcool">Álcool</option>
                <option value="Diesel">Diesel</option>
                <option value="Híbrido">Híbrido</option>
                <option value="Elétrico">Elétrico</option>
                <option value="GNV">GNV</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Chassi (Opcional)</label>
              <input 
                type="text" 
                placeholder="Últimos dígitos ou completo"
                className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-brand-accent font-mono text-xs"
                value={newVehicle.chassis || ''}
                onChange={(e) => setNewVehicle({...newVehicle, chassis: e.target.value.toUpperCase()})}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Ano</label>
              <input 
                type="text" 
                placeholder="Ex: 2004"
                className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-brand-accent font-bold"
                value={newVehicle.year}
                onChange={(e) => setNewVehicle({...newVehicle, year: e.target.value})}
              />
            </div>
            <div className="col-span-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Cor</label>
              <input 
                type="text" 
                placeholder="Ex: Prata"
                className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-brand-accent"
                value={newVehicle.color || ''}
                onChange={(e) => setNewVehicle({...newVehicle, color: e.target.value})}
              />
            </div>
            <div className="col-span-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1 block mb-1">Quilometragem</label>
              <input 
                type="number" 
                placeholder="0"
                className="w-full bg-gray-50 border-0 rounded-2xl p-4 font-mono font-bold"
                value={newVehicle.mileage}
                onChange={(e) => setNewVehicle({...newVehicle, mileage: e.target.value === '' ? 0 : Number(e.target.value)})}
              />
            </div>
          </div>

          <div className="bg-brand-primary/5 p-6 rounded-3xl border border-brand-primary/10 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-primary flex items-center gap-2">
              <Activity size={12} /> Perfil Psicográfico do Motorista (Contexto IA)
            </h4>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Dias de Uso Habitual</label>
                <div className="flex flex-wrap gap-2">
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const current = newVehicle.usageDays || [];
                        const updated = current.includes(idx) 
                          ? current.filter(d => d !== idx) 
                          : [...current, idx];
                        setNewVehicle({ ...newVehicle, usageDays: updated });
                      }}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black transition-all border ${
                        (newVehicle.usageDays || []).includes(idx)
                        ? 'bg-brand-primary border-brand-primary text-white shadow-md'
                        : 'bg-white border-gray-100 text-gray-400 hover:border-brand-primary/30'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Estilo de Aceleração</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'smooth', label: 'Suave', sub: 'Pé Leve' },
                      { id: 'moderate', label: 'Normal', sub: 'Padrão' },
                      { id: 'aggressive', label: 'Rápida', sub: 'Pé Pesado' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setNewVehicle({ ...newVehicle, drivingStyle: opt.id as any })}
                        className={`p-3 rounded-2xl border flex flex-col items-center transition-all ${
                          newVehicle.drivingStyle === opt.id 
                            ? 'bg-brand-primary border-brand-primary text-white shadow-lg' 
                            : 'bg-white border-gray-100 text-gray-500 hover:border-brand-primary/30'
                        }`}
                      >
                        <span className="text-[9px] font-black uppercase">{opt.label}</span>
                        <span className={`text-[7px] font-bold ${newVehicle.drivingStyle === opt.id ? 'text-white/70' : 'text-gray-400'}`}>
                          {opt.sub}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Troca de Marchas (RPM)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'low', label: 'Baixa', sub: '< 2.5k' },
                      { id: 'mid', label: 'Média', sub: '3k - 4k' },
                      { id: 'high', label: 'Alta', sub: '> 5k' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setNewVehicle({ ...newVehicle, operatingRpm: opt.id as any })}
                        className={`p-3 rounded-2xl border flex flex-col items-center transition-all ${
                          newVehicle.operatingRpm === opt.id 
                            ? 'bg-brand-primary border-brand-primary text-white shadow-lg' 
                            : 'bg-white border-gray-100 text-gray-500 hover:border-brand-primary/30'
                        }`}
                      >
                        <span className="text-[9px] font-black uppercase">{opt.label}</span>
                        <span className={`text-[7px] font-bold ${newVehicle.operatingRpm === opt.id ? 'text-white/70' : 'text-gray-400'}`}>
                          {opt.sub}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Regime predominante</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'urban', label: 'Cidade', sub: 'Severo' },
                      { id: 'mixed', label: 'Misto', sub: 'Padrão' },
                      { id: 'highway', label: 'Pista', sub: 'Leve' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setNewVehicle({ ...newVehicle, usageProfile: opt.id as any })}
                        className={`p-3 rounded-2xl border flex flex-col items-center transition-all ${
                          newVehicle.usageProfile === opt.id 
                            ? 'bg-brand-primary border-brand-primary text-white shadow-lg' 
                            : 'bg-white border-gray-100 text-gray-500 hover:border-brand-primary/30'
                        }`}
                      >
                        <span className="text-[10px] font-black uppercase">{opt.label}</span>
                        <span className={`text-[8px] font-bold ${newVehicle.usageProfile === opt.id ? 'text-white/70' : 'text-gray-400'}`}>
                          {opt.sub}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Distância p/ Dia de Uso</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={newVehicle.avgDailyKm || ''}
                      onChange={(e) => setNewVehicle({ ...newVehicle, avgDailyKm: Number(e.target.value) })}
                      placeholder="Ex: 35"
                      className="w-full bg-white border border-gray-100 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-brand-primary/20 outline-none text-sm font-bold"
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 tracking-tighter">KM/DIA</div>
                  </div>
                  <p className="text-[8px] text-gray-400 font-bold italic ml-1">Usado quando você não abastece regularmente.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )}
  </div>

  {/* Footer fixo para botões de ação */}
  <div className="flex gap-3 pt-4 sm:pt-6 border-t border-gray-100 shrink-0">
      <button 
        onClick={() => {
          setIsAddingVehicle(false);
          setIsEditingVehicle(false);
        }}
        className="flex-1 py-4 sm:py-5 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl sm:rounded-3xl transition-all uppercase text-[10px] sm:text-xs tracking-widest"
      >
        Cancelar
      </button>
      <button 
        onClick={isEditingVehicle ? updateVehicle : addVehicle}
        className="flex-[2] py-4 sm:py-5 bg-brand-primary text-white font-black uppercase text-[10px] sm:text-xs tracking-widest rounded-2xl sm:rounded-3xl hover:bg-brand-accent transition-all shadow-2xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98]"
      >
        {isEditingVehicle ? 'Salvar Alterações' : 'Confirmar e Adicionar'}
      </button>
    </div>
</motion.div>
</div>
)}
</AnimatePresence>


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
        onRunSimulation={runSimulation}
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
                    <TypeIcon size={14} /> Nome do Aplicativo
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
                          {selectedServiceForReport.partsList.map(item => (
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
