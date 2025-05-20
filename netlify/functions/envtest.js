export const handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      supabaseUrl: process.env.SUPABASE_URL ? 'Set' : 'Not Set',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY ? 'Set' : 'Not Set',
      cloudName: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not Set',
      cloudinaryApiKey: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not Set',
      cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not Set'
    })
  };
};
