import cloudinaryModule from 'cloudinary';
const cloudinary = cloudinaryModule.v2;

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { file, folder } = JSON.parse(event.body || '{}');
    
    if (!file) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: 'Missing file data' }) 
      };
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Cloudinary configuration is missing' })
      };
    }

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const result = await cloudinary.uploader.upload(file, {
      folder: folder || 'appssey',
      resource_type: 'auto'
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        url: result.secure_url,
        public_id: result.public_id
      })
    };
  } catch (err) {
    console.error('Upload error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: err.message || 'Failed to upload image'
      })
    };
  }
}; 