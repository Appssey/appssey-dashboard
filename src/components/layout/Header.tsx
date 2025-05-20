import React, { useState } from 'react';
import { User, CircleUser, LogOut, MessageSquare } from 'lucide-react';
import Button from '../ui/Button';
import SearchBar from '../ui/SearchBar';
import LoginModal from '../auth/LoginModal';
import FeedbackModal from '../ui/FeedbackModal';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../lib/utils';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="w-full px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-lg sm:text-xl text-primary">appssey</span>
      </div>

      <div className="hidden md:block max-w-md w-full">
        <SearchBar placeholder="Search" onSearch={onSearch} />
      </div>
      
      <div className="relative">
        {isAuthenticated ? (
          <>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-background font-bold text-lg hover:opacity-80 transition focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {getInitials(user?.name || user?.email || '?')}
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-background-card rounded-lg shadow-lg py-1 z-50">
                <button
                  onClick={() => {
                    setIsFeedbackModalOpen(true);
                    setIsUserMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-primary hover:bg-background-light"
                >
                  <span>Feedback</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setIsUserMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left text-primary hover:bg-background-light"
                >
                  <span>Logout</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <Button onClick={() => setIsLoginModalOpen(true)}>
            Login
          </Button>
        )}
      </div>

      {isLoginModalOpen && (
        <LoginModal onClose={() => setIsLoginModalOpen(false)} />
      )}

      {isFeedbackModalOpen && (
        <FeedbackModal onClose={() => setIsFeedbackModalOpen(false)} />
      )}
    </header>
  );
};

export default Header;