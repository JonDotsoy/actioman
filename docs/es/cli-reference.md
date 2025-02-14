# Comandos CLI

Este documento describe los comandos de la interfaz de línea de comandos (CLI) de `actioman`.

## `actioman serve`

El comando `actioman serve` se utiliza para levantar un servidor `actioman` que expone las funciones definidas en un archivo Javascript como servicios web. Por defecto, el servidor se inicia utilizando el protocolo HTTP.

**Uso:**

```bash
actioman serve <ruta_archivo_de_inicio> [flags]
```

`<ruta_archivo_de_inicio>`: Especifica la ruta al archivo Javascript que contiene las funciones que se expondrán como servicios. Este archivo suele ser `actions.js`.

**Flags:**

El comando `actioman serve` admite los siguientes flags opcionales para personalizar el comportamiento del servidor:

- `--http2`

  Habilita el protocolo HTTP/2 para el servidor. HTTP/2 ofrece mejoras de rendimiento en comparación con HTTP/1.1, como la multiplexación de peticiones y la compresión de encabezados, lo que puede optimizar la comunicación con el servicio.

  ```bash
  actioman serve actions.js --http2
  ```

  Por defecto, al usar `--http2`, el servicio se levanta en modo no seguro (sin SSL). Para configurar la seguridad (HTTPS/2) y utilizar certificados SSL, debes modificar el archivo de configuración `actioman.config.js`. Consulta la documentación detallada sobre la configuración de seguridad en [./actioman.config.js.md](./actioman.config.js.md).

- `--cwd <ruta_directorio>`

  Define el directorio de trabajo actual (current working directory) para el servicio. Esto es útil cuando ejecutas el comando `actioman serve` desde una ubicación que no es la raíz del proyecto donde se encuentra el archivo `<ruta_archivo_de_inicio>`.

  ```bash
  actioman serve actions.js --cwd /ruta/a/mi/proyecto
  ```

- `--port <numero_puerto>`

  Especifica el puerto en el que el servidor `actioman` escuchará las peticiones. Por defecto, `actioman` intenta utilizar el puerto `30320`. Si el puerto `30320` ya está en uso, `actioman` buscará automáticamente el siguiente puerto disponible incrementando el valor en uno hasta encontrar un puerto libre.

  ```bash
  actioman serve actions.js --port 8080
  ```

- `--host <hostname>`

  Define el hostname o la dirección IP en la que el servidor estará disponible. El valor por defecto es `localhost`, lo que significa que el servicio solo será accesible desde la misma máquina donde se está ejecutando.

  Para permitir el tráfico desde cualquier dirección de red (útil para acceder al servicio desde otras máquinas en la misma red o externamente), puedes usar `::` (para IPv6 y IPv4) o `0.0.0.0` (solo para IPv4).

  **Importante:** El uso de `::` o `0.0.0.0` para abrir el servicio a todas las redes solo se aplica al protocolo HTTP. Para HTTP/2, la configuración del hostname puede requerir ajustes adicionales, especialmente en entornos de producción y con configuraciones de seguridad SSL/TLS.

  ```bash
  # Permite el acceso desde cualquier dirección IPv4 (solo HTTP)
  actioman serve actions.js --host 0.0.0.0

  # Permite el acceso desde cualquier dirección IPv6 o IPv4 (solo HTTP)
  actioman serve actions.js --host ::
  ```

- `--help`

  Muestra un mensaje de ayuda en la consola que lista todos los comandos disponibles de `actioman` y los flags asociados a cada comando, incluyendo el comando `serve` y sus flags.

  ```bash
  actioman serve --help
  ```

**Ejemplo básico:**

Para levantar un servidor `actioman` utilizando el archivo `actions.js` en el puerto por defecto (o el primer puerto libre a partir de `30320`) y utilizando HTTP, simplemente ejecuta:

```bash
actioman serve actions.js
```

Este comando iniciará el servidor y mostrará en la consola las rutas generadas para acceder a tus servicios.

**Requerimiento:**

El comando `actioman serve` requiere que se especifique la `<ruta_archivo_de_inicio>` para indicar a `actioman` qué archivo Javascript debe analizar para exponer las funciones como servicios.
