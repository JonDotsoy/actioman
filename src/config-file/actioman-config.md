## Clase `ActiomanConfig`

La clase `ActiomanConfig` proporciona una interfaz para manipular el archivo de configuración `actioman.config.js`. Permite la lectura, modificación y serialización de la configuración.

### Métodos

- **`static fromFile(fileUrl: URL): Promise<ActiomanConfig>`**

  Parsea un archivo de configuración desde una URL.

  **Parámetros:**

  - `fileUrl`: URL del archivo `actioman.config.js`.

  **Ejemplo:**

  ```ts
  const configFile = await ActiomanConfig.fromFile(
    new URL("file:///path/project/actioman.config.js"),
  );
  ```

- **`toString(): string`**

  Serializa la configuración actual a una cadena de texto con formato JavaScript (ESM). Esta cadena puede ser escrita en un archivo utilizando el módulo `fs`.

  **Ejemplo:**

  ```ts
  await fs.writeFile(
    new URL("file:///path/project/actioman.config.js"),
    configFile.toString(),
  );
  ```

- **`setServerHost(host: string): void`**

  Actualiza el valor de la configuración `server.host`. Si la propiedad `server` no existe, la crea.

  **Parámetros:**

  - `host`: El nuevo valor para la configuración `server.host`.

  **Ejemplo:**

  ```ts
  configFile.toString();
  // export default { };

  configFile.setServerHost("my-host");

  configFile.toString();
  // export default {
  //   server: {
  //     host: "my-host"
  //   }
  // };
  ```

- **`setServerPort(port: number): void`**

  Actualiza el valor de la configuración `server.port`. Si la propiedad `server` no existe, la crea.

  **Parámetros:**

  - `port`: El nuevo valor para la configuración `server.port`.

  **Ejemplo:**

  ```ts
  configFile.toString();
  // export default { };

  configFile.setServerPort(3000);

  configFile.toString();
  // export default {
  //   server: {
  //     port: 3000
  //   }
  // };
  ```

- **`setServerSSLKey(key: string): void`**

  Actualiza el valor de la configuración `server.ssl.key`. Si las propiedades `server` o `ssl` no existen, las crea.

  **Parámetros:**

  - `key`: El nuevo valor para la configuración `server.ssl.key`.

  **Ejemplo:**

  ```ts
  configFile.toString();
  // export default { };

  configFile.setServerSSLKey("-----BEGIN PRIVATE KEY-----...");

  configFile.toString();
  // export default {
  //   server: {
  //     ssl: {
  //       key: "-----BEGIN PRIVATE KEY-----..."
  //     }
  //   }
  // };
  ```

- **`setServerSSLCert(cert: string): void`**

  Actualiza el valor de la configuración `server.ssl.cert`. Si las propiedades `server` o `ssl` no existen, las crea.

  **Parámetros:**

  - `cert`: El nuevo valor para la configuración `server.ssl.cert`.

  **Ejemplo:**

  ```ts
  configFile.toString();
  // export default { };

  configFile.setServerSSLCert("-----BEGIN CERTIFICATE-----...");

  configFile.toString();
  // export default {
  //   server: {
  //     ssl: {
  //       cert: "-----BEGIN CERTIFICATE-----..."
  //     }
  //   }
  // };
  ```
