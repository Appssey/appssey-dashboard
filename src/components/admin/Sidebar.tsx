import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FiHome, FiUsers, FiGrid, FiTag, FiMenu } from 'react-icons/fi';

const links = [
  { to: '/admin', label: 'Dashboard', icon: FiHome },
  { to: '/admin/users', label: 'Users', icon: FiUsers },
  { to: '/admin/apps', label: 'Apps', icon: FiGrid },
  { to: '/admin/categories', label: 'Categories', icon: FiTag },
];

const Sidebar: React.FC = () => {
  // Responsive sidebar state (for mobile)
  const [open, setOpen] = React.useState(false);
  const location = useLocation();

  return (
    <>
      {/* Hamburger for mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white p-2 rounded shadow-lg"
        onClick={() => setOpen(!open)}
        aria-label="Toggle sidebar"
      >
        <FiMenu size={24} />
      </button>
      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-gray-900 text-white flex flex-col py-8 px-4 min-h-screen z-40 transition-transform duration-200 md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="text-2xl font-bold mb-10 tracking-tight">Admin</div>
        <nav className="flex flex-col gap-2">
          {links.map(link => {
            const isDashboard = link.to === '/admin';
            const isActive = isDashboard
              ? location.pathname === '/admin' || location.pathname === '/admin/'
              : location.pathname.startsWith(link.to);
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={false}
                className={`flex items-center gap-3 px-4 py-2 rounded transition font-medium text-base ${isActive ? 'bg-white text-black shadow' : 'hover:bg-gray-800 text-gray-200'}`}
                onClick={() => setOpen(false)}
                style={{ fontWeight: isActive ? 600 : 500 }}
              >
                <Icon size={20} className={isActive ? 'text-black' : 'text-gray-200'} />
                {link.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar; 