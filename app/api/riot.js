export default async function handler(request, response) {
  const { host, path, ...extraParams } = request.query;

  if (!host || !path) {
    return response.status(400).json({ error: 'Missing host or path parameter' });
  }

  const apiKey = process.env.RIOT_API_KEY || process.env.VITE_RIOT_API_KEY;
  if (!apiKey) {
    return response.status(500).json({ error: 'Riot API Key is not configured on the server' });
  }

  // Build the target URL and append apiKey
  const queryParams = new URLSearchParams({ ...extraParams, api_key: apiKey }).toString();
  const targetUrl = `https://${host}${path}${path.includes('?') ? '&' : '?'}${queryParams}`;

  try {
    const apiRes = await fetch(targetUrl);
    const contentType = apiRes.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await apiRes.json();
      return response.status(apiRes.status).json(data);
    } else {
      const text = await apiRes.text();
      return response.status(apiRes.status).send(text);
    }
  } catch (err) {
    console.error('Error forwarding request to Riot API:', err);
    return response.status(500).json({ error: 'Failed to fetch from Riot API', details: err.message });
  }
}
