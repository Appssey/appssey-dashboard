import React, { useEffect, useState } from 'react';

interface Category {
  id: string;
  name: string;
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<{ id?: string; name: string }>({ name: '' });
  const [saving, setSaving] = useState(false);

  const fetchCategories = () => {
    setLoading(true);
    fetch('/.netlify/functions/adminCategories')
      .then(res => res.json())
      .then(data => {
        setCategories(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load categories');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = () => {
    setForm({ name: '' });
    setEditMode(false);
    setModalOpen(true);
  };

  const handleEdit = (cat: Category) => {
    setForm({ id: cat.id, name: cat.name });
    setEditMode(true);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this category?')) return;
    setSaving(true);
    await fetch('/.netlify/functions/adminCategories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setSaving(false);
    fetchCategories();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (editMode && form.id) {
      await fetch('/.netlify/functions/adminCategories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: form.id, name: form.name }),
      });
    } else {
      await fetch('/.netlify/functions/adminCategories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name }),
      });
    }
    setSaving(false);
    setModalOpen(false);
    setForm({ name: '' });
    fetchCategories();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Categories</h2>
      <button className="mb-4 px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition" onClick={handleAdd}>
        + Add Category
      </button>
      {loading ? (
        <div>Loading categories...</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : !categories.length ? (
        <div>No categories found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 rounded-xl">
            <thead>
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id} className="border-t border-gray-700 hover:bg-gray-700/30">
                  <td className="p-2 font-semibold">{cat.name}</td>
                  <td className="p-2 flex gap-2">
                    <button className="text-blue-400 hover:underline" onClick={() => handleEdit(cat)}>Edit</button>
                    <button className="text-red-400 hover:underline" onClick={() => handleDelete(cat.id)} disabled={saving}>Delete</button>
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
          <div className="bg-gray-900 rounded-xl p-8 min-w-[320px] max-w-[90vw] shadow-xl relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
              onClick={() => setModalOpen(false)}
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4">{editMode ? 'Edit Category' : 'Add Category'}</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm mb-1">Category Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition" disabled={saving}>
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

export default Categories; 