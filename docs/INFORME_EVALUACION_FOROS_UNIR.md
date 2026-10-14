# Informe de evaluación — Foros UNIR

## Fuente y alcance

Evaluación realizada sobre el JSON recibido, generado a partir del archivo público visible el 13 de octubre de 2026. Se verificaron 127 foros (16/01/2025–08/10/2026), 364 identidades, 417 participaciones, 16 áreas y 44 etiquetas/intenciones. Los números proceden de los arrays del fichero y coinciden con sus estadísticas declaradas.

## Resultados automáticos

| Control | Resultado |
| --- | --- |
| IDs de foros y participantes referenciados | Correctos |
| Participaciones duplicadas por clave de importación | 0 |
| Recuentos de foros, identidades y participaciones | Correctos |
| Intenciones de evaluación generadas | 44 |
| Casos de borde adicionales | 6 |
| Compilación de la aplicación | Correcta |

La prueba se ejecuta con `node scripts/verify-foros-data.mjs <archivo>`. La evaluación de recuperación debe ejecutarse tras importar en el entorno elegido: las respuestas esperadas viven en `data/foros-unir/evaluation-queries.json` y se evalúan por conjunto de IDs, no por una posición rígida.

## Límites y fallos conocidos

- Una ficha (`foro_c858bd49d24b`) no declara facultad; se conserva ausente.
- `Andrea Robles`/`Andrea Robles González` y `Mari Paz Santos`/`Mari Paz Santos Zúñiga` siguen siendo posibles alias no fusionados.
- Algunas etiquetas se generan por coincidencia léxica a nivel de foro. Por tanto, un participante recuperado por ellas se marca como relación temática y necesita revisión; no se presenta como especialista.
- El rol de una participación se conserva cuando la fuente lo publica. Cuando no puede distinguirse, el buscador no debe convertir a la persona en especialista ni moderador.
- No se ejecutó una consulta HTTP de extremo a extremo en este entorno, ya que el sandbox no permite abrir el puerto local. La ruta y sus tipos sí se compilaron en `npm run build`.
