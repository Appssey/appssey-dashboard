import React, { useState, useEffect } from 'react';
import Sidebar from '../components/admin/Sidebar';

const ADMIN_TOKEN_KEY = 'appssey_admin_token';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/.netlify/functions/adminAuth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      setIsAuthenticated(true);
    } else {
      setError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <form onSubmit={handleLogin} className="bg-gray-900 p-8 rounded-xl shadow-xl w-full max-w-sm flex flex-col gap-4">
          <h2 className="text-2xl font-bold mb-2 text-center">Admin Login</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="p-3 rounded bg-gray-800 border border-gray-700 text-white"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="p-3 rounded bg-gray-800 border border-gray-700 text-white"
            required
          />
          {error && <div className="text-red-400 text-center text-sm">{error}</div>}
          <button type="submit" className="bg-blue-600 text-white font-semibold rounded p-3 hover:bg-blue-700 transition">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-end mb-4">
          <button onClick={handleLogout} className="text-red-400 hover:underline">Logout</button>
        </div>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout; 