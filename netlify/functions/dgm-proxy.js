// netlify/functions/dgm-proxy.js
import fetch from 'node-fetch';

export async function handler(event, context) {
  try {
    // Original-Pfad aus der URL: /dgm/... oder /dom/...
    const path = event.path.replace('/.netlify/functions/dgm-proxy', '');
    
    // Vollständige URL auf S3
    const s3Url = `https://dgm1.s3.eu-de.cloud-object-storage.appdomain.cloud${path}`;
    
    // Datei vom S3 laden
    const res = await fetch(s3Url);
    
    if (!res.ok) {
      return { statusCode: res.status, body: `Fehler beim Laden: ${res.statusText}` };
    }

    const arrayBuffer = await res.arrayBuffer();

    // Base64-codiert zurückgeben, da es Binärdaten sind
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Access-Control-Allow-Origin': '*', // CORS erlauben
      },
      body: Buffer.from(arrayBuffer).toString('base64'),
      isBase64Encoded: true
    };

  } catch (err) {
    return { statusCode: 500, body: `Server-Fehler: ${err.message}` };
  }
}