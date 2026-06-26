# ¿Cuánto tiempo campeón?

Sitio web que muestra cuánto tiempo hace que cada selección campeona del mundo ganó su última Copa Mundial de la FIFA. El contador del campeón actual arranca desde la fecha de la final correspondiente y se actualiza en tiempo real.

El último campeón aparece destacado con su bandera y un fondo inspirado en los colores de su bandera. El resto de los campeones históricos se listan ordenados por sequía o por cantidad de títulos.

## Qué incluye el sitio

- **Contador en vivo** del campeón actual (días, horas, minutos y segundos).
- **Últimos resultados** del torneo actual (2026+); los partidos en curso aparecen como "En desarrollo" sin marcador hasta que finalizan.
- **Próximos partidos** del torneo actual: cruces programados para el día según tu zona horaria local.
- **Mejores terceros** del Mundial 2026: ranking de los 12 terceros con criterios FIFA (puntos, DG, GF, fair play y ranking FIFA de respaldo).
- **Cuenta regresiva** al Mundial 2026.
- **Datos del último título** del campeón (resumen de la final y trivia).
- **Mi selección**: elegí tu país y mirá cuánto hace que no gana (o si es el campeón actual), con plantel del torneo actual cuando está disponible.
- **Hitos de sequía** cuando un campeón se acerca a marcas redondas.
- **Ranking** de campeones con barra de sequía relativa; orden por antigüedad del título o por estrellas.
- **Línea de tiempo** de todos los Mundiales.
- **Campeones en números**: tarjetas editoriales sobre sequías y récords entre campeones mundiales.
- **Fixture completo** del torneo actual, agrupado por fase en grilla responsiva, con tabla de posiciones por grupo durante el torneo.
- **Compartir** enlace personalizado, vista **embebida** (`?embed=1&pais=…`) y **Open Graph** dinámico.
- **Español / inglés** (selector en el footer).

Si la API no responde, la interfaz sigue funcionando con datos locales y muestra un aviso discreto.

## Datos con Zafronix

La app no llama a Zafronix desde el navegador. Usa **API Routes** en Vercel como proxy hacia la [Zafronix World Cup API](https://api.zafronix.com/docs), con cache en el edge y revalidación condicional (ETags) para cuidar la cuota.

| Endpoint | Descripción |
|----------|-------------|
| `/api/world-champions` | Campeones y fecha de su último título |
| `/api/champion-facts` | Resumen y trivia del último mundial |
| `/api/champion-aggregates` | Títulos por selección |
| `/api/tournaments-history` | Historia de torneos |
| `/api/world-cup-2026` | Metadatos del Mundial 2026 |
| `/api/live-matches` | Últimos resultados y partidos de hoy del torneo actual (`?tz=` opcional para la zona horaria del usuario) |
| `/api/world-cup-fixture` | Fixture completo del torneo actual, tablas de posiciones por grupo y datos para mejores terceros |
| `/api/team-roster` | Plantel de una selección en el torneo actual |
| `/api/og` | Imagen Open Graph |
| `/api/oembed` | oEmbed para embeber |

Los partidos en curso se listan arriba con el texto **"En desarrollo"** (sin marcador), porque el plan Hobby de Zafronix no publica scores en tiempo real. Al finalizar, el resultado aparece en el próximo refresh (~5 min). Los partidos programados del día sí están disponibles en Hobby vía `GET /matches?year=YYYY`; solo los endpoints `/matches/live` y `/matches/stream` requieren Pro+.

### Variables de entorno

Configurá `ZAFRONIX_API_KEY` en:

- **Vercel:** Project Settings → Environment Variables
- **Desarrollo local:** copiá `.env.example` a `.env.local` y completá tu key

No commitees la API key al repositorio.

### Desarrollo local

```bash
yarn install
yarn start          # solo frontend (fallback local si no hay /api)
npx vercel dev      # frontend + API Routes (flujo completo)
yarn test --watchAll=false
yarn build
```

- `yarn start` levanta Create React App en el puerto 3000. Sin `vercel dev`, los endpoints `/api/*` no están disponibles y verás datos de fallback.
- `npx vercel dev` es la forma recomendada de probar live, fixture y el resto de extras con tu key.

## Embeber en otro sitio

Vista compacta:

```html
<iframe
  src="https://cuanto-tiempo-campeon.vercel.app/?embed=1&pais=argentina"
  width="420"
  height="280"
  title="¿Cuánto tiempo campeón?"
  loading="lazy"
></iframe>
```

oEmbed: `GET /api/oembed?url=…`

## Deploy en Vercel

1. Conectá el repositorio a Vercel.
2. Agregá `ZAFRONIX_API_KEY` como variable de entorno del proyecto.
3. Usá Node.js **24.x** (declarado en `package.json` y `.nvmrc`).
4. Deployá con `yarn build`.

Cuando haya un nuevo campeón mundial, el sitio se actualiza al vencer el cache de los endpoints (sin redeploy). Durante el Mundial en curso, los últimos resultados se refrescan cada ~5 minutos; el fixture y los datos históricos usan ventanas de cache más largas.

## Stack

- React 18 (Create React App)
- API Routes serverless en Vercel
- CSS Modules + design tokens glass (`src/styles/tokens.css`)
- Datos: [Zafronix World Cup API](https://api.zafronix.com/docs)
