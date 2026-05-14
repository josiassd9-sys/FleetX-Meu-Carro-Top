import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  pt: {
    translation: {
      "app_name": "Meu Carro Top",
      "import_vehicle": "Importar Veículo",
      "add_vehicle": "Adicionar Veículo",
      "settings": "Configurações",
      "odometer_scan": "Escanear Odômetro",
      "mileage": "Quilometragem",
      "last_mileage": "Última KM registrada",
      "scan_success": "KM detectada com sucesso!",
      "confirm": "Confirmar",
      "cancel": "Cancelar",
      "save": "Salvar",
      "vehicles": "Veículos",
      "maintenance": "Manutenção",
      "fuel": "Combustível",
      "catalog": "Catálogo de Peças",
      "manual": "Manual do Proprietário",
      "no_vehicles": "Bem-vindo ao AUTOMASTER. Registre seu primeiro carro para começar a gestão inteligente.",
      "import_backup": "Importar Backup",
      "export_backup": "Exportar Backup",
      "ai_key": "Chave da API Gemini",
      "ai_key_link": "Obter chave gratuita"
    }
  },
  en: {
    translation: {
      "app_name": "My Top Car",
      "import_vehicle": "Import Vehicle",
      "add_vehicle": "Add Vehicle",
      "settings": "Settings",
      "odometer_scan": "Scan Odometer",
      "mileage": "Mileage",
      "last_mileage": "Last registered mileage",
      "scan_success": "Mileage detected successfully!",
      "confirm": "Confirm",
      "cancel": "Cancel",
      "save": "Save",
      "vehicles": "Vehicles",
      "maintenance": "Maintenance",
      "fuel": "Fuel",
      "catalog": "Parts Catalog",
      "manual": "Owner's Manual",
      "no_vehicles": "Welcome to AUTOMASTER. Register your first car to start smart management.",
      "import_backup": "Import Backup",
      "export_backup": "Export Backup",
      "ai_key": "Gemini API Key",
      "ai_key_link": "Get free key"
    }
  },
  es: {
    translation: {
      "app_name": "Mi Carro Top",
      "import_vehicle": "Importar Vehículo",
      "add_vehicle": "Agregar Vehículo",
      "settings": "Configuración",
      "odometer_scan": "Escanear Odómetro",
      "mileage": "Kilometraje",
      "last_mileage": "Último kilometraje registrado",
      "scan_success": "¡Kilometraje detectado con éxito!",
      "confirm": "Confirmar",
      "cancel": "Cancelar",
      "save": "Guardar",
      "vehicles": "Vehículos",
      "maintenance": "Mantenimiento",
      "fuel": "Combustible",
      "catalog": "Catálogo de Piezas",
      "manual": "Manual del Propietario",
      "no_vehicles": "Bievenido a AUTOMASTER. Registra tu primer coche para empezar la gestión inteligente.",
      "import_backup": "Importar Copia de Seguridad",
      "export_backup": "Exportar Copia de Seguridad",
      "ai_key": "Clave API Gemini",
      "ai_key_link": "Obtener clave gratuita"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
