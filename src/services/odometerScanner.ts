// Este serviço é a ponte para a funcionalidade de leitura de odômetro via OCR.
// No Capacitor, ele deve usar plugins nativos como @capacitor-community/mlkit-text-recognition
// Para o ambiente web/preview, ele pode usar uma implementação baseada em tesseract.js ou apenas simular.

export const odometerScanner = {
  /**
   * Dispara o fluxo de captura e reconhecimento de texto do odômetro.
   */
  async scanOdometer(): Promise<{ mileage: number; confidence: number; imageBase64?: string }> {
    console.log('Iniciando escaneamento de odômetro...');
    
    // Simulação de delay de processamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Em um cenário real, aqui abriríamos a câmera e processaríamos a imagem.
    // Retornamos um valor fictício ou o valor lido.
    return {
      mileage: 125430, // Exemplo de valor detectado
      confidence: 0.92,
      imageBase64: ''
    };
  }
};
