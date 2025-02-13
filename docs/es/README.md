# 🏹 actioman

Comparte funciones con otros clientes JS. Llama a funciones del backend con type-safety.

Actioman es una herramienta para exponer funciones de Javascript como servicios web de manera sencilla y rápida. Con actioman, puedes construir APIs robustas y con tipado seguro utilizando tus funciones Javascript existentes, facilitando la comunicación entre tu backend y clientes Javascript (ya sean navegadores, aplicaciones móviles, o incluso otros servicios backend).

## Características

- **Simple de desplegar servicio:** Con actioman, levantar un servicio es tan fácil como ejecutar un comando, sin configuraciones complejas ni despliegues laboriosos.
- **Despliegue flexible:** Se puede desplegar sobre HTTP, HTTPS y HTTP2 (con o sin SSL), adaptándose a tus necesidades de seguridad y rendimiento.
- **Contratos claros con Zod:** Define contratos claros entre cliente y servidor utilizando Zod para describir la forma y el tipo de datos de entrada y salida de tus servicios. Esto garantiza la type-safety y facilita la validación de datos.
- **Exposición rápida de servicios:** Convierte tus funciones Javascript en endpoints accesibles a través de la red de forma instantánea. Ideal para prototipado rápido o para exponer funcionalidades de backend de manera ágil.
- **Instalación sencilla de servicios expuestos:** Los clientes pueden instalar y utilizar los servicios expuestos con una sola línea de comando, simplificando la integración y el consumo de tus APIs.
- **Fácil de proteger:** Implementa mecanismos de seguridad para proteger tus servicios de accesos no autorizados, garantizando la integridad y confidencialidad de tus datos.

## Setup

Para empezar a usar actioman, sigue estos sencillos pasos:

1. **Crea un archivo `actions.js`:**

   Crea un archivo llamado `actions.js` en tu proyecto. En este archivo, define las funciones Javascript que quieres exponer como servicios.

   ```js
   // ./actions.js
   export const hello = () => "hello world";
   ```

2. **Levanta el servidor actioman:**

   Abre tu terminal en la raíz de tu proyecto y ejecuta el siguiente comando para iniciar el servidor actioman, sirviendo las funciones definidas en `actions.js`:

   ```bash
   npx actioman actions.js
   ```

   Al ejecutar este comando, verás en la consola un mensaje similar a este:

   ```
   Route GET /__actions
   Route POST /__actions/hello
   Listening on http://localhost:30320/
   ```

   Este mensaje indica:

   - `Route GET /__actions`: Se ha creado una ruta GET en `/__actions`. Esta ruta expone los contratos de todos los servicios definidos en `actions.js` en formato JSON. Puedes usarla para inspeccionar la estructura de tus servicios.
   - `Route POST /__actions/hello`: Se ha creado una ruta POST en `/__actions/hello`. Esta ruta corresponde a la función `hello` que definiste en `actions.js`. Para invocar este servicio, deberás hacer una petición POST a esta URL.
   - `Listening on http://localhost:30320/`: El servidor actioman está corriendo y escuchando peticiones en la URL `http://localhost:30320/`. El puerto `30320` puede variar.

## Agregando servicios Actioman a tu proyecto

Una vez que tu servicio actioman está en funcionamiento, puedes consumirlo desde otro proyecto Javascript. Sigue estos pasos para importar y usar tus servicios:

1. **Instala la dependencia `actioman`:**

   En tu proyecto cliente, instala la librería `actioman` usando npm:

   ```bash
   npm add actioman
   ```

2. **Agrega el servicio Actioman:**

   Utiliza el comando `actioman add` para registrar un servicio Actioman en tu proyecto cliente. Reemplaza `myservice` con el nombre que quieras darle a tu servicio localmente, y `http://localhost:30320/` con la URL donde está corriendo tu servidor actioman (la que se mostró en la consola al levantar el servidor).

   ```bash
   npx actioman add myservice http://localhost:30320/
   ```

   Este comando configura `actioman` para que pueda acceder a los servicios expuestos en la URL proporcionada bajo el nombre `myservice`.

3. **Utiliza los servicios en tu código:**

   Ahora puedes importar y usar tus servicios actioman en tu código Javascript. El siguiente ejemplo muestra cómo llamar a la función `hello` del servicio `myservice`:

   ```js
   // my-app.js
   import { actions } from "actioman";

   const myservice = actions.myservice();

   const message = await myservice.hello();
   console.log(message); // => "hello world"
   ```

   En este código:

   - `import { actions } from "actioman"`: Importa el objeto `actions` desde la librería `actioman`.
   - `const myservice = actions.myservice()`: Crea una instancia del servicio `myservice` que configuraste previamente. `actions.myservice()` genera un cliente type-safe para interactuar con tu servicio remoto.
   - `await myservice.hello()`: Llama a la función `hello` del servicio `myservice`. Esta llamada se traduce en una petición HTTP al servidor actioman. Como las llamadas a servicios son asíncronas, usamos `await` para esperar la respuesta.
