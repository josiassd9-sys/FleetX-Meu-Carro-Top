import React from 'react';
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

const ICON_OPTIONS = {
  Cpu,
  Car,
  Wrench,
  Shield,
  Zap,
  Activity,
  Gauge
};

interface HeaderLogoProps {
  iconName?: string;
  className?: string;
}

export const HeaderLogo = ({ iconName, className }: HeaderLogoProps) => {
  const IconComponent = ICON_OPTIONS[iconName as keyof typeof ICON_OPTIONS] || Cpu;
  return <IconComponent className={className} size={32} />;
};
