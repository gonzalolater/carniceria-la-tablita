// Netlify Function: create_preference
// Expects POST body: { payer: { name, email }, quantity: number, unit_price: number }
// Requires environment variable MERCADOPAGO_ACCESS_TOKEN set in Netlify site settings.

exports.handler = async function (event) {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    const body = JSON.parse(event.body || '{}');
    const { payer = {}, quantity = 1, unit_price = 1000 } = body;

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return { statusCode: 500, body: JSON.stringify({ error: 'MERCADOPAGO_ACCESS_TOKEN not configured' }) };
    }

    const preferencePayload = {
      items: [
        {
          title: 'Boletos Sorteo - Carnicería la Tablita',
          quantity: Number(quantity) || 1,
          currency_id: 'ARS',
          unit_price: Number(unit_price) || 1000,
        },
      ],
      payer: {
        name: payer.name || 'Comprador',
        email: payer.email || 'no-reply@example.com',
      },
      back_urls: {
        success: process.env.MP_SUCCESS_URL || 'https://carniceria-tablita.netlify.app/',
        failure: process.env.MP_FAILURE_URL || 'https://carniceria-tablita.netlify.app/',
        pending: process.env.MP_PENDING_URL || 'https://carniceria-tablita.netlify.app/',
      },
      auto_return: 'approved',
    };

    const resp = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferencePayload),
    });

    const data = await resp.json();
    if (!resp.ok) {
      return { statusCode: resp.status || 500, body: JSON.stringify({ error: data }) };
    }

    // Return the init_point (checkout URL) to the client
    return {
      statusCode: 200,
      body: JSON.stringify({ init_point: data.init_point, preference_id: data.id }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message || String(err) }) };
  }
};
