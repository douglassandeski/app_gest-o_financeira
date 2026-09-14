import React from 'react';
import { 
  Home, 
  Utensils, 
  Car, 
  HeartPulse, 
  Tv, 
  GraduationCap, 
  ShoppingBag, 
  Briefcase, 
  Laptop, 
  PiggyBank, 
  TrendingUp, 
  MoreHorizontal,
  CreditCard,
  Building2,
  Wallet,
  ShieldCheck,
  Plane,
  Coins,
  Receipt,
  Tag,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  color?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5', color }) => {
  const iconProps = {
    className,
    style: color ? { color } : undefined,
  };

  switch (name) {
    case 'Home': return <Home {...iconProps} />;
    case 'Utensils': return <Utensils {...iconProps} />;
    case 'Car': return <Car {...iconProps} />;
    case 'HeartPulse': return <HeartPulse {...iconProps} />;
    case 'Tv': return <Tv {...iconProps} />;
    case 'GraduationCap': return <GraduationCap {...iconProps} />;
    case 'ShoppingBag': return <ShoppingBag {...iconProps} />;
    case 'Briefcase': return <Briefcase {...iconProps} />;
    case 'Laptop': return <Laptop {...iconProps} />;
    case 'PiggyBank': return <PiggyBank {...iconProps} />;
    case 'TrendingUp': return <TrendingUp {...iconProps} />;
    case 'CreditCard': return <CreditCard {...iconProps} />;
    case 'Building2': return <Building2 {...iconProps} />;
    case 'Wallet': return <Wallet {...iconProps} />;
    case 'ShieldCheck': return <ShieldCheck {...iconProps} />;
    case 'Plane': return <Plane {...iconProps} />;
    case 'Coins': return <Coins {...iconProps} />;
    case 'Receipt': return <Receipt {...iconProps} />;
    case 'Tag': return <Tag {...iconProps} />;
    case 'ArrowUpRight': return <ArrowUpRight {...iconProps} />;
    case 'ArrowDownLeft': return <ArrowDownLeft {...iconProps} />;
    case 'DollarSign': return <DollarSign {...iconProps} />;
    default: return <MoreHorizontal {...iconProps} />;
  }
};
