import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

interface VerificationFormProps {
  onBack: () => void;
  onSuccess?: () => void;
}

const OTP_LENGTH = 6;

const VerificationForm: React.FC<VerificationFormProps> = ({ onBack, onSuccess }) => {
  const [code, setCode] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { verifyCode, isLoading } = useAuth();

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(0, 1);
    setCode(newCode);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const codeString = code.join('');
    if (codeString.length !== OTP_LENGTH) {
      setError(`Please enter all ${OTP_LENGTH} digits`);
      return;
    }
    const result = await verifyCode(codeString);
    if (!result) {
      setError('Incorrect OTP');
    } else {
      setSuccess(true);
      setTimeout(() => {
        if (typeof onSuccess === 'function') onSuccess();
        else if (typeof onBack === 'function') onBack();
      }, 1200);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      {success ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-4xl mb-4">✅</div>
          <div className="text-xl font-semibold text-primary mb-2">Verification Successful</div>
          <div className="text-primary-muted mb-4">You have been logged in successfully.</div>
        </div>
      ) : (
        <>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-primary-muted hover:text-primary mb-6"
      >
        <ArrowLeft size={18} />
        <span>Back</span>
      </button>

      <h2 className="text-center text-2xl font-semibold text-primary mb-8">
        Enter Verification Code
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="flex justify-center gap-4 mb-8">
              {Array.from({ length: OTP_LENGTH }).map((_, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={code[index]}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              className="w-12 h-12 text-center rounded-full bg-background-light border border-border text-primary focus:border-primary-muted text-xl font-medium outline-none"
            />
          ))}
        </div>

        {error && (
          <div className="text-red-500 text-center mb-4 text-sm">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
        >
          Verify
        </Button>
      </form>

      <p className="text-xs text-primary-muted text-center mt-6">
        By continuing, you acknowledge that you have read and understood,
            <br />and agree to appssey's Terms of Service and Privacy Policy.
      </p>
        </>
      )}
    </motion.div>
  );
};

export default VerificationForm;