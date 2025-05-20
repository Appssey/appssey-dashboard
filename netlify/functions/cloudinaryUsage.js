export const handler = async (event, context) => {
  console.log('Cloudinary function started');
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  console.log('Cloudinary env:', cloudName, apiKey, apiSecret);

  if (!cloudName || !apiKey || !apiSecret) {
    console.error('Missing Cloudinary credentials');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing Cloudinary credentials in environment variables.' })
    };
  }

  const FREE_PLAN_LIMIT_BYTES = 25 * 1024 * 1024 * 1024; // 25 GB in bytes

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/usage`, {
      headers: {
        Authorization: 'Basic ' + Buffer.from(apiKey + ':' + apiSecret).toString('base64')
      }
    });
    console.log('Cloudinary API response status:', response.status);
    const data = await response.json();
    console.log('Cloudinary API response data:', data);
    if (data.error) {
      console.error('Cloudinary API error:', data.error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: data.error.message })
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({
        storage_used: data.storage?.usage,
        storage_limit: data.plan === 'Free' ? FREE_PLAN_LIMIT_BYTES : data.credits?.limit
      })
    };
  } catch (err) {
    console.error('Cloudinary fetch error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}; 