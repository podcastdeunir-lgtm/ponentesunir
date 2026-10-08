# UNIR · Ponentes (V1)

Directorio interno de ponentes, expertos y candidatos. La interfaz contiene únicamente datos DEMO identificables y está preparada para sustituirlos por Supabase.

> **Proyecto Supabase asignado:** usar exclusivamente **podcastdeunir-lgtm's Project** (ref. `klztvxbsdigqshknpoea`). No usar el proyecto de Vocolia ni ninguna otra instancia para esta aplicación.

## Arranque

1. Copia `.env.example` a `.env.local` y configura la URL, la clave pública y la clave de servidor de Supabase. La clave de servidor no se expone al navegador.
2. Ejecuta la migración `supabase/migrations/001_initial_schema.sql` en el SQL Editor de Supabase.
3. Ejecuta después `supabase/migrations/20261005132200_feedback_transcripts_audit.sql` para activar valoraciones por editor, transcripciones y auditoría.
4. `npm install && npm run dev`

La migración activa RLS: los datos solo pueden consultarse con una sesión autenticada. La ruta técnica `/api/supabase/status` verifica que el servidor puede conectarse sin devolver información del directorio. Antes de producción, añade las políticas de Storage para el bucket privado `speaker-photos` y conecta la autenticación corporativa a los repositorios protegidos.

La segunda migración no carga transcripciones automáticamente: conserva solo transcripciones públicas o autorizadas. Cada valoración queda asociada al usuario autenticado y el registro de auditoría guarda altas, cambios y bajas de perfiles, foros, participaciones, Radar, transcripciones y valoraciones.

## Importación CSV

`scripts/import-speakers.ts` define el mapeo inicial y las reglas básicas de normalización. El importador definitivo debe ejecutarse en un entorno servidor, comprobar coincidencias por nombre completo, email y LinkedIn, y pedir revisión humana ante cualquier coincidencia.
