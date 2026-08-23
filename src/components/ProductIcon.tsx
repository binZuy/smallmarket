import {
  Fan,
  Shirt,
  CupSoda,
  Container,
  Brush,
  Sparkles,
  Droplets,
  BedDouble,
  Box,
  Footprints,
  Package,
  Layers,
  ShieldCheck,
  Armchair,
  Feather,
} from 'lucide-react';

interface ProductIconProps {
  name: string;
  className?: string;
}

export default function ProductIcon({ name, className = 'w-6 h-6' }: ProductIconProps) {
  const lower = name.toLowerCase();

  if (lower.includes('quạt')) {
    return <Fan className={`${className} text-sky-500`} />;
  }
  if (lower.includes('móc')) {
    return <Shirt className={`${className} text-indigo-500`} />;
  }
  if (lower.includes('dép')) {
    return <Footprints className={`${className} text-amber-600`} />;
  }
  if (lower.includes('cốc')) {
    return <CupSoda className={`${className} text-teal-500`} />;
  }
  if (lower.includes('xô') || lower.includes('chậu')) {
    return <Container className={`${className} text-blue-500`} />;
  }
  if (lower.includes('rác') || lower.includes('chổi')) {
    return <Brush className={`${className} text-emerald-600`} />;
  }
  if (lower.includes('bàn')) {
    return <Armchair className={`${className} text-purple-500`} />;
  }
  if (lower.includes('gáo')) {
    return <Droplets className={`${className} text-cyan-500`} />;
  }
  if (lower.includes('chiếu')) {
    return <Layers className={`${className} text-amber-500`} />;
  }
  if (lower.includes('chăn') || lower.includes('màn')) {
    return <BedDouble className={`${className} text-rose-400`} />;
  }
  if (lower.includes('hòm')) {
    return <Box className={`${className} text-slate-700`} />;
  }

  return <Package className={`${className} text-emerald-500`} />;
}
