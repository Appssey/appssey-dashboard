import React, { useEffect, useState } from 'react';

interface AppLogosRowProps {
  onSelect: (app: { id: string; name: string; logo: string }) => void;
}

const AppLogosRow: React.FC<AppLogosRowProps> = ({ onSelect }) => {
  const [apps, setApps] = useState<{ id: string; name: string; logo: string }[]>([]);

  useEffect(() => {
    fetch('/.netlify/functions/getApps')
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return setApps([]);
        setApps(data.map(app => ({ ...app, logo: app.logo || app.logo_url })));
      });
  }, []);

  return (
    <div className="flex overflow-x-auto gap-4 py-4">
      {Array.isArray(apps) && apps.map(app => (
        <button
          key={app.id}
          onClick={() => onSelect(app)}
          className="focus:outline-none"
          title={app.name}
        >
          <img
            src={app.logo}
            alt={app.name}
            className="w-16 h-16 rounded-lg object-contain bg-white shadow"
          />
        </button>
      ))}
    </div>
  );
};

export default AppLogosRow; 