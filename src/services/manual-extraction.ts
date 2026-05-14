import { GoogleGenAI } from "@google/genai";
import type { VehicleManual, MaintenanceScheduleEntry } from "../types";

export interface ManualExtractionResult {
  maintenanceSchedule: MaintenanceScheduleEntry[];
  technicalSections: {
    tirePressure?: string;
    oilSpecification?: string;
    batteryInfo?: string;
    filterInfo?: string;
    fluidsCapacities?: string;
    [key: string]: string | undefined;
  };
  fullText: string;
  rawSections: {
    [sectionName: string]: string;
  };
}

const parseAIJson = <T>(text: string): T | null => {
  const normalize = (payload: string): string => {
    return payload
      .replace(/\r?\n/g, ' ')
      .replace(/\u2018|\u2019|\u201C|\u201D/g, '"')
      .replace(/```(?:json)?\s*([\s\S]*?)```/gi, '$1')
      .replace(/(['"])?([a-zA-Z0-9_]+)\1\s*:/g, '"$2":')
      .replace(/,\s*([}\]])/g, '$1')
      .trim();
  };

  const extractJsonPayload = (payload: string): string => {
    const codeBlockMatch = payload.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (codeBlockMatch && codeBlockMatch[1]) return codeBlockMatch[1].trim();

    const firstObject = payload.indexOf('{');
    const lastObject = payload.lastIndexOf('}');
    const firstArray = payload.indexOf('[');
    const lastArray = payload.lastIndexOf(']');

    if (firstObject >= 0 && lastObject > firstObject) {
      return payload.slice(firstObject, lastObject + 1).trim();
    }

    if (firstArray >= 0 && lastArray > firstArray) {
      return payload.slice(firstArray, lastArray + 1).trim();
    }

    return payload;
  };

  const payload = extractJsonPayload(text);

  try {
    return JSON.parse(payload) as T;
  } catch {
    try {
      return JSON.parse(normalize(payload)) as T;
    } catch {
      return null;
    }
  }
};

export async function extractVehicleManualFromPdf(
  pdfBase64: string,
  vehicleModel: string,
  apiKey: string
): Promise<ManualExtractionResult> {
  const ai = new GoogleGenAI({ apiKey });

  let maintenanceSchedule: MaintenanceScheduleEntry[] = [];
  let technicalSections: { [key: string]: string } = {};
  let fullText = '';

  const safeParseJson = <T>(payload: string): T | null => {
    try {
      return parseAIJson<T>(payload);
    } catch (error) {
      console.warn('Falha ao parsear JSON do manual:', error, payload);
      return null;
    }
  };

  try {
    const scheduleResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: pdfBase64,
          },
        },
        {
          text: `Analise este manual do veículo "${vehicleModel}" e extraia a TABELA DE MANUTENÇÃO PROGRAMADA.

Retorne um JSON com o seguinte formato:
{
  "maintenanceSchedule": [
    {"mileage": 10000, "items": ["óleo do motor", "filtro de óleo"], "description": "Primeira revisão"},
    {"mileage": 20000, "items": ["inspeção geral"], "description": ""}
  ]
}

IMPORTANTE:
- Extraia exatamente como está no manual.
- Inclua todas as kilometragens mencionadas.
- Os items devem ser descrições claras do que fazer.
- Se houver intervalo (ex: "a cada 10.000 km"), inclua cada ponto.
- Inclua também subtituições e serviços adicionais quando forem parte do plano de manutenção.

Retorne apenas o JSON, sem explicações adicionais.`,
        },
      ],
    });

    const schedulePayload = scheduleResponse.text || scheduleResponse.data || '';
    const scheduleData = safeParseJson<{ maintenanceSchedule: MaintenanceScheduleEntry[] }>(schedulePayload);
    maintenanceSchedule = scheduleData?.maintenanceSchedule || [];
  } catch (error) {
    console.error('Falha ao extrair cronograma de manutenção:', error);
  }

  try {
    const technicalResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: pdfBase64,
          },
        },
        {
          text: `Analise este manual do veículo "${vehicleModel}" e extraia as seções técnicas mais importantes.

Procure especificamente por:
- PRESSÃO DE CALIBRAGEM DOS PNEUS
- ESPECIFICAÇÃO DO ÓLEO
- INFORMAÇÕES DA BATERIA
- CAPACIDADES DE FLUIDOS
- FILTROS
- QUALQUER OUTRA SEÇÃO TÉCNICA RELEVANTE

Retorne um JSON com campos como:
{
  "tirePressure": "texto completo da seção de pressão de pneus",
  "oilSpecification": "texto completo da seção de óleo",
  "batteryInfo": "texto completo da seção de bateria",
  "filterInfo": "texto completo da seção de filtros",
  "fluidsCapacities": "texto completo das capacidades",
  "otherSectionName": "texto da seção"
}

Retorne apenas o JSON, sem explicações adicionais.`,
        },
      ],
    });

    const technicalPayload = technicalResponse.text || technicalResponse.data || '';
    technicalSections = safeParseJson<{ [key: string]: string }>(technicalPayload) || {};
  } catch (error) {
    console.error('Falha ao extrair seções técnicas do manual:', error);
  }

  try {
    const fullTextResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: pdfBase64,
          },
        },
        {
          text: `Analise este manual do veículo "${vehicleModel}" e extraia todo o conteúdo relevante organizado por seções.

Inclua, sempre que presentes, os seguintes tópicos:
- MANUTENÇÃO PROGRAMADA
- VERIFICAÇÃO DOS NÍVEIS
- SUBSTITUIÇÕES FORA DO PLANO
- SERVIÇOS ADICIONAIS
- FILTRO DE AR
- BATERIA
- CENTRAIS ELETRÔNICAS
- SUBSTITUIÇÃO DE FUSÍVEIS
- VELAS
- RODAS E PNEUS
- TUBULAÇÕES DE BORRACHA
- LIMPADORES DO PARA-BRISA
- AR-CONDICIONADO
- CARROCERIA
- INTERIOR DO VEÍCULO

Formate o conteúdo em Markdown com títulos e parágrafos claros. Retorne apenas o texto extraído, sem explicações adicionais.`,
        },
      ],
    });

    fullText = fullTextResponse.text || fullTextResponse.data || '';
  } catch (error) {
    console.error('Falha ao extrair texto completo do manual:', error);
  }

  const rawSections: { [key: string]: string } = {};
  
  const sectionPatterns = [
    'MANUTENÇÃO PROGRAMADA',
    'VERIFICAÇÃO DOS NÍVEIS',
    'SUBSTITUIÇÕES FORA DO PLANO',
    'SERVIÇOS ADICIONAIS',
    'FILTRO DE AR',
    'BATERIA',
    'CENTRAIS ELETRÔNICAS',
    'SUBSTITUIÇÃO DE FUSÍVEIS',
    'VELAS',
    'RODAS E PNEUS',
    'TUBULAÇÕES DE BORRACHA',
    'LIMPADORES DO PARA-BRISA',
    'AR-CONDICIONADO',
    'CARROCERIA',
    'INTERIOR DO VEÍCULO',
  ];

  if (fullText) {
    for (const pattern of sectionPatterns) {
      const regex = new RegExp(`${pattern}[\\s\\S]*?(?=${sectionPatterns.filter(p => p !== pattern).join('|')}|$)`, 'i');
      const match = fullText.match(regex);
      if (match) {
        rawSections[pattern] = match[0].trim();
      }
    }
  }

  return {
    maintenanceSchedule,
    technicalSections: {
      tirePressure: technicalSections.tirePressure,
      oilSpecification: technicalSections.oilSpecification,
      batteryInfo: technicalSections.batteryInfo,
      filterInfo: technicalSections.filterInfo,
      fluidsCapacities: technicalSections.fluidsCapacities,
      ...technicalSections,
    },
    fullText,
    rawSections,
  };
}

export async function createVehicleManual(
  pdfBase64: string,
  fileName: string,
  vehicleModel: string,
  apiKey: string
): Promise<VehicleManual> {
  const extracted = await extractVehicleManualFromPdf(pdfBase64, vehicleModel, apiKey);

  return {
    uploadedAt: new Date().toISOString(),
    fileName,
    maintenanceSchedule: extracted.maintenanceSchedule,
    technicalSections: extracted.technicalSections,
    fullText: extracted.fullText,
    rawSections: extracted.rawSections,
  };
}
