export const handler = async (event) => {
  const url = event.queryStringParameters?.url;
  if (!url) return { statusCode: 400, body: 'Missing url' };

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return { statusCode: 502, body: 'Failed to fetch image' };
    }
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const buffer = await response.arrayBuffer();
    // Try to extract filename from url
    const filename = url.split('/').pop()?.split('?')[0] || 'downloaded-image.jpg';
    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Access-Control-Allow-Origin': '*',
      },
      body: Buffer.from(buffer).toString('base64'),
      isBase64Encoded: true,
    };
  } catch (err) {
    return { statusCode: 500, body: 'Error: ' + err.message };
  }
}; 