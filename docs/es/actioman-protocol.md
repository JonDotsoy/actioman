## Protocolo Actioman

Actioman utiliza un protocolo HTTP simple para la comunicación entre clientes y servidores. Este protocolo se basa en dos endpoints principales: uno para el descubrimiento de servicios y la obtención de contratos, y otro para la ejecución de los servicios expuestos.

### Descubrimiento de Servicios y Contratos: `GET /__actions`

El endpoint `GET /__actions` es fundamental para que los clientes descubran los servicios disponibles y obtengan los contratos necesarios para interactuar con ellos de manera type-safe.

**Método:** `GET`

**Endpoint:** `/__actions`

**Respuesta:**

El servidor responde con un objeto JSON que contiene una lista de todos los servicios expuestos y sus respectivos contratos. La estructura general de la respuesta es la siguiente:

```json
{
  "actions": {
    "nombreDelServicio1": {
      "input": {
        // Contrato de entrada del servicio (JSON Schema o null si no requiere entrada)
      },
      "output": {
        // Contrato de salida del servicio (JSON Schema o null si no tiene salida específica)
      }
    },
    "nombreDelServicio2": {
      "input": {
        // Contrato de entrada del servicio 2
      },
      "output": {
        // Contrato de salida del servicio 2
      }
    }
    // ... más servicios ...
  }
}
```

**Ejemplo de respuesta:**

Supongamos que tienes un archivo `actions.js` con dos funciones expuestas: `hello` y `sumar`. La respuesta del endpoint `GET /__actions` podría ser:

```json
{
  "actions": {
    "hello": {
      "input": null,
      "output": {
        "type": "string"
      }
    },
    "sumar": {
      "input": {
        "type": "object",
        "properties": {
          "a": { "type": "number" },
          "b": { "type": "number" }
        },
        "required": ["a", "b"]
      },
      "output": {
        "type": "number"
      }
    }
  }
}
```

**Detalles de los Contratos:**

- **`input`**: Define la estructura esperada para los datos de entrada del servicio. Si el servicio no requiere entrada, este valor será `null`. El contrato se especifica utilizando [JSON Schema](https://json-schema.org/).
- **`output`**: Define la estructura de los datos de salida que el servicio retornará. Si el servicio no tiene una salida específica (por ejemplo, solo realiza una acción sin retornar valor), este valor podría ser `null` o un esquema que defina la salida, como en el ejemplo anterior donde `hello` retorna un string. También se utiliza [JSON Schema](https://json-schema.org/).

**Uso en el Cliente:**

Los clientes Actioman utilizan esta respuesta para:

1. **Descubrir los servicios disponibles:** Listar los nombres de los servicios dentro del objeto `"actions"`.
2. **Obtener los contratos:** Acceder a las propiedades `input` y `output` para cada servicio.
3. **Generar validadores y tipos:** Utilizar los contratos JSON Schema para generar código de validación y definiciones de tipo en el cliente. Se recomienda la librería [json-schema-to-zod](https://www.npmjs.com/package/json-schema-to-zod) para convertir JSON Schema a validadores Zod en proyectos Javascript, lo que facilita la type-safety y la validación de datos antes de enviar las peticiones al servidor y después de recibir las respuestas.

### Ejecución de Servicios: `POST /__actions/:name`

Una vez que el cliente ha descubierto los servicios y obtenido sus contratos, puede ejecutar un servicio específico realizando una petición `POST` al endpoint `/__actions/:name`, donde `:name` es el nombre del servicio que se desea invocar.

**Método:** `POST`

**Endpoint:** `/__actions/:name` (Ejemplo: `/__actions/hello`, `/__actions/sumar`)

**Cuerpo de la Petición (Request Body):**

El cuerpo de la petición debe contener los datos de entrada para el servicio, en formato JSON. La estructura de estos datos debe coincidir con el contrato `input` definido para el servicio en el endpoint `GET /__actions`.

**Ejemplo de Request Body para el servicio `sumar`:**

```json
{
  "a": 5,
  "b": 3
}
```

**Respuesta del Servidor (Response):**

- **Éxito (Código 2xx):** Si la ejecución del servicio es exitosa, el servidor responderá con un código de estado 2xx (por ejemplo, 200 OK) y el cuerpo de la respuesta contendrá los datos de salida del servicio, en formato JSON. La estructura de estos datos coincidirá con el contrato `output` definido para el servicio.

  **Ejemplo de Response Body para el servicio `sumar` (si la suma es 8):**

  ```json
  8
  ```

- **Error de Validación (Código 422 - Unprocessable Entity):** Si los datos de entrada proporcionados en el cuerpo de la petición no son válidos según el contrato `input` del servicio, el servidor responderá con un código de estado `422 Unprocessable Entity`. El cuerpo de la respuesta puede contener información adicional sobre los errores de validación, aunque esto no es estrictamente definido por el protocolo Actioman base y puede depender de la implementación del servidor.

Este protocolo simple y basado en HTTP permite a Actioman ofrecer una manera eficiente y type-safe de exponer y consumir funciones Javascript como servicios web.
