import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { url } = JSON.parse(event.body || '{}');
    
    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'URL is required' })
      };
    }

    // Fetch the page content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
      }
    });
    const html = await response.text();
    console.log(html); // DEBUG: log the fetched HTML
    const $ = cheerio.load(html);

    // Extract name (h1.hxl4h)
    const name = $('h1.hxl4h').first().text().trim();

    // Extract description (div.FEoMk)
    const description = $('div.FEoMk').first().text().trim();
    const tagline = description;

    // Extract category (div.hHh8R.iqHsa)
    const category = $('div.hHh8R.iqHsa').first().text().trim();

    // Extract logo (img.zrXK2)
    const logoUrl = $('img.zrXK2').first().attr('src') || '';

    // Screenshots: leave empty for now
    const screenshots = [];

    return {
      statusCode: 200,
      body: JSON.stringify({
        name,
        description,
        tagline,
        category,
        logo_url: logoUrl,
        screenshots
      })
    };
  } catch (err) {
    console.error('Error extracting data:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Failed to extract data' })
    };
  }
}; 