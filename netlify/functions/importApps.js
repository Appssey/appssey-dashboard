const { createClient } = require('@supabase/supabase-js');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for writes
);

async function getCategoryIdOrCreate(categoryName) {
  if (!categoryName) return null;
  let { data, error } = await supabase.from('categories').select('id, name');
  if (error) throw error;
  let match = data.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase());
  if (match) return match.id;
  const { data: newCat, error: insertErr } = await supabase
    .from('categories')
    .insert([{ name: categoryName }])
    .select();
  if (insertErr) throw insertErr;
  return newCat && newCat[0] && newCat[0].id;
}

async function uploadToCloudinary(fileOrUrl, folder = 'refero') {
  if (!fileOrUrl) return '';
  const res = await cloudinary.uploader.upload(fileOrUrl, { folder });
  return res.secure_url;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const apps = JSON.parse(event.body); // [{ name, description, ... }]
    const results = [];
    for (const appData of apps) {
      // Upload logo
      const logoUrl = await uploadToCloudinary(appData.logo_url, 'refero/logos');
      // Upload screenshots
      let screenshotUrls = [];
      if (appData.screenshot_urls && appData.screenshot_urls.length) {
        for (const ssUrl of appData.screenshot_urls) {
          const uploaded = await uploadToCloudinary(ssUrl, 'refero/screenshots');
          if (uploaded) screenshotUrls.push(uploaded);
        }
      }
      // Get or create category
      const categoryId = await getCategoryIdOrCreate(appData.category);
      // Insert app
      const { data, error } = await supabase
        .from('apps')
        .insert([{
          name: appData.name,
          description: appData.description,
          tagline: appData.tagline,
          logo_url: logoUrl,
          category_id: categoryId
        }])
        .select();
      if (error) throw error;
      // Insert screenshots
      if (screenshotUrls.length && data[0]) {
        await supabase.from('screens').insert(
          screenshotUrls.map(url => ({ app_id: data[0].id, url }))
        );
      }
      results.push({ app: data[0], screenshots: screenshotUrls });
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, results }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}; 