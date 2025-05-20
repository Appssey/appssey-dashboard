import React, { useState } from 'react';

const TestUpload: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Convert file to base64
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        if (!event.target?.result) return;
        
        // Upload to Cloudinary via our Netlify function
        const response = await fetch('/.netlify/functions/uploadImage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file: event.target.result,
            folder: 'test-uploads'
          })
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Upload failed');
        }

        setImageUrl(data.url);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Test Image Upload</h2>
      
      <div className="mb-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-300
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-600 file:text-white
            hover:file:bg-blue-700"
        />
      </div>

      {loading && (
        <div className="text-blue-400">Uploading...</div>
      )}

      {error && (
        <div className="text-red-400 mb-4">{error}</div>
      )}

      {imageUrl && (
        <div className="mt-4">
          <p className="text-green-400 mb-2">Upload successful!</p>
          <img 
            src={imageUrl} 
            alt="Uploaded" 
            className="max-w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );
};

export default TestUpload; 