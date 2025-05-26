import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

interface Category {
  id: string;
  name: string;
}

interface AppData {
  name: string;
  description: string;
  tagline: string;
  category_id: string;
  logo_url?: string;
  screenshots: string[];
}

const BulkImport: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [referoUrl, setReferoUrl] = useState('');
  const [appData, setAppData] = useState<AppData>({
    name: '',
    description: '',
    tagline: '',
    category_id: '',
    screenshots: []
  });
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);

  useEffect(() => {
    // Fetch categories
    fetch('/.netlify/functions/adminCategories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      });
  }, []);

  const extractDataFromUrl = async (url: string) => {
    setExtracting(true);
    setError(null);
    try {
      const response = await fetch('/.netlify/functions/extractReferoData', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      if (!response.ok) {
        throw new Error('Failed to extract data from URL');
      }

      const data = await response.json();
      
      // Find matching category
      const matchingCategory = categories.find(cat => 
        cat.name.toLowerCase() === data.category?.toLowerCase()
      );

      setAppData({
        name: data.name || '',
        description: data.description || '',
        tagline: data.tagline || '',
        category_id: matchingCategory?.id || '',
        logo_url: data.logo_url,
        screenshots: data.screenshots || []
      });

      if (!matchingCategory) {
        setError('Category not found. Please select a category manually.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract data');
    } finally {
      setExtracting(false);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (referoUrl) {
      extractDataFromUrl(referoUrl);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAppData(prev => ({ ...prev, category_id: e.target.value }));
  };

  const handleImport = async () => {
    if (!appData.name || !appData.description || !appData.category_id) {
      setError('Name, description, and category are required');
      return;
    }

    setImporting(true);
    setError(null);
    setSuccess(null);

    try {
      // Create app in database
      const { data, error } = await supabase
        .from('apps')
        .insert([{
          name: appData.name,
          description: appData.description,
          tagline: appData.tagline,
          logo_url: appData.logo_url,
          category_id: appData.category_id
        }])
        .select();

      if (error) throw error;

      // Add screenshots if any
      if (appData.screenshots.length > 0 && data[0]) {
        await supabase.from('screens').insert(
          appData.screenshots.map(url => ({ app_id: data[0].id, url }))
        );
      }

      setSuccess('App imported successfully!');
      // Reset form
      setAppData({
        name: '',
        description: '',
        tagline: '',
        category_id: '',
        screenshots: []
      });
      setReferoUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during import');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Import App from Refero</h2>
      
      <div className="space-y-4 max-w-2xl">
        <form onSubmit={handleUrlSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Refero.design URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={referoUrl}
                onChange={e => setReferoUrl(e.target.value)}
                placeholder="https://refero.design/..."
                className="flex-1 p-2 rounded bg-gray-800 border border-gray-700 text-white"
                required
              />
              <button
                type="submit"
                disabled={extracting || !referoUrl}
                className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {extracting ? 'Extracting...' : 'Extract'}
              </button>
            </div>
          </div>
        </form>

        <div>
          <label className="block text-sm mb-1">Category</label>
          <select
            value={appData.category_id}
            onChange={handleCategoryChange}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
            required
          >
            <option value="">Select category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">App Details</label>
          <div className="space-y-2">
            <input
              type="text"
              value={appData.name}
              onChange={e => setAppData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="App Name"
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
            />
            <textarea
              value={appData.description}
              onChange={e => setAppData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description"
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
              rows={3}
            />
            <input
              type="text"
              value={appData.tagline}
              onChange={e => setAppData(prev => ({ ...prev, tagline: e.target.value }))}
              placeholder="Tagline (optional)"
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
            />
          </div>
        </div>

        {appData.logo_url && (
          <div>
            <label className="block text-sm mb-1">Logo</label>
            <img
              src={appData.logo_url}
              alt="Logo"
              className="w-16 h-16 rounded bg-background-light object-contain"
            />
          </div>
        )}

        {appData.screenshots.length > 0 && (
          <div>
            <label className="block text-sm mb-1">Screenshots</label>
            <div className="flex gap-2 flex-wrap">
              {appData.screenshots.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Screenshot ${index + 1}`}
                  className="w-16 h-16 rounded bg-background-light object-contain"
                />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="text-red-400">{error}</div>
        )}

        {success && (
          <div className="text-green-400">{success}</div>
        )}

        <button
          onClick={handleImport}
          disabled={importing || !appData.name || !appData.description || !appData.category_id}
          className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {importing ? 'Importing...' : 'Import App'}
        </button>
      </div>
    </div>
  );
};

export default BulkImport; 