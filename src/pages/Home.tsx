import React, { useState, useEffect } from 'react';
import { App, Category } from '../types/app.types';
import { CATEGORIES } from '../data/mockData';
import Header from '../components/layout/Header';
import CategoryFilter from '../components/ui/CategoryFilter';
import AppGrid from '../components/app/AppGrid';
import SearchBar from '../components/ui/SearchBar';
import { useAuth } from '../context/AuthContext';
import AppCard from '../components/app/AppCard';
import LoginModal from '../components/auth/LoginModal';
import AppDetailModal from '../components/ui/AppDetailModal';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  try {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [allApps, setAllApps] = useState<App[]>([]);
    const [filteredApps, setFilteredApps] = useState<App[]>([]);
    const { isAuthenticated } = useAuth();
    const [showLogin, setShowLogin] = useState(false);
    const [selectedApp, setSelectedApp] = useState<App | null>(null);
    const [selectedScreenIndex, setSelectedScreenIndex] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const navigate = useNavigate();

    // Number of columns in the grid (as in AppGrid)
    const columns = 5;
    const maxRows = 3;
    const maxVisible = columns * maxRows;
    const shouldShowFade = !isAuthenticated && filteredApps.length > maxVisible;

    // Fetch all apps from Netlify function on mount
    useEffect(() => {
      const fetchApps = async () => {
        setLoading(true);
        const res = await fetch('/.netlify/functions/getApps');
        const data = await res.json();
        if (!Array.isArray(data)) {
          setAllApps([]);
        } else {
          setAllApps(data);
        }
        setLoading(false);
      };
      fetchApps();
    }, []);

    // Fetch categories from Supabase on mount
    useEffect(() => {
      const fetchCategories = async () => {
        let res = await fetch('/.netlify/functions/adminCategories');
        let data = await res.json();
        if (!Array.isArray(data)) setCategories([]);
        else setCategories(data);
      };
      fetchCategories();
    }, []);

    // Filter apps based on category and search
    useEffect(() => {
      let filtered = [...allApps];
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(app => app.category_id === selectedCategory);
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(app => 
          app.name.toLowerCase().includes(query) || 
          app.description.toLowerCase().includes(query)
        );
      }
      setFilteredApps(filtered);
    }, [allApps, selectedCategory, searchQuery]);

    return (
      <div className="min-h-screen bg-background text-primary" onContextMenu={e => e.preventDefault()}>
        <Header onSearch={setSearchQuery} />
        <main className="container mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 flex-wrap">
            {/* Left logos */}
            <div className="flex gap-3 sm:gap-6 items-center mb-4 sm:mb-0">
              <img src="/logos/Container.png" alt="Creme" className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-contain" />
              <img src="/logos/Container-1.png" alt="Nike" className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-contain bg-white p-2" />
              <img src="/logos/Container-2.png" alt="Discord" className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-contain bg-yellow-400 p-2" />
            </div>
            {/* Center heading */}
            <h1 className="text-3xl sm:text-6xl font-bold text-center flex-1 mb-4 sm:mb-0">
              Explore Screens
            </h1>
            {/* Right logos */}
            <div className="flex gap-3 sm:gap-6 items-center">
              <img src="/logos/Container-3.png" alt="Dropbox" className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-contain bg-blue-500 p-2" />
              <img src="/logos/Container-4.png" alt="Marvel" className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-contain bg-pink-200 p-2" />
              <img src="/logos/image.png" alt="Wise" className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-contain bg-green-200 p-2" />
            </div>
          </div>
          <div className="max-w-lg mx-auto mb-12">
            <SearchBar 
              placeholder="Search" 
              className="w-full md:hidden mb-6"
              onSearch={setSearchQuery}
            />
          </div>
          <div className="mb-8 overflow-x-auto sticky top-[72px] z-20 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onChange={setSelectedCategory}
            />
          </div>
          {loading ? (
            <div className="text-center py-12">Loading apps...</div>
          ) : filteredApps.length > 0 ? (
            <div className="relative">
              <AppGrid
                apps={filteredApps}
                onCardClick={!isAuthenticated
                  ? () => setShowLogin(true)
                  : (app, screenIndex = 0) => {
                      setSelectedApp(app);
                      setSelectedScreenIndex(screenIndex);
                    }
                }
              />
              {shouldShowFade && (
                <div className="absolute left-0 right-0" style={{top: `calc(${maxRows} * 100% / ${Math.ceil(filteredApps.length / columns)})`, bottom: 0, zIndex: 10}}>
                  <div className="w-full h-full bg-gradient-to-b from-transparent to-black/90 flex flex-col items-center justify-end pointer-events-auto" style={{minHeight: '200px'}}>
                    <div className="w-full flex flex-col items-center justify-center py-16">
                      <button
                        className="bg-white text-black font-semibold rounded-full px-8 py-3 text-lg shadow-lg hover:bg-gray-200 transition mb-4"
                        onClick={() => setShowLogin(true)}
                      >
                        Log in or sign up to continue browsing apps
                      </button>
                      <p className="text-xs text-primary-muted text-center max-w-xs">
                        By continuing, you acknowledge that you have read and understood, and agree to Mobbin's Terms of Service and Privacy Policy.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
              {isAuthenticated && selectedApp && (
                <AppDetailModal app={selectedApp} selectedScreenIndex={selectedScreenIndex} onClose={() => setSelectedApp(null)} />
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-primary-muted text-lg">
                No apps found matching your criteria.
              </p>
            </div>
          )}
        </main>
      </div>
    );
  } catch (e) {
    return <div>Error: {String(e)}</div>;
  }
};

export default Home;