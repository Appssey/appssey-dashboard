import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { App } from '../../types/app.types';
import { X, Download, Share2 } from 'lucide-react';
import Button from './Button';
import { useNavigate } from 'react-router-dom';

interface AppDetailModalProps {
  app: App;
  onClose: () => void;
  selectedScreenIndex?: number;
}

const AppDetailModal: React.FC<AppDetailModalProps> = ({ app, onClose, selectedScreenIndex = 0 }) => {
  const [copied, setCopied] = useState(false);
  const [currentScreen, setCurrentScreen] = useState(selectedScreenIndex);
  const navigate = useNavigate();

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href + '?app=' + app.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    const url = app.screens[currentScreen]?.url;
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = app.name + '-screen';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const platform = 'Web';

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-2 md:p-6" onClick={onClose}>
      <div className="relative w-full max-w-4xl bg-[#18181b] rounded-3xl shadow-2xl overflow-hidden border border-[#232329] mx-auto flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Platform label top left */}
        <div className="absolute top-4 left-4 text-xs text-primary-muted font-semibold z-20 bg-[#18181b] px-3 py-1 rounded-full border border-[#232329]">{platform}</div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-primary-muted hover:text-primary z-10"
          aria-label="Close"
        >
          <X size={28} />
        </button>
        {/* Image Section with horizontal scroll (single image shown) */}
        <div className="w-full flex items-center justify-center bg-[#232329] p-4 md:p-8 min-h-[250px]">
          <img
            src={app.screens[currentScreen]?.url}
            alt={app.screens[currentScreen]?.alt}
            className="rounded-2xl max-h-[60vh] object-contain shadow-lg bg-background-light mx-auto"
            style={{ aspectRatio: '9/16', maxWidth: '320px' }}
          />
        </div>
        {/* Details Section */}
        <div className="flex flex-col sm:flex-row w-full px-6 pb-4 pt-2 sm:items-center sm:justify-between gap-6 justify-center flex-1">
          <div className="flex items-center gap-4 flex-1">
            <img src={app.logo} alt={app.name + ' logo'} className="w-14 h-14 rounded-xl object-contain border border-[#232329] bg-background" />
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <div className="font-bold text-2xl sm:text-3xl text-white">{app.name}</div>
                <span className="px-5 py-2 rounded-full whitespace-nowrap transition-colors bg-background-light text-primary hover:bg-border text-base font-medium">
                  {app.category}
                </span>
              </div>
              <div className="text-primary-muted text-lg mt-1">{app.description}</div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:justify-end sm:items-center min-w-[240px]">
            <Button onClick={handleShare} className="min-w-[120px] flex items-center gap-2 justify-center"><Share2 size={18}/> Share</Button>
            <Button variant="outline" className="min-w-[120px] flex items-center gap-2 justify-center" onClick={handleDownload}><Download size={18}/> Download</Button>
          </div>
        </div>
        <div className="h-6 mt-1 flex items-center justify-start px-6">
          {copied && (
            <div className="bg-[#232329] text-white px-4 py-1 rounded-full shadow text-xs animate-fade-in-out pointer-events-none border border-[#333] mt-2">
              Link copied
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default AppDetailModal; 