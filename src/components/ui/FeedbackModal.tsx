import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import Button from './Button';

interface FeedbackModalProps {
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose }) => {
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the feedback to your backend
    console.log('Feedback submitted:', feedback);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFeedback('');
    onClose();
    }, 1500);
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

        <h2 className="text-2xl font-semibold text-primary mb-4">
          Feedback
        </h2>
        <p className="text-primary-muted mb-6">
          We'd love to hear your thoughts on how we can make Appssey better!
        </p>

        {submitted ? (
          <div className="text-center text-green-500 font-semibold py-12 text-lg">Feedback submitted successfully!</div>
        ) : (
        <form onSubmit={handleSubmit}>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Enter your feedback..."
            className="w-full h-32 p-4 rounded-lg bg-background-light border border-border text-primary placeholder:text-primary-muted focus:border-primary-muted outline-none resize-none mb-4"
          />
          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
        )}
      </motion.div>
    </motion.div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default FeedbackModal;