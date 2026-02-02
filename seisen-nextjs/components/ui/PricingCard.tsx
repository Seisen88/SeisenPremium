import { Check } from 'lucide-react';
import { Card } from './Card';
import Button from './Button';

interface PricingCardProps {
  title: string;
  badge: string;
  price: string | number;
  originalPrice?: string | number;
  currency?: string;
  period?: string;
  features: string[];
  featured?: boolean;
  featuredLabel?: string;
  buttonText: string;
  buttonIcon?: React.ReactNode;
  onButtonClick?: () => void;
  badgeVariant?: 'default' | 'best-value';
  priceIcon?: React.ReactNode;
}

export default function PricingCard({
  title,
  badge,
  price,
  currency = '€',
  period,
  features,
  featured = false,
  featuredLabel = 'Most Popular',
  buttonText,
  buttonIcon,
  onButtonClick,
  badgeVariant = 'default',
  priceIcon,
  originalPrice,
}: PricingCardProps) {
  return (
    <Card
      variant={featured ? 'featured' : 'hover'}
      className="relative p-6 flex flex-col"
    >
      {/* Featured Badge */}
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full text-xs font-medium text-white flex items-center gap-1.5">
          <span className="text-yellow-300">★</span>
          {featuredLabel}
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
            badgeVariant === 'best-value'
              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              : 'bg-[#1a1a1a] text-gray-400 border border-[#2a2a2a]'
          }`}
        >
          {badge}
        </span>
      </div>

      {/* Price */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2">
           {originalPrice && (
            <div className="relative text-gray-500 font-medium text-xl">
               {priceIcon ? (
                  <span className="opacity-70 grayscale">{priceIcon}</span> 
                ) : (
                  <span>{currency}</span>
                )}
               {originalPrice}
               {/* Red Strikethrough Line */}
               <div className="absolute top-1/2 left-0 w-full h-[2px] bg-red-500 -rotate-3 transform origin-center"></div>
            </div>
           )}

          <div className="flex items-center">
            {priceIcon ? (
              priceIcon
            ) : (
              <span className="text-2xl font-medium text-gray-400">{currency}</span>
            )}
            <span className="text-5xl font-bold text-white">{price}</span>
          </div>
        </div>
        {period && <span className="text-gray-500 text-sm block mt-1">{period}</span>}
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3 text-gray-400 text-sm">
            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      {/* Button */}
      <Button
        variant={featured ? 'primary' : 'secondary'}
        size="lg"
        className="w-full"
        onClick={onButtonClick}
      >
        {buttonIcon}
        {buttonText}
      </Button>
    </Card>
  );
}
