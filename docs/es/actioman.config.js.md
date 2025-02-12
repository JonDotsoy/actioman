# actioman.config.js

El archivo `actioman.config.js` es el punto central de configuración para proyectos "actioman". Permite personalizar el comportamiento de tu proyecto, desde la adición de integraciones para extender funcionalidades, hasta la configuración detallada de puertos y hosts para el listener. Además, este archivo te permite definir aspectos críticos como la gestión de certificados de seguridad, el nivel de detalle de los logs del sistema, y muchas otras configuraciones esenciales para el óptimo funcionamiento de tu aplicación.

## Integraciones

Las integraciones representan una forma poderosa de extender y modificar el comportamiento predeterminado de actioman. A través de ellas, puedes inyectar funcionalidades personalizadas en el flujo de trabajo de actioman. Un caso de uso común es la adición de middleware a las peticiones que llegan a tus servicios. Estos middlewares te permiten interceptar y procesar las solicitudes antes de que sean gestionadas por las acciones de tu aplicación, abriendo un abanico de posibilidades para implementar lógica personalizada.

### Auth integracion

La integración de autenticación (`Auth integracion`) provee un mecanismo robusto para asegurar tus acciones, permitiendo la validación de peticiones antes de que se ejecute la lógica principal de la acción. Esta funcionalidad es particularmente útil para implementar estrategias de seguridad basadas en tokens, como JWT (JSON Web Tokens).

El siguiente ejemplo muestra cómo configurar la integración `auth` para validar tokens JWT utilizando el algoritmo HS256 y una clave secreta:

```ts
export default {
  integrations: [
    auth({
      providers: [
        {
          type: "jwt",
          algorithm: "HS256",
          secret: "secret",
        },
      ],
    }),
  ],
};
```

## Configuración del Servidor

La sección `server` dentro de `actioman.config.js` te brinda un objeto dedicado a la configuración del servidor que aloja tu aplicación. A través de este objeto, puedes personalizar aspectos fundamentales del servidor, como el puerto de escucha (`port`) para las peticiones entrantes, el nombre de host (`hostname` o `host`) que el servidor utilizará, y la definición de encabezados HTTP personalizados (`headers`). Adicionalmente, puedes configurar **SSL** para habilitar conexiones HTTPS seguras. Esta capacidad de configuración te permite adaptar el servidor a las necesidades específicas de tu entorno de despliegue y requerimientos de seguridad.

Dentro de la configuración `ssl`, puedes especificar las rutas o el contenido de tu llave privada (`key`) y certificado (`cert`) SSL.

El siguiente ejemplo ilustra cómo configurar el puerto, hostname, encabezados personalizados y SSL del servidor:

```ts
export default {
  server: {
    port: 5000,
    host: "0.0.0.0",
    headers: {
      "X-Created-By": "me",
    },
    ssl: {
      key: "-----BEGIN PRIVATE KEY-----...",
      cert: "-----BEGIN CERTIFICATE-----...",
    },
  },
};
```
