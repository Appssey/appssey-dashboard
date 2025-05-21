export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  const { email, password } = JSON.parse(event.body || '{}');
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Email and password required' }) };
  }
  if (email === adminEmail && password === adminPassword) {
    // Generate a simple session token
    const token = require('crypto').randomBytes(32).toString('hex');
    // Optionally, you could store this in a DB or cache for real logout/session expiry
    return {
      statusCode: 200,
      body: JSON.stringify({ token })
    };
  } else {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Invalid credentials' })
    };
  }
}; 