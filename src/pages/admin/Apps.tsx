import React, { useEffect, useState } from 'react';

const Apps: React.FC = () => {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', logo_url: '', category_ids: [], screenshots: [] });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [screenshotsFiles, setScreenshotsFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch('/.netlify/functions/adminApps')
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return setApps([]);
        setApps(data);
        setLoading(false);
      });
  }, []);

  // Cloudinary upload helper
  const uploadToCloudinary = async (file: File, folder = 'appssey') => {
    const base64 = await toBase64(file);
    const res = await fetch('/.netlify/functions/uploadImage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file: base64, folder }),
    });
    const data = await res.json();
    return data.url;
  };
  const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      const url = await uploadToCloudinary(e.target.files[0], 'appssey/logos');
      setForm(f => ({ ...f, logo_url: url }));
      setLogoFile(e.target.files[0]);
      setUploading(false);
    }
  };
  const handleScreenshotsChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploading(true);
      const files = Array.from(e.target.files);
      const urls = [];
      for (const file of files) {
        urls.push(await uploadToCloudinary(file, 'appssey/screenshots'));
      }
      setForm(f => ({ ...f, screenshots: [...(f.screenshots || []), ...urls] }));
      setScreenshotsFiles(f => [...f, ...files]);
      setUploading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Apps</h2>
      <button className="mb-4 px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition" onClick={() => setModalOpen(true)}>
        + Add App
      </button>
      {loading ? (
        <div>Loading apps...</div>
      ) : !apps.length ? (
        <div>No apps found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 rounded-xl">
            <thead>
              <tr>
                <th className="p-2 text-left">Logo</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Description</th>
                <th className="p-2 text-left">Categories</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {apps.map(app => (
                <tr key={app.id} className="border-t border-gray-700 hover:bg-gray-700/30">
                  <td className="p-2"><img src={app.logo_url} alt={app.name} className="w-10 h-10 rounded bg-background-light object-contain" /></td>
                  <td className="p-2 font-semibold">{app.name}</td>
                  <td className="p-2">{app.description}</td>
                  <td className="p-2">{Array.isArray(app.category_ids) ? app.category_ids.join(', ') : '-'}</td>
                  <td className="p-2 flex gap-2">
                    <button className="text-blue-400 hover:underline">Edit</button>
                    <button className="text-red-400 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-gray-900 rounded-xl p-8 min-w-[340px] max-w-[95vw] shadow-xl relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
              onClick={() => setModalOpen(false)}
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4">Add App</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm mb-1">App Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  required
                  className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Logo</label>
                <input type="file" accept="image/*" onChange={handleLogoChange} />
                {form.logo_url && <img src={form.logo_url} alt="Logo" className="w-16 h-16 mt-2 rounded bg-background-light object-contain" />}
              </div>
              <div>
                <label className="block text-sm mb-1">Screenshots</label>
                <input type="file" accept="image/*" multiple onChange={handleScreenshotsChange} />
                <div className="flex gap-2 mt-2 flex-wrap">
                  {form.screenshots && form.screenshots.map((url, idx) => (
                    <img key={url} src={url} alt="Screenshot" className="w-16 h-16 rounded bg-background-light object-contain" />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition" disabled={uploading}>
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Apps; 