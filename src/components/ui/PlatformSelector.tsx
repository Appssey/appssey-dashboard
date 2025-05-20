import React from 'react';
import { cn } from '../../lib/utils';
import { Platform } from '../../types/app.types';
import { PLATFORMS } from '../../data/mockData';

interface PlatformSelectorProps {
  selected: Platform;
  onChange: (platform: Platform) => void;
  className?: string;
}

const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  selected,
  onChange,
  className,
}) => {
  return (
    <div className={cn('flex overflow-hidden rounded-full bg-background-light', className)}>
      {PLATFORMS.map((platform) => (
        <button
          key={platform}
          onClick={() => onChange(platform)}
          className={cn(
            'px-6 py-2 transition-colors',
            selected === platform
              ? 'bg-primary text-background'
              : 'bg-transparent text-primary hover:bg-background-card'
          )}
        >
          {platform}
        </button>
      ))}
    </div>
  );
};

export default PlatformSelector;