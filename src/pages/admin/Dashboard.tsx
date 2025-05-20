import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { FiUsers, FiGrid, FiImage, FiDatabase } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [appCount, setAppCount] = useState<number>(0);
  const [screenshotCount, setScreenshotCount] = useState<number>(0);
  const [userCount, setUserCount] = useState<string | number>('N/A');
  const [storageUsed, setStorageUsed] = useState<string>('—');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      // Fetch apps and screenshots
      try {
        const { data: apps, error: appsError } = await supabase.from('apps').select('screens');
        if (appsError) {
          if (appsError.message && appsError.message.includes('column')) {
            setError('The "screens" column is missing in your apps table. Please add it as a text[] array.');
          } else {
            setError('Error loading app stats.');
          }
          setAppCount(0);
          setScreenshotCount(0);
        } else if (apps) {
          setAppCount(apps.length);
          const totalScreens = apps.reduce((sum, app) => sum + (Array.isArray(app.screens) ? app.screens.length : 0), 0);
          setScreenshotCount(totalScreens);
        }
      } catch (e) {
        setError('Error loading app stats.');
        setAppCount(0);
        setScreenshotCount(0);
      }
      // Handle user count gracefully (client cannot access admin users API)
      fetch('/.netlify/functions/userCount')
        .then(res => res.json())
        .then(data => setUserCount(data.count));
      // Fetch Cloudinary storage usage
      fetch('/.netlify/functions/cloudinaryUsage')
        .then(res => res.json())
        .then(data => {
          if (data && data.storage_used != null && data.storage_limit != null) {
            const usedMB = (data.storage_used / (1024 * 1024)).toFixed(1);
            const limitMB = (data.storage_limit / (1024 * 1024)).toFixed(1);
            setStorageUsed(`${usedMB} MB of ${limitMB} MB used`);
          } else {
            setStorageUsed('—');
          }
        })
        .catch(() => setStorageUsed('—'));
      setLoading(false);
    };
    fetchStats();
  }, []);

  const stats = [
    {
      label: 'Total Users',
      value: loading ? '...' : userCount,
      icon: <FiUsers size={28} className="text-blue-500" />,
    },
    {
      label: 'Total Apps',
      value: loading ? '...' : appCount,
      icon: <FiGrid size={28} className="text-green-500" />,
    },
    {
      label: 'Screenshots',
      value: loading ? '...' : screenshotCount,
      icon: <FiImage size={28} className="text-purple-500" />,
    },
    {
      label: 'Storage Used',
      value: loading ? '...' : storageUsed,
      icon: <FiDatabase size={28} className="text-yellow-500" />,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 bg-gray-800 rounded-xl p-6 shadow hover:shadow-lg transition"
          >
            <div className="bg-white bg-opacity-10 rounded-full p-3 flex items-center justify-center">
              {stat.icon}
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-gray-400 text-sm font-medium">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Graph Placeholder */}
      <div className="bg-gray-800 rounded-xl p-8 mt-6 min-h-[260px] flex flex-col items-center justify-center shadow">
        <div className="text-lg font-semibold text-gray-200 mb-2">User Growth (Last 30 Days)</div>
        <div className="w-full h-40 flex items-center justify-center text-gray-500">
          <UserGrowthChart />
        </div>
      </div>
      {error && (
        <div className="text-red-400 text-center mt-4">{error}</div>
      )}
    </div>
  );
};

const UserGrowthChart: React.FC = () => {
  const [data, setData] = useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/.netlify/functions/userGrowth')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <span className="italic text-gray-500">Loading chart...</span>;
  if (!data.length) return <span className="italic text-gray-500">No data</span>;

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#aaa' }} tickFormatter={d => d.slice(5)} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#aaa' }} />
        <Tooltip labelFormatter={d => `Date: ${d}`} />
        <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default Dashboard; 