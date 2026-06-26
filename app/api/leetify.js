export default async function handler(request, response) {
  const { path, ...extraParams } = request.query;

  if (!path) {
    return response.status(400).json({ error: 'Missing path parameter' });
  }

  const apiKey = process.env.LEETIFY_API_KEY || process.env.VITE_LEETIFY_API_KEY;
  if (!apiKey) {
    return response.status(500).json({ error: 'Leetify API Key is not configured on the server' });
  }

  // Build the target URL
  const queryParams = new URLSearchParams(extraParams).toString();
  const targetUrl = `https://api-public.cs-prod.leetify.com${path}${queryParams ? '?' + queryParams : ''}`;

  try {
    const apiRes = await fetch(targetUrl, {
      headers: {
        '_leetify_key': apiKey
      }
    });

    const contentType = apiRes.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await apiRes.json();
      return response.status(apiRes.status).json(data);
    } else {
      const text = await apiRes.text();
      return response.status(apiRes.status).send(text);
    }
  } catch (err) {
    console.error('Error forwarding request to Leetify API:', err);
    return response.status(500).json({ error: 'Failed to fetch from Leetify API', details: err.message });
  }
}
