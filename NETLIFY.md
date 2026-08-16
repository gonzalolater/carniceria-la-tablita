Conexión con Netlify

1) En Netlify, elegir "New site from Git" y conectar el repositorio gonzalolater/carniceria-la-tablita.
2) Build command: npm run build
3) Publish directory: dist
4) Si se usan funciones, subirlas a netlify/functions (opcional).
5) Para desplegar desde la CLI: exportar NETLIFY_AUTH_TOKEN y usar `netlify deploy` o usar `netlify init`.

El archivo netlify.toml ya está incluido en el repositorio y añade un redirect para SPA y configura build/publish.
