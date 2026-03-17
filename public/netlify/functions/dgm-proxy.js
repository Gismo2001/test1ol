// netlify/functions/dgm-proxy.js
import fetch from 'node-fetch';

export async function handler(event) {
  try {
    // Pfad aus dem Request extrahieren
    const path = event.path.replace('/.netlify/functions/dgm-proxy', '');
    const s3Url = `https://dgm1.s3.eu-de.cloud-object-storage.appdomain.cloud${path}`;

    const res = await fetch(s3Url);
    if (!res.ok) {
      return { statusCode: res.status, body: `Fehler beim Laden: ${res.statusText}` };
    }

    const arrayBuffer = await res.arrayBuffer();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Access-Control-Allow-Origin': '*' // wichtig für Frontend
      },
      body: Buffer.from(arrayBuffer).toString('base64'),
      isBase64Encoded: true
    };
  } catch (err) {
    return { statusCode: 500, body: `Server-Fehler: ${err.message}` };
  }
}