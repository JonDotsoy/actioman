# actioman.config.js

El archivo `actioman.config.js` es el punto central de configuración para proyectos "actioman". Permite personalizar el comportamiento de tu proyecto, desde la adición de integraciones para extender funcionalidades, hasta la configuración detallada del servidor, incluyendo puertos, host, seguridad SSL, y encabezados. Este archivo te permite ajustar aspectos críticos como la gestión de certificados de seguridad, el nivel de detalle de los logs del sistema (aunque esto no se detalla explícitamente en este documento, se podría asumir que es configurable a través de este archivo o similar), y otras configuraciones esenciales para el óptimo funcionamiento de tu aplicación.

## Integraciones

Las integraciones representan una forma poderosa de extender y modificar el comportamiento predeterminado de actioman. A través de ellas, puedes inyectar funcionalidades personalizadas en el flujo de trabajo de actioman. Un caso de uso común es la adición de middleware a las peticiones que llegan a tus servicios. Estos middlewares te permiten interceptar y procesar las solicitudes antes de que sean gestionadas por las acciones de tu aplicación, abriendo un abanico de posibilidades para implementar lógica personalizada como autenticación, autorización, logging, y más.

**Ejemplo de Integraciones**

Este ejemplo muestra cómo configurar una integración de autenticación básica en `actioman.config.js`. Asume que tienes una integración llamada `auth` disponible.

```ts
// actioman.config.js
export default {
  integrations: [
    auth({
      // ... opciones de configuración específicas para la integración auth ...
    }),
    // ... puedes agregar más integraciones aquí ...
  ],
  server: {
    port: 5000,
    host: "0.0.0.0",
    // ... otras configuraciones del servidor ...
  },
};
```

En este ejemplo:

- Importamos una integración `auth` desde un paquete (esto es un ejemplo, el nombre del paquete y la forma de importación dependerá de la integración específica).
- Dentro del array `integrations`, instanciamos la integración `auth` llamando a la función importada `auth()` y pasando un objeto de configuración. Las opciones dentro de este objeto (`// ... opciones de configuración específicas para la integración auth ...`) dependerán de la integración `auth` en particular. Consulta la documentación de la integración `auth` para conocer sus opciones de configuración.
- Se pueden agregar múltiples integraciones dentro del array `integrations`. Se ejecutarán en el orden en que se definen en el array.

## Configuración del Servidor

La sección `server` dentro de `actioman.config.js` te brinda un objeto dedicado a la configuración del servidor que aloja tu aplicación. A través de este objeto, puedes personalizar aspectos fundamentales del servidor.

**Opciones de configuración para `server`:**

- **`port`**: Define el puerto en el que el servidor HTTP(S) escuchará las peticiones entrantes.

  - **Tipo:** `number`
  - **Valores permitidos:** Un número entero válido que represente un puerto TCP (generalmente entre 1 y 65535, evitando puertos reservados y puertos ya en uso por otros servicios). Puertos comunes para desarrollo son `3000`, `3001`, `5000`, `8080`, etc. El puerto por defecto, si no se especifica, podría ser un puerto dinámico asignado por el sistema operativo o un valor predeterminado de actioman (revisar la documentación principal para el valor por defecto).
  - **Ejemplo:** `port: 5000`

- **`host` o `hostname`**: Define el nombre de host o la dirección IP en la que el servidor escuchará.

  - **Tipo:** `string`
  - **Valores permitidos:**
    - `"localhost"` o `"127.0.0.1"`: Escucha solo en la interfaz de loopback local. Solo accesible desde la misma máquina.
    - `"0.0.0.0"`: Escucha en todas las interfaces de red disponibles (IPv4). Permite acceso desde la red.
    - Dirección IP específica (ej., `"192.168.1.100"`): Escucha solo en esa interfaz de red específica.
    - Nombre de dominio (ej., `"mi-dominio.com"`): En algunos entornos, puede ser necesario configurar el servidor para que escuche en un nombre de dominio específico. La resolución de nombres a la dirección IP debe estar configurada externamente (DNS).
    - **Nota:** `"host"` y `"hostname"` parecen ser alias, y se puede usar cualquiera de los dos. `"host"` es más común y se utiliza en el ejemplo.
  - **Ejemplos:**
    - `host: "0.0.0.0"` (para acceso desde la red)
    - `hostname: "localhost"` (solo acceso local)

