import React from 'react';
import AppCard from './AppCard';
import { App } from '../../types/app.types';

interface AppGridProps {
  apps: App[];
  onCardClick?: (app: App, screenIndex?: number) => void;
}

const AppGrid: React.FC<AppGridProps> = ({ apps, onCardClick }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {apps.map((app) => (
      <AppCard
        key={app.id}
        app={app}
        onClick={onCardClick ? () => onCardClick(app, 0) : undefined}
        onScreenClick={onCardClick ? (screenIndex) => onCardClick(app, screenIndex) : undefined}
      />
      ))}
    </div>
  );

export default AppGrid;