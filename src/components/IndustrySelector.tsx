import { motion } from 'framer-motion';
import { Code2, Lightbulb, Palette, BarChart3, Megaphone, Handshake, Users } from 'lucide-react';
import { INDUSTRIES, type IndustryId } from '@/lib/constants';
import { cn } from '@/lib/utils';

const iconMap = {
  Code2,
  Lightbulb,
  Palette,
  BarChart3,
  Megaphone,
  Handshake,
  Users,
};

interface IndustrySelectorProps {
  selected: IndustryId | null;
  onSelect: (id: IndustryId) => void;
}

export function IndustrySelector({ selected, onSelect }: IndustrySelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {INDUSTRIES.map((industry, index) => {
        const Icon = iconMap[industry.icon as keyof typeof iconMap];
        const isSelected = selected === industry.id;

        return (
          <motion.button
            key={industry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(industry.id)}
            className={cn(
              'group relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300',
              'hover:border-primary/50 hover:bg-primary/5',
              isSelected
                ? 'border-primary bg-primary/10 shadow-[0_0_30px_hsla(262,83%,58%,0.2)]'
                : 'border-border bg-card/50'
            )}
          >
            <div
              className={cn(
                'p-3 rounded-lg transition-all duration-300',
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'
              )}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-center">
              <div className={cn(
                'font-medium text-sm transition-colors',
                isSelected ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
              )}>
                {industry.label}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {industry.description}
              </div>
            </div>
            {isSelected && (
              <motion.div
                layoutId="industry-selected"
                className="absolute inset-0 border-2 border-primary rounded-xl"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