- **`headers`**: Permite definir encabezados HTTP personalizados que se incluirán en _todas_ las respuestas del servidor.

  - **Tipo:** `object`
  - **Valores permitidos:** Un objeto donde cada clave es el nombre del encabezado (string) y el valor es el valor del encabezado (string).
  - **Casos de uso:** Añadir encabezados de seguridad (ej., `X-Frame-Options`, `X-Content-Type-Options`), encabezados personalizados para identificar el servidor, o encabezados relacionados con CORS (aunque para CORS, middleware específico suele ser más adecuado).
  - **Ejemplo:**
    ```ts
    headers: {
      "X-Created-By": "Actioman Config",
      "X-Powered-By": "Custom Server",
    }
    ```

- **`ssl`**: Configura el soporte para HTTPS (conexiones seguras) utilizando SSL/TLS.

  - **Tipo:** `object` o `undefined` (si se omite, se usa HTTP sin SSL).
  - **Opciones dentro de `ssl`:**

    - **`key`**: **Requerido para habilitar SSL.** Define la clave privada SSL.
      - **Tipo:** `string`
      - **Valores permitidos:**
        - El contenido de la clave privada en formato PEM como una cadena de texto.
        - **Posiblemente (necesita confirmación en la documentación principal de actioman):** La ruta a un archivo que contiene la clave privada en formato PEM.
      - **Ejemplo (contenido PEM directamente):** `key: "-----BEGIN PRIVATE KEY-----...\\n...-----END PRIVATE KEY-----\\n"`
    - **`cert`**: **Requerido para habilitar SSL.** Define el certificado SSL.
      - **Tipo:** `string`
      - **Valores permitidos:**
        - El contenido del certificado en formato PEM como una cadena de texto.
        - **Posiblemente (necesita confirmación en la documentación principal de actioman):** La ruta a un archivo que contiene el certificado en formato PEM.
      - **Ejemplo (contenido PEM directamente):** `cert: "-----BEGIN CERTIFICATE-----...\\n...-----END CERTIFICATE-----\\n"`

  - **Ejemplo de configuración SSL (con `key` y `cert`):**

    ```ts
    ssl: {
      key: "-----BEGIN PRIVATE KEY-----...",
      cert: "-----BEGIN CERTIFICATE-----...",
    }
    ```

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

**Resumen de opciones de configuración en `actioman.config.js`:**

| Sección        | Opción          | Tipo     | Descripción                                                      | Requerido   | Valores/Ejemplos                                                                   |
| -------------- | --------------- | -------- | ---------------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------- |
| `integrations` | `[Integration]` | `array`  | Lista de integraciones a aplicar.                                | Opcional    | `[auth({...})]`                                                                    |
| `server`       | `port`          | `number` | Puerto de escucha del servidor.                                  | Opcional    | `3000`, `5000`, etc.                                                               |
| `server`       | `host`          | `string` | Hostname o IP para escuchar (todas las interfaces: `"0.0.0.0"`). | Opcional    | `"localhost"`, `"0.0.0.0"`, `"192.168.1.100"`                                      |
| `server`       | `hostname`      | `string` | Alias de `host`. Nombre de host para escuchar.                   | Opcional    | `"localhost"`                                                                      |
| `server`       | `headers`       | `object` | Encabezados HTTP personalizados para todas las respuestas.       | Opcional    | `{ "X-Created-By": "Actioman" }`                                                   |
| `server`       | `ssl`           | `object` | Configuración SSL para HTTPS.                                    | Opcional    | Ver opciones dentro de `ssl`                                                       |
| `server.ssl`   | `key`           | `string` | Clave privada SSL (contenido PEM).                               | Condicional | `-----BEGIN PRIVATE KEY-----...-----END PRIVATE KEY-----` (si `ssl` está definido) |
| `server.ssl`   | `cert`          | `string` | Certificado SSL (contenido PEM).                                 | Condicional | `-----BEGIN CERTIFICATE-----...-----END CERTIFICATE-----` (si `ssl` está definido) |
