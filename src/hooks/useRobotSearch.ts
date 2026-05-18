import { useState, useRef, useEffect } from 'react';
import { Vehicle, Country, AppData } from '../types';
import { vehicleSearchService } from '../services/buscaPlacasService';
import { webVehicleSearchService } from '../services/webVehicleSearchService';
import { geminiService } from '../services/geminiService';
import { removeBackground } from "@imgly/background-removal";
import { formatCurrency } from '../lib/utils';

export function useRobotSearch(
  currentCountry: Country,
  data: AppData,
  newVehicle: Partial<Vehicle>,
  setNewVehicle: React.Dispatch<React.SetStateAction<any>>,
  selectedVehicle: Vehicle | null,
  updateSelectedVehicle: (updates: Partial<Vehicle>) => void,
  showInternalBrowser: boolean
) {
  const [isSearchingPlate, setIsSearchingPlate] = useState(false);
  const [plateSearchStatus, setPlateSearchStatus] = useState('');
  const [robotLogs, setRobotLogs] = useState<string[]>([]);
  const [isSearchingImage, setIsSearchingImage] = useState(false);
  const [isSearchingLogo, setIsSearchingLogo] = useState(false);
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);
  const [isCapturingFromWeb, setIsCapturingFromWeb] = useState(false);
  const [isProcessingAssisted, setIsProcessingAssisted] = useState(false);
  const [rawPastedData, setRawPastedData] = useState('');
  
  const robotPopupRef = useRef<Window | null>(null);
  const robotLogsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (robotLogsEndRef.current) {
      robotLogsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [robotLogs]);

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
        setNewVehicle((prev: any) => ({ ...prev, imageUrl: validUrl }));
        setRobotLogs(prev => [
          ...prev, 
          '[SUCCESS] Foto Original Validada e Localizada!', 
          '[ACTION] Abrindo imagem para você salvar...',
          '[INFO] Esta imagem passou no teste de integridade do robô.'
        ]);
        window.open(validUrl, '_blank');
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
          setNewVehicle((prev: any) => ({ ...prev, brandLogoUrl: validUrl }));
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

  const searchVehicleByPlate = async () => {
    const plate = newVehicle.plate?.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!plate || plate.length !== 7) {
      alert('Digite uma placa completa com 7 caracteres (ex: ABC1D23)');
      return;
    }

    setIsSearchingPlate(true);
    setPlateSearchStatus('🚀 INICIANDO ROBÔ DE CAPTURA...');
    setRobotLogs(['[INFO] Sistema de reconhecimento iniciado', `[INFO] Alvo: Placa ${plate}`]);
    
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

    let step = 0;
    const statusInterval = setInterval(() => {
      if (step < statuses.length) {
        setPlateSearchStatus(statuses[step]);
        setRobotLogs(prev => [...prev, `[STATUS] ${statuses[step]}`]);
        step++;
      }
    }, 1800);

    try {
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
          '[INFO] Extração concluída com sucesso.'
        ]);

        if (robotPopupRef.current && !robotPopupRef.current.closed) {
          robotPopupRef.current.close();
          robotPopupRef.current = null;
        }

        setNewVehicle((prev: any) => ({
          ...prev,
          name: result.name || prev.name,
          model: result.model || prev.model,
          year: result.year || prev.year,
          color: result.color || prev.color,
          engine: result.engine || prev.engine,
          version: result.version || prev.version,
          fuelType: result.fuelType || prev.fuelType,
          chassis: result.chassis || prev.chassis,
          imageUrl: result.imageUrl || prev.imageUrl,
          plate: plate
        }));
        
        setTimeout(() => setPlateSearchStatus(''), 3000);
      } else {
        setPlateSearchStatus('🕵️ MODO ASSISTIDO: COPIE OS DADOS');
        setRobotLogs(prev => [
          ...prev, 
          '[WARN] Robô não conseguiu extração automática.',
          '[ACTION] NO SITE: Digite a placa, pesquise, depois CTRL+A e CTRL+C.',
          '[ACTION] AQUI: Clique em "CAPTURAR DADOS".'
        ]);
      }
    } catch (err: any) {
      clearInterval(statusInterval);
      setPlateSearchStatus('⚠️ Erro no servidor.');
      setTimeout(() => setPlateSearchStatus(''), 3000);
    } finally {
      setIsSearchingPlate(false);
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
        setRobotLogs(prev => [...prev, `[SUCCESS] ${result.name} ${result.model}`]);

        setNewVehicle((prev: any) => ({
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
        }));
        setRawPastedData(''); 
        
        if (robotPopupRef.current && !robotPopupRef.current.closed) {
          robotPopupRef.current.close();
          robotPopupRef.current = null;
        }
        setTimeout(() => setPlateSearchStatus('✓ Cadastro preenchido!'), 2000);
      } else {
        setPlateSearchStatus('⚠️ Erro na interpretação.');
        alert('Não foi possível identificar dados. Tente copiar novamente.');
      }
    } catch (error: any) {
      alert('Erro ao processar dados.');
    } finally {
      setIsProcessingAssisted(false);
    }
  };

  const handleCaptureFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text || !text.trim()) {
        alert('Área de transferência vazia.');
        return;
      }
      setRawPastedData(text);
      if (text.length > 20) {
        handleAssistedProcess(text);
      }
    } catch (err) {
      alert('Erro ao ler área de transferência. Use Ctrl+V no campo de texto.');
    }
  };

  const handleRemoveBackgroundLocal = async (imageUrl: string) => {
    setIsRemovingBackground(true);
    setPlateSearchStatus('🤖 ROBÔ ESTÚDIO: Analisando bordas...');
    try {
      const blob = await removeBackground(imageUrl, {
        progress: (key, current, total) => {
          setPlateSearchStatus(`📸 TRATAMENTO IA: ${Math.round((current / total) * 100)}%...`);
        }
      });
      const reader = new FileReader();
      return new Promise<string>((resolve) => {
        reader.onloadend = () => {
          setPlateSearchStatus('✨ SUCESSO: Fundo removido!');
          setTimeout(() => setPlateSearchStatus(''), 5000);
          resolve(reader.result as string);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      setPlateSearchStatus('⚠️ Falha no tratamento da imagem.');
      setTimeout(() => setPlateSearchStatus(''), 4000);
      return imageUrl;
    } finally {
      setIsRemovingBackground(false);
    }
  };

  return {
    isSearchingPlate,
    plateSearchStatus,
    setPlateSearchStatus,
    robotLogs,
    setRobotLogs,
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
    handleCaptureFromClipboard,
    handleRemoveBackground: handleRemoveBackgroundLocal
  };
}
