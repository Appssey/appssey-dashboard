import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AppLogosRow from '../components/app/AppLogosRow';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const AppScreenshotsPage: React.FC = () => {
  const query = useQuery();
  const initialAppId = query.get('appId');
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [screenshots, setScreenshots] = useState<any[]>([]);
  const [filter, setFilter] = useState('All');
  const [tags, setTags] = useState<string[]>([]);

  // On mount, if appId is present, fetch and select that app
  useEffect(() => {
    if (initialAppId && !selectedApp) {
      fetch('/.netlify/functions/getApps')
        .then(res => res.json())
        .then(apps => {
          if (!Array.isArray(apps)) return;
          const found = apps.find((a: any) => a.id === initialAppId);
          if (found) setSelectedApp(found);
        });
    }
  }, [initialAppId, selectedApp]);

  useEffect(() => {
    if (selectedApp) {
      fetch(`/.netlify/functions/appScreenshots?appId=${selectedApp.id}`)
        .then(res => res.json())
        .then(data => {
          if (!Array.isArray(data)) {
            setScreenshots([]);
            setTags(['All']);
            return;
          }
          setScreenshots(data);
          const allTags = Array.from(new Set(data.flatMap((s: any) => s.tags || [])));
          setTags(['All', ...allTags]);
        });
    }
  }, [selectedApp]);

  const filteredScreenshots = Array.isArray(screenshots)
    ? (filter === 'All'
        ? screenshots
        : screenshots.filter(s => (s.tags || []).includes(filter)))
    : [];

  return (
    <div className="max-w-5xl mx-auto px-4">
      <AppLogosRow onSelect={setSelectedApp} />
      {selectedApp && (
        <>
          <h2 className="text-2xl font-bold mt-6 mb-2">{selectedApp.name}</h2>
          <div className="flex gap-2 mb-4 flex-wrap">
            {tags.map(tag => (
              <button
                key={tag}
                className={`px-3 py-1 rounded-full ${filter === tag ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}
                onClick={() => setFilter(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="flex flex-col items-center">
            {filteredScreenshots.map((s, idx) => (
              <img
                key={s.id || s.url || idx}
                src={s.url}
                alt=""
                onError={(e) => {
                  console.error('Failed to load image:', {
                    url: s.url,
                    app: selectedApp?.name,
                    screenId: s.id,
                    index: idx
                  });
                  e.currentTarget.src = 'https://via.placeholder.com/900x600?text=Image+Not+Found';
                }}
                onLoad={(e) => {
                  console.log('Successfully loaded image:', {
                    url: s.url,
                    app: selectedApp?.name,
                    screenId: s.id,
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
        </>
      )}
    </div>
  );
};

export default AppScreenshotsPage; 