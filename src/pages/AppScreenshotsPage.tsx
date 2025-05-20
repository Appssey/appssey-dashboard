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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredScreenshots.map(s => (
              <img key={s.id || s.url} src={s.url} alt="" className="rounded-lg w-full aspect-video object-cover" />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AppScreenshotsPage; 