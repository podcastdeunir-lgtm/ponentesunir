# Capa de datos de Foros UNIR

La fuente canónica de esta entrega es `foros_unir_buscador.json`. Su alcance es el archivo público visible de UNIR consultado el 13 de octubre de 2026; no equivale a todos los eventos históricos.

## Modelo y trazabilidad

`foros_unir_fuentes`, `identidades_foros_unir` y `participaciones_foros_unir` preservan los IDs publicados. Las etiquetas y sus evidencias son propuestas editoriales separadas de las especialidades publicadas. Las relaciones temáticas permiten descubrir candidatos, pero no acreditan conocimientos. Los cargos y biografías se tratan como históricos, con la fecha del foro como referencia.

La clave de una participación es `foro_id + identidad_id + nombre_publicado`: evita duplicar una persona programada más de una vez en un mismo foro y conserva cómo apareció su nombre. Los rankings deben contar identidades distintas por foro, nunca líneas de programa. La única facultad no declarada queda vacía. Las dos parejas de alias posibles siguen separadas.

## Generar artefactos e importar

```sh
node scripts/build-foros-data.mjs /ruta/foros_unir_buscador.json
```

Esto produce `data/foros-unir/normalized-archive.json`, `manifest.json`, `evaluation-queries.json` y CSV. El archivo normalizado conserva por separado foros, identidades, participaciones, áreas, etiquetas, evidencias, alias y campos ausentes. El manifiesto guarda SHA-256, claves de importación, recuentos y anomalías. `scripts/import-foros-unir.ts` implementa los *upserts* por esas claves para un cliente de servidor de Supabase y no fusiona aliases pendientes. Debe invocarse desde un job de confianza con clave de servicio (no desde el navegador); el job debe envolver la operación en una transacción o usar una RPC de importación si se necesita atomicidad total.

Ejecuta primero la migración `20261013140000_foros_unir_search.sql` en el proyecto Supabase indicado en el README. La migración contiene el esquema y RLS; no inserta los datos porque el fichero de origen no debe exponerse desde el cliente.

## Búsqueda local

`lib/foros-search.ts` normaliza mayúsculas, tildes y puntuación, y aplica un pequeño diccionario de sinónimos. Puntúa primero especialidades explícitamente publicadas y después la participación contextual. La ruta `GET /api/foros/search?q=...` requiere `FOROS_UNIR_DATA_PATH` (una ruta absoluta al JSON fuente) y entrega siempre URL, fragmento, tipo de evidencia y limitaciones.

La búsqueda semántica queda deliberadamente fuera de esta primera versión: necesitaría un índice/vectorial y credenciales. Puede añadirse como una segunda señal, nunca sustituyendo la evidencia exacta mostrada al usuario.

## Evaluación

Los 44 registros de taxonomía se convierten en intenciones de prueba, más seis casos de borde. `expected_candidates` mantiene IDs reales, URL y fragmentos, pero diferencia `directly_supported_if_specialty_is_relevant` de `related_requires_review`. No obliga a un orden donde las fuentes no lo justifican.

Para auditar el archivo original antes de una actualización:

```sh
node scripts/verify-foros-data.mjs /ruta/foros_unir_buscador.json
```
