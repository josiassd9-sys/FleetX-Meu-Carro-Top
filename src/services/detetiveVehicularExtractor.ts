/**
 * Detetive Veicular Data Extractor
 * Injeta um script na página do Detetive Veicular para extrair dados automaticamente
 */

interface VehicleData {
  plate?: string;
  name?: string;
  model?: string;
  year?: string;
  color?: string;
  chassisNumber?: string;
}

export const detetiveVehicularExtractor = {
  /**
   * Inicia o monitoramento do localStorage do Detetive Veicular
   * Retorna uma Promise que resolve quando os dados são encontrados
   */
  startMonitoring: (timeoutMs = 120000): Promise<VehicleData> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout ao aguardar dados do Detetive Veicular'));
      }, timeoutMs);

      // Listener para mensagens postMessage
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== 'https://detetiveveicular.com' && event.origin !== window.location.origin) {
          return;
        }

        if (event.data?.type === 'DETETIVE_VEHICLE_DATA') {
          clearTimeout(timeout);
          window.removeEventListener('message', handleMessage);
          resolve(event.data.data);
        }
      };

      window.addEventListener('message', handleMessage);

      // Injeta um script na página para extrair dados
      const injectScript = () => {
        const script = document.createElement('script');
        script.innerHTML = `
          (function() {
            const STORAGE_KEYS = [
              'detetive_vehicle_data',
              'vehicleData',
              'placa',
              'plate',
              'marca',
              'modelo',
              'ano'
            ];

            const extractFromLocalStorage = () => {
              const data = {};
              
              // Tenta encontrar os dados em diferentes formatos
              for (const key of STORAGE_KEYS) {
                try {
                  const value = localStorage.getItem(key);
                  if (value) {
                    try {
                      const parsed = JSON.parse(value);
                      if (typeof parsed === 'object') {
                        Object.assign(data, parsed);
                      } else {
                        data[key] = value;
                      }
                    } catch (e) {
                      data[key] = value;
                    }
                  }
                } catch (e) {
                  console.warn('[Extractor] Erro ao ler localStorage[' + key + ']:', e);
                }
              }

              // Também tenta ler um objeto completo que pode estar em uma chave
              try {
                const allStorage = {};
                for (let i = 0; i < localStorage.length; i++) {
                  const key = localStorage.key(i);
                  if (key) allStorage[key] = localStorage.getItem(key);
                }
                
                // Procura por chaves que contenham dados de veículo
                for (const [key, value] of Object.entries(allStorage)) {
                  if (!value) continue;
                  if (key.toLowerCase().includes('vehicle') || 
                      key.toLowerCase().includes('veiculo') ||
                      key.toLowerCase().includes('placa') ||
                      key.toLowerCase().includes('plate')) {
                    try {
                      const parsed = JSON.parse(value);
                      Object.assign(data, parsed);
                    } catch (e) {
                      // Valor é string simples
                    }
                  }
                }
              } catch (e) {
                console.warn('[Extractor] Erro ao iterar localStorage:', e);
              }

              return data;
            };

            const sendData = () => {
              const vehicleData = extractFromLocalStorage();
              
              // Normaliza os dados encontrados
              const normalized = {
                plate: vehicleData.placa || vehicleData.plate || '',
                name: vehicleData.marca || vehicleData.brand || vehicleData.make || '',
                model: vehicleData.modelo || vehicleData.model || '',
                year: vehicleData.ano || vehicleData.year || '',
                color: vehicleData.cor || vehicleData.color || '',
                chassisNumber: vehicleData.chassi || vehicleData.chassis || vehicleData.numeroChasis || ''
              };

              console.log('[Extractor] Dados encontrados:', normalized);

              // Envia dados de volta para a janela pai via postMessage
              if (window.parent !== window) {
                window.parent.postMessage({
                  type: 'DETETIVE_VEHICLE_DATA',
                  data: normalized
                }, '*');
              }

              // Também tenta enviar para localStorage da janela pai
              try {
                window.parent.localStorage.setItem('detetive_extracted_data', JSON.stringify(normalized));
              } catch (e) {
                console.warn('[Extractor] Erro ao salvar dados no parent localStorage:', e);
              }
            };

            // Monitora mudanças no localStorage
            const originalSetItem = Storage.prototype.setItem;
            Storage.prototype.setItem = function(key, value) {
              originalSetItem.call(this, key, value);
              
              // Verifica se alguma chave relacionada a veículo foi alterada
              if (key.toLowerCase().includes('vehicle') ||
                  key.toLowerCase().includes('veiculo') ||
                  key.toLowerCase().includes('placa') ||
                  key.toLowerCase().includes('plate') ||
                  key.toLowerCase().includes('marca') ||
                  key.toLowerCase().includes('brand') ||
                  key.toLowerCase().includes('modelo') ||
                  key.toLowerCase().includes('model') ||
                  key.toLowerCase().includes('ano') ||
                  key.toLowerCase().includes('year')) {
                
                console.log('[Extractor] localStorage alterado:', key, '=', value);
                
                // Aguarda um pouco para garantir que todos os dados foram salvos
                setTimeout(sendData, 500);
              }
            };

            // Tenta extrair dados de imediato (pode estar já no localStorage)
            setTimeout(sendData, 1000);
            
            // Continua tentando a cada 2 segundos por 2 minutos
            const interval = setInterval(sendData, 2000);
            setTimeout(() => clearInterval(interval), 120000);

            console.log('[Extractor] Monitoramento iniciado para Detetive Veicular');
          })();
        `;
        
        try {
          const iframe = document.querySelector('iframe[src*="detetiveveicular.com"]') as HTMLIFrameElement;
          if (iframe && iframe.contentDocument) {
            iframe.contentDocument.head.appendChild(script);
            console.log('[Extractor] Script injetado no iframe');
          } else {
            // Se for uma nova aba, tenta injetar no documento atual
            document.head.appendChild(script);
          }
        } catch (e) {
          console.warn('[Extractor] Erro ao injetar script:', e);
          document.head.appendChild(script);
        }
      };

      // Injeta após um curto delay
      setTimeout(injectScript, 500);
    });
  },

  /**
   * Lê dados já extraídos do localStorage
   */
  readExtractedData: (): VehicleData | null => {
    try {
      const data = localStorage.getItem('detetive_extracted_data');
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('[Extractor] Erro ao ler dados extraídos:', e);
    }
    return null;
  },

  /**
   * Limpa dados extraídos
   */
  clearExtractedData: () => {
    try {
      localStorage.removeItem('detetive_extracted_data');
    } catch (e) {
      console.warn('[Extractor] Erro ao limpar dados:', e);
    }
  },

  /**
   * Abre Detetive Veicular com callback para captura automática
   */
  openAndCapture: async (plate: string, onDataCapture: (data: VehicleData) => void): Promise<void> => {
    const url = `https://detetiveveicular.com/checkout/?plate=${encodeURIComponent(plate)}`;
    const popup = window.open(url, 'detetive_veicular', 'width=1024,height=768');

    if (!popup) {
      throw new Error('Não foi possível abrir a janela. Verifique se pop-ups estão habilitados.');
    }

    try {
      // Aguarda dados serem capturados
      const data = await detetiveVehicularExtractor.startMonitoring();
      onDataCapture(data);
      popup.close();
    } catch (error) {
      console.error('[Extractor] Erro na captura:', error);
      throw error;
    }
  }
};
