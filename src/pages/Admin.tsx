import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminLayout from './AdminLayout';

const Admin: React.FC = () => {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

export default Admin; 