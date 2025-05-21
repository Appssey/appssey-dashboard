import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import { AuthProvider } from './context/AuthContext';
import './index.css';
import Admin from './pages/Admin';
import Dashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Apps from './pages/admin/Apps';
import Categories from './pages/admin/Categories';
import AppScreenshotsPage from './pages/AppScreenshotsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<AppScreenshotsPage />} />
          <Route path="/admin" element={<Admin />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="apps" element={<Apps />} />
            <Route path="categories" element={<Categories />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;