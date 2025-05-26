import React from 'react';
import { motion } from 'framer-motion';
import { App } from '../../types/app.types';
import { useNavigate } from 'react-router-dom';

interface AppCardProps {
  app: App;
  onClick?: () => void;
  onScreenClick?: (screenIndex: number) => void;
}

const AppCard: React.FC<AppCardProps> = ({ app, onClick, onScreenClick }) => {
  const screens = Array.isArray(app.screens) ? app.screens : [];
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col overflow-hidden bg-background-card rounded-lg ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-primary/40 transition' : ''}`}
      onClick={onClick}
    >
      <div className="relative p-2 pb-0">
        {app.updated && (
          <div className="absolute top-4 left-4 z-10 bg-background text-xs px-2 py-1 rounded-md text-primary">
            Updated
          </div>
        )}
        <div className="w-full rounded-lg bg-background-light flex items-start justify-center">
          {screens.length > 0 && (
            <img
              key={screens[0].id || 0}
              src={screens[0].url}
              alt={screens[0].alt || `${app.name} screenshot`}
              className="w-full h-60 object-cover rounded cursor-pointer block"
              onClick={e => {
                e.stopPropagation();
                onScreenClick && onScreenClick(0);
              }}
              onError={e => {
                e.currentTarget.src = 'https://via.placeholder.com/900x600?text=Image+Not+Found';
              }}
            />
          )}
        </div>
      </div>
      
      <div className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-background-light flex items-center justify-center overflow-hidden">
          <img 
            src={app.logo} 
            alt={`${app.name} logo`} 
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h3 className="text-primary font-medium">{app.name}</h3>
          <p className="text-primary-muted text-sm">{(app as any).tagline || ''}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default AppCard;