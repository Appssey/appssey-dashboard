import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import VerificationForm from './VerificationForm';
import { supabase } from '../supabaseClient';

interface LoginModalProps {
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    try {
      await login(email, name);
      setShowVerification(true);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleVerificationSuccess = () => {
    setShowVerification(false);
    onClose();
  };

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[100]"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-background w-full max-w-md rounded-xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-primary-muted hover:text-primary"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <AnimatePresence mode="wait">
          {!showVerification ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-center text-2xl font-semibold text-primary mb-8">
                Log in or sign up
              </h2>
              <p className="text-center text-primary-muted mb-8">
                to continue browsing apps
              </p>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Enter Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full p-4 rounded-md bg-background-light border border-border text-primary focus:border-primary-muted outline-none"
                  />
                </div>
                <div className="mb-6">
                  <input
                    type="email"
                    placeholder="Enter Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-4 rounded-md bg-background-light border border-border text-primary focus:border-primary-muted outline-none"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  isLoading={isLoading}
                >
                  Continue
                </Button>
              </form>
              <p className="text-xs text-primary-muted text-center mt-6">
                By continuing, you acknowledge that you have read and understood,
                <br />and agree to appssey's Terms of Service and Privacy Policy.
              </p>
            </motion.div>
          ) : (
            <VerificationForm onBack={() => setShowVerification(false)} onSuccess={handleVerificationSuccess} />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default LoginModal;