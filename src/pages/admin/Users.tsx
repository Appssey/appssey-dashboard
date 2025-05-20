import React, { useEffect, useState } from 'react';

const Users: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addStatus, setAddStatus] = useState('active');
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    fetch('/.netlify/functions/users' + (search ? `?search=${encodeURIComponent(search)}` : ''))
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load users');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [search]);

  const handleView = (user: any) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleDeactivate = async (user: any) => {
    if (!window.confirm(`Deactivate user ${user.email}?`)) return;
    setActionLoading(true);
    await fetch('/.netlify/functions/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, action: 'deactivate' })
    });
    setActionLoading(false);
    fetchUsers();
  };

  const handleReactivate = async (user: any) => {
    if (!window.confirm(`Reactivate user ${user.email}?`)) return;
    setActionLoading(true);
    await fetch('/.netlify/functions/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, action: 'reactivate' })
    });
    setActionLoading(false);
    fetchUsers();
  };

  const handleDelete = async (user: any) => {
    if (!window.confirm(`Delete user ${user.email}? This cannot be undone.`)) return;
    setActionLoading(true);
    await fetch('/.netlify/functions/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id })
    });
    setActionLoading(false);
    fetchUsers();
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    if (!addName || !addEmail) {
      setAddError('Name and email are required');
      return;
    }
    setAddLoading(true);
    const res = await fetch('/.netlify/functions/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: addName, email: addEmail, status: addStatus })
    });
    const data = await res.json();
    setAddLoading(false);
    if (!res.ok) {
      setAddError(data.error || 'Failed to add user');
      return;
    }
    setAddModalOpen(false);
    setAddName('');
    setAddEmail('');
    setAddStatus('active');
    fetchUsers();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Users</h2>
      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="Search by email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring"
        />
        <button
          className="ml-2 px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          onClick={() => setAddModalOpen(true)}
        >
          + Add User
        </button>
      </div>
      {loading ? (
        <div>Loading users...</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : !users.length ? (
        <div>No users found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 rounded-xl">
            <thead>
              <tr>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Signup Date</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id} className="border-t border-gray-700 hover:bg-gray-700/30">
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.name || '-'}</td>
                  <td className="p-2">{u.created_at?.slice(0, 10)}</td>
                  <td className="p-2">{u.status || '-'}</td>
                  <td className="p-2 flex gap-2">
                    <button onClick={() => handleView(u)} className="text-blue-400 hover:underline">View</button>
                    {u.status === 'inactive' ? (
                      <button onClick={() => handleReactivate(u)} className="text-green-400 hover:underline" disabled={actionLoading}>Reactivate</button>
                    ) : (
                      <button onClick={() => handleDeactivate(u)} className="text-yellow-400 hover:underline" disabled={actionLoading}>Deactivate</button>
                    )}
                    <button onClick={() => handleDelete(u)} className="text-red-400 hover:underline" disabled={actionLoading}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* User Details Modal */}
      {modalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-gray-900 rounded-xl p-8 min-w-[320px] max-w-[90vw] shadow-xl relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
              onClick={() => setModalOpen(false)}
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4">User Details</h3>
            <div className="space-y-2">
              <div><span className="font-semibold">Email:</span> {selectedUser.email}</div>
              <div><span className="font-semibold">Name:</span> {selectedUser.name || '-'}</div>
              <div><span className="font-semibold">Signup Date:</span> {selectedUser.created_at?.slice(0, 10)}</div>
              <div><span className="font-semibold">Status:</span> {selectedUser.status || '-'}</div>
              <div><span className="font-semibold">ID:</span> {selectedUser.id}</div>
            </div>
          </div>
        </div>
      )}
      {/* Add User Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-gray-900 rounded-xl p-8 min-w-[320px] max-w-[90vw] shadow-xl relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
              onClick={() => setAddModalOpen(false)}
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4">Add User</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Name</label>
                <input
                  type="text"
                  value={addName}
                  onChange={e => setAddName(e.target.value)}
                  required
                  className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input
                  type="email"
                  value={addEmail}
                  onChange={e => setAddEmail(e.target.value)}
                  required
                  className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Status</label>
                <select
                  value={addStatus}
                  onChange={e => setAddStatus(e.target.value)}
                  className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              {addError && <div className="text-red-400 text-sm">{addError}</div>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600"
                  onClick={() => setAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                  disabled={addLoading}
                >
                  {addLoading ? 'Adding...' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users; 