# ¿Cuánto tiempo campeón?

Sitio web que muestra cuánto tiempo hace que cada selección campeona del mundo ganó su última Copa Mundial de la FIFA. El contador arranca desde la fecha de la final correspondiente y se actualiza en tiempo real.

El último campeón aparece destacado en el título, con su bandera y un fondo inspirado en los colores de su bandera. El resto de los campeones históricos se listan ordenados por antigüedad del título.

## Datos dinámicos con Zafronix

La app consume un endpoint propio en Vercel (`/api/world-champions`) que actúa como proxy hacia la [Zafronix World Cup API](https://api.zafronix.com/docs). La respuesta se cachea por 24 horas en el edge para no agotar el free tier.

Si la API no responde o no hay key configurada, la interfaz usa un fallback local con los campeones históricos actuales.

### Variables de entorno

Configurá `ZAFRONIX_API_KEY` en:

- Vercel: **Project Settings → Environment Variables**
- Desarrollo local: copiá `.env.example` a `.env.local` y completá tu key

No commitees la API key al repositorio.

### Desarrollo local

- `yarn start`: levanta solo el frontend. Si `/api/world-champions` no está disponible, verás el fallback local.
- `npx vercel dev`: levanta frontend + API Route serverless para probar el flujo completo.

### Deploy en Vercel

1. Conectá el repositorio a Vercel.
2. Agregá `ZAFRONIX_API_KEY` como variable de entorno del proyecto.
3. Usá Node.js **24.x** (declarado en `package.json` y `.nvmrc`).
4. Deployá normalmente con `yarn build`.

Cuando haya un nuevo campeón mundial, el sitio se actualizará automáticamente al vencer el cache del endpoint, sin necesidad de redeployar.
