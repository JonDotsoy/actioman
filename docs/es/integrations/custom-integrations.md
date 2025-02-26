## Integraciones de Actioman

Las integraciones de Actioman permiten extender la funcionalidad principal de actioman, añadiendo características adicionales a tu servicio de forma modular y sencilla. Puedes pensar en las integraciones como plugins que se conectan a Actioman para proporcionarle nuevas capacidades, como métricas, logs, autenticación avanzada, y más.

### Utilizando Integraciones

Para utilizar una integración en tu servicio Actioman, debes configurarla en el archivo `actioman.config.js`. Este archivo es el punto central de configuración de Actioman, y desde ahí puedes habilitar y personalizar las integraciones que necesites.

Si aún no tienes un archivo `actioman.config.js` en la raíz de tu proyecto, créalo. Para más detalles sobre la configuración general de Actioman, consulta la documentación de [actioman.config.js](./actioman.config.js.md).

#### Ejemplo: Integración de Métricas Prometheus

El siguiente ejemplo muestra cómo agregar la integración de `metrics` para exponer métricas del servicio en formato Prometheus Text. Esto te permite monitorizar tu servicio Actioman utilizando herramientas como Prometheus y Grafana.

```js
// actioman.config.js
import { metrics } from "actioman/integrations/metrics";

export default {
  integrations: [
    metrics(), // Declara la integración de métricas
  ],
};
```

En este ejemplo:

1. Importamos la función `metrics` desde el módulo `actioman/integrations/metrics`. Esta función es la que crea y configura la integración de métricas.
2. Dentro del objeto de configuración `export default`, definimos un array `integrations`.
3. Agregamos `metrics()` al array `integrations`. Esto indica a Actioman que queremos habilitar la integración de métricas con su configuración por defecto.

Al ejecutar Actioman con esta configuración, la integración de `metrics` se activará y expondrá un endpoint `/metrics` donde Prometheus podrá recolectar las métricas de tu servicio.

### Estructura de una Integración

Una integración de Actioman debe seguir una estructura específica para que Actioman pueda reconocerla y utilizarla correctamente. Una integración es un objeto Javascript que debe cumplir con la interfaz `Integration`:

```typescript
interface Integration {
  name: string; // Nombre único de la integración (obligatorio)
  hooks?: {
    "http:setup"?: (httpRouter: HTTPRouter) => void;
    "http:middleware"?: (fetch) => (request: Request) => Response;
  };
}
```

**Propiedades de `Integration`:**

- **`name` (string, obligatorio):** Un nombre descriptivo para la integración. Es **obligatorio** proporcionar un nombre para facilitar la identificación y gestión de las integraciones.

  Es importante que cada integración tenga un `name` definido porque:

  - **Identificación:** Permite identificar de forma única cada integración que se está utilizando en la configuración de `actioman`. Aunque actualmente Actioman no utiliza directamente el `name` para una funcionalidad específica, en el futuro podría usarse para gestión, logs o configuraciones más avanzadas de las integraciones.
  - **Claridad y Mantenibilidad:** Al ser un campo obligatorio, asegura que cada integración tenga un nombre descriptivo, lo que mejora la legibilidad y mantenibilidad del archivo `actioman.config.js`. Ayuda a entender rápidamente qué integraciones están activas en el servicio.
  - **Consistencia:** Mantener el `name` como obligatorio asegura una estructura consistente para todas las integraciones, facilitando el desarrollo y la comprensión de nuevas integraciones en el futuro.

- **`hooks` (objeto, opcional):** Un objeto que contiene funciones hook. Los hooks son funciones que Actioman invoca en puntos estratégicos de su ciclo de vida. Las integraciones pueden definir hooks para extender o modificar el comportamiento de Actioman.

**Hooks disponibles:**

Actualmente, Actioman ofrece los siguientes hooks para las integraciones:

- **`"http:setup"`:**

  - **Momento de invocación:** Este hook se invoca justo después de que Actioman instancia el `HTTPRouter`, que es el componente encargado de manejar las rutas HTTP del servicio.
  - **Parámetros:** Recibe como argumento `httpRouter`, que es la instancia del `HTTPRouter` de Actioman.
  - **Utilidad:** Este hook es útil cuando deseas **agregar rutas personalizadas** a tu servicio Actioman. Por ejemplo, la integración de `metrics` utiliza este hook para agregar la ruta `/metrics`. Puedes utilizar `httpRouter.get()`, `httpRouter.post()`, etc., dentro de este hook para definir nuevas rutas y sus manejadores.

- **`"http:middleware"`:**
  - **Momento de invocación:** Este hook se invoca para crear un middleware HTTP. El middleware se ejecuta **antes de que se procese la petición a cualquier función de acción** y **después de que la función de acción haya retornado una respuesta**.
  - **Parámetros:** Recibe como argumento una función `fetch` que representa la cadena de middlewares subsiguiente.
  - **Utilidad:** Este hook es útil para **interceptar y modificar las peticiones y respuestas HTTP** del servicio. Puedes utilizarlo para:
    - **Añadir headers a las respuestas:** Como headers de seguridad (CORS, Content-Security-Policy, etc.) o headers personalizados.
    - **Implementar autenticación y autorización:** Verificar tokens de autenticación o permisos del usuario antes de permitir el acceso a las funciones.
    - **Logging y tracing de peticiones:** Registrar información sobre las peticiones entrantes y salientes para propósitos de depuración y monitorización.
    - **Modificar la request o la response:** Aunque esto debe hacerse con precaución, en algunos casos puede ser útil para transformar datos antes de que lleguen a la función de acción o después de que se genere la respuesta.

Las integraciones son una forma poderosa de personalizar y extender Actioman para adaptarlo a las necesidades específicas de tu proyecto. Mantente atento a la documentación para descubrir nuevas integraciones y aprender a crear tus propias integraciones personalizadas.
