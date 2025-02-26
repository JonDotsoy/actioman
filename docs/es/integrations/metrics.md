## Integración de Métricas con Prometheus

Actioman facilita la monitorización de tus servicios exponiendo métricas en formato Prometheus, un estándar en la industria para la recolección y análisis de métricas. Esta integración te permite obtener información valiosa sobre el rendimiento y uso de tus acciones, integrándose fácilmente con Prometheus o cualquier sistema de monitorización compatible con el formato `prometheustext`.

### Habilitando la Integración de Métricas

Para activar la integración de métricas de Prometheus en tu proyecto Actioman, debes modificar el archivo de configuración `actioman.config.js`. Si no tienes este archivo, créalo en la raíz de tu proyecto. Luego, importa la integración `metrics` desde el módulo `actioman/integrations/metrics` y agrégala al array `integrations` dentro de la configuración.

```js
// actioman.config.js
import { metrics } from "actioman/integrations/metrics";

export default {
  integrations: [
    metrics(), // Declara la integración de métricas
  ],
};
```

Al iniciar el servidor Actioman con esta configuración, se registrará una nueva ruta `/metrics`.

```diff
+ Route ALL /metrics
  Route GET /__actions
  Route POST /__actions/f1
  Route POST /__actions/f2
  Listening on http://localhost:6565/
  Server running at http://localhost:6565/
```

La línea `Route ALL /metrics` indica que la integración de métricas se ha activado correctamente y está disponible en la ruta `/metrics`.

### Accediendo a las Métricas

Para consultar las métricas expuestas por Actioman, puedes usar herramientas como `curl` o configurar Prometheus para que scrapee el endpoint `/metrics` de tu servidor Actioman.

**Ejemplo usando `curl`:**

Abre tu terminal y ejecuta el siguiente comando, reemplazando `http://localhost:6565` con la URL de tu servidor Actioman si es diferente:

```shell
curl http://localhost:6565/metrics
```

Este comando realizará una petición GET al endpoint `/metrics` y mostrará las métricas en formato `prometheustext` en tu terminal. La salida será similar a la siguiente, mostrando contadores y duraciones de las peticiones a tus acciones (en este ejemplo, `f1` y `f2`):

```
request_error_counters{action="f1"} 5
request_counters{action="f1"} 143
request_data_transference_bytes{action="f1"} 341205
request_duration_seconds{action="f1"} 32
request_error_counters{action="f2"} 5
request_counters{action="f2"} 31
request_data_transference_bytes{action="f2"} 52341
request_duration_seconds{action="f2"} 16
```

**Métricas Exponiendo:**

La integración de métricas de Actioman expone las siguientes métricas para cada acción definida en tu proyecto:

- `request_counters`: Número total de peticiones realizadas a la acción.
- `request_error_counters`: Número total de peticiones que resultaron en error para la acción.
- `request_duration_seconds`: Histograma de la duración de las peticiones a la acción en segundos. Proporciona `_count`, `_sum` y `_max` para análisis estadístico.
- `request_data_transference_bytes`: Cantidad total de datos transferidos (en bytes) durante las peticiones a la acción.

Con esta integración, puedes obtener una visión detallada del rendimiento de tus servicios Actioman y monitorizar su comportamiento en tiempo real utilizando Prometheus o cualquier sistema de monitorización compatible.
