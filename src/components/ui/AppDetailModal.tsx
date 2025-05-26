import React, { useState, useEffect } from 'react';
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

  // Disable background scroll when modal is open
  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, []);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href + '?app=' + app.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    const url = app.screens[currentScreen]?.url;
    if (!url) return;
    const proxyUrl = `/.netlify/functions/downloadImage?url=${encodeURIComponent(url)}`;
    const link = document.createElement('a');
    link.href = proxyUrl;
    link.setAttribute('download', app.name + '-screen');
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const platform = 'Web';

  const totalScreens = Array.isArray(app.screens) ? app.screens.length : 0;
  const hasMultipleScreens = totalScreens > 1;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentScreen((prev) => (prev - 1 + totalScreens) % totalScreens);
  };
  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentScreen((prev) => (prev + 1) % totalScreens);
  };

  // For tagline, fallback to empty string if not present
  const tagline = (app as any).tagline || '';
  // For categories, fallback to array if not present
  const categories = Array.isArray(app.category) ? app.category : [app.category].filter(Boolean);

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-2 md:p-6" onClick={onClose}>
      <div className="relative w-full max-w-5xl bg-transparent rounded-3xl shadow-2xl overflow-hidden mx-auto flex flex-col md:flex-row border-none" onClick={e => e.stopPropagation()}>
        {/* Left: Screenshot Section */}
        <div className="flex-1 bg-white rounded-l-3xl p-0 min-h-[400px] max-h-[80vh] flex items-stretch">
          <div className="w-full h-full overflow-y-auto" style={{ height: '80vh' }}>
            {totalScreens > 0 && app.screens.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {app.screens.map((screen, idx) => (
                  <img
                    key={screen.id || idx}
                    src={screen.url}
                    alt={screen.alt || `Screenshot ${idx + 1}`}
                    onError={(e) => {
                      console.error('Failed to load image:', {
                        url: screen.url,
                        app: app.name,
                        screenId: screen.id,
                        index: idx
                      });
                      e.currentTarget.src = 'https://via.placeholder.com/900x600?text=Image+Not+Found';
                    }}
                    onLoad={(e) => {
                      console.log('Successfully loaded image:', {
                        url: screen.url,
                        app: app.name,
                        screenId: screen.id,
                        index: idx
                      });
                    }}
                    style={{
                      width: '100%',
                      maxWidth: '900px',
                      margin: '0 auto',
                      boxShadow: 'none',
                      borderRadius: 0,
                      display: 'block',
                      marginBottom: 0,
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-center w-full">No screenshots available</div>
            )}
          </div>
        </div>
        {/* Right: Info Panel - Figma style left-aligned */}
        <div className="w-full md:w-[340px] flex flex-col justify-between bg-[#18181b] rounded-r-3xl p-8 min-h-[400px] max-h-[80vh] relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-primary-muted hover:text-primary z-10"
            aria-label="Close"
          >
            <X size={28} />
          </button>
          <div className="flex flex-col w-full gap-0 mt-2">
            {/* Logo + Title/Tagline/Category Row */}
            <div className="flex flex-row items-start gap-4 mb-2">
              <img src={app.logo} alt={app.name + ' logo'} className="w-14 h-14 rounded-2xl object-contain border border-[#232329] bg-background flex-shrink-0" />
              <div className="flex flex-col items-start justify-center min-w-0">
                <div className="font-bold text-xl text-white leading-tight truncate max-w-[160px]">{app.name}</div>
                {tagline && <div className="text-primary-muted text-sm truncate max-w-[160px] mt-0.5">{tagline}</div>}
                <div className="flex flex-wrap gap-2 mt-2">
                  {categories.map((cat, idx) => (
                    <span key={cat + idx} className="inline-block px-4 py-1 rounded-full border border-[#F0F0F0]/50 bg-transparent text-primary text-sm font-medium">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {/* Description */}
            <div className="text-primary-muted text-base leading-snug max-w-xs mt-4 mb-2 text-left">
              {app.description}
            </div>
          </div>
          {/* Buttons at the bottom */}
          <div className="flex gap-4 mt-auto w-full">
            <Button onClick={handleShare} className="flex-1 flex items-center gap-2 justify-center rounded-full text-base py-3 px-0"><Share2 size={20}/> Share</Button>
            <Button variant="outline" className="flex-1 flex items-center gap-2 justify-center rounded-full text-base py-3 px-0" onClick={handleDownload}><Download size={20}/> Download</Button>
          </div>
          {copied && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#232329] text-white px-4 py-1 rounded-full shadow text-xs animate-fade-in-out pointer-events-none border border-[#333] mt-2">
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