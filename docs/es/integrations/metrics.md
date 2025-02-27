## Integración de Métricas con Prometheus

Actioman facilita la monitorización de tus servicios exponiendo métricas en formato Prometheus, un estándar en la industria para la recolección y análisis de métricas. Esta integración te permite obtener información valiosa sobre el rendimiento y uso de tus acciones, integrándose fácilmente con Prometheus o cualquier sistema de monitorización compatible con el formato `prometheustext`.

**Esta integración se basa en la librería [prom-client](https://www.npmjs.com/package/prom-client) de Node.js**, una librería ampliamente utilizada para instrumentar aplicaciones con métricas de Prometheus. Actioman utiliza `prom-client` internamente para generar las métricas predefinidas y también te permite crear métricas personalizadas para adaptarlas a las necesidades específicas de tu aplicación.

### Habilitando la Integración de Métricas

Para activar la integración de métricas de Prometheus en tu proyecto Actioman, debes modificar el archivo de configuración `actioman.config.js`. Si no tienes este archivo, créalo en la raíz de tu proyecto. Luego, importa la integración `metrics` desde el módulo `actioman/integrations/metrics` y agrégala al array `integrations` dentro de la configuración.

```js
// actioman.config.js
import { metrics } from "actioman/integrations/metrics";

export default {
  integrations: [metrics()],
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

Este comando realizará una petición GET al endpoint `/metrics` y mostrará las métricas en formato `prometheustext` en tu terminal. La salida será similar a la siguiente, mostrando métricas de las peticiones a tus acciones (en este ejemplo, para una acción llamada `hi`):

```
# HELP action_requests_seconds The total number of request
# TYPE action_requests_seconds summary
action_requests_seconds{quantile="0.01",action="hi",success="1"} 0.00146375
action_requests_seconds{quantile="0.05",action="hi",success="1"} 0.00146375
action_requests_seconds{quantile="0.5",action="hi",success="1"} 0.00146375
action_requests_seconds{quantile="0.9",action="hi",success="1"} 0.00146375
action_requests_seconds{quantile="0.95",action="hi",success="1"} 0.00146375
action_requests_seconds{quantile="0.99",action="hi",success="1"} 0.00146375
action_requests_seconds{quantile="0.999",action="hi",success="1"} 0.00146375
action_requests_seconds_sum{action="hi",success="1"} 0.00146375
action_requests_seconds_count{action="hi",success="1"} 1
```

**Métricas Exponiendo:**

La integración de métricas de Actioman expone las siguientes métricas por defecto para cada acción definida en tu proyecto:

- **`action_requests_seconds` (Summary):** Mide la duración de las peticiones a las acciones en segundos. Se presenta como un Summary de Prometheus, proporcionando percentiles (quantile) de la duración, la suma total (`_sum`) y el conteo total (`_count`) de las mediciones.
  - **Labels:**
    - `action`: Nombre de la acción invocada.
    - `success`: Indica si la petición fue exitosa (`1`) o fallida (`0`).

En este formato, la duración de las peticiones se agrega a un Summary, que es útil para entender la distribución de las latencias. En lugar de un histograma, el Summary calcula percentiles directamente, lo que puede ser más eficiente en algunos casos para monitorear la experiencia del usuario.

### Métricas Personalizadas

Dado que Actioman utiliza `prom-client`, puedes extender la monitorización de tus servicios creando métricas personalizadas. Esto te permite recolectar información específica de tu dominio de negocio y enriquecer la telemetría de tus acciones.

Para crear métricas personalizadas, puedes importar `prom-client` directamente en tu código y definir las métricas que necesites. A continuación, se muestra un ejemplo de cómo crear un contador personalizado para registrar el número de ventas:

```javascript
// actions.js
import promClient from "prom-client";

const salesCounter = new promClient.Counter({
  name: "sales_counter",
  help: "El número total de ventas",
});

export const processSale = () => {
  // ... lógica para procesar la venta ...
  salesCounter.inc(); // Incrementa el contador de ventas
  return { success: true };
};

export const getDashboardData = () => {
  // ...
  return { sales: salesCounter.value() }; // Ejemplo de como usar la metrica
};

export const hello = () => "hello world";
```

En este ejemplo:

1. **`import promClient from "prom-client";`**: Importamos la librería `prom-client`.
2. **`const salesCounter = new promClient.Counter(...)`**: Creamos un nuevo contador llamado `sales_counter` utilizando `promClient.Counter`. Definimos un nombre (`name`) y una descripción (`help`) para la métrica.
3. **`salesCounter.inc();`**: En la función `processSale`, incrementamos el contador `salesCounter` cada vez que se procesa una venta.
4. **`salesCounter.value()`**: En la función `getDashboardData`, mostramos como se puede acceder al valor actual de la métrica.

Las métricas personalizadas que definas se registrarán automáticamente junto con las métricas predefinidas de Actioman y estarán disponibles en el endpoint `/metrics` en formato Prometheus.

**Registro de Métricas:**

Es importante tener en cuenta que `prom-client` utiliza un registro global por defecto. Esto significa que todas las métricas creadas con `prom-client` en tu proyecto Actioman se agregarán al mismo registro y se expondrán en el endpoint `/metrics`.

**Explora la Documentación de `prom-client`:**

Para obtener más información sobre cómo crear diferentes tipos de métricas (como gauges, histograms, summaries) y configurar opciones avanzadas, te recomendamos consultar la [documentación oficial de `prom-client`](https://github.com/siimon/prom-client).

Con la integración de métricas de Actioman y la flexibilidad de `prom-client`, puedes obtener una visión completa y personalizada del rendimiento y comportamiento de tus servicios.
