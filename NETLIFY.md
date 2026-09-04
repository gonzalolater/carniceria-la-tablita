Conexión con Netlify

1) En Netlify, elegir "New site from Git" y conectar el repositorio gonzalolater/carniceria-la-tablita.
2) Build command: npm run build
3) Publish directory: dist
4) Si se usan funciones, subirlas a netlify/functions (opcional).
5) Para desplegar desde la CLI: exportar NETLIFY_AUTH_TOKEN y usar `netlify deploy` o usar `netlify init`.

El archivo netlify.toml ya está incluido en el repositorio y añade un redirect para SPA y configura build/publish.

Sorteos con Mercado Pago

1) Configurar variables de entorno en Netlify (Site settings > Build & deploy > Environment):
   - MERCADOPAGO_ACCESS_TOKEN: token secreto de Mercado Pago (server-side)
   - MP_SUCCESS_URL, MP_FAILURE_URL, MP_PENDING_URL (opcional)

2) La función serverless está en netlify/functions/create_preference.js y espera POST JSON:
   { "payer": { "name": "...", "email": "..." }, "quantity": 2, "unit_price": 1000 }

3) El componente cliente está en src/Raffle.jsx. Envía la petición al endpoint y redirige al checkout de Mercado Pago.

Nota: Probar en modo sandbox de Mercado Pago según su documentación cambiando las credenciales a sandbox y revisando el flujo de pagos.
