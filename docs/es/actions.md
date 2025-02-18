## 📜 Archivo de Acciones: Definiendo tus Servicios Actioman

El archivo de acciones es el corazón de tu servicio Actioman. Por convención, a menudo se nombra `actions.js`, pero **puedes elegir el nombre de archivo que prefieras**. Este archivo Javascript contiene todas las **acciones** o **servicios** que quieres exponer a través de tu API. Actioman escanea este archivo y automáticamente convierte cada función exportada en un endpoint web accesible.

### ¿Qué son las Acciones?

En el contexto de Actioman, una **acción** es simplemente una función Javascript que exportas desde tu archivo de acciones (por ejemplo, `actions.js`). Cada acción representa una funcionalidad específica que deseas poner a disposición de tus clientes (aplicaciones web, móviles, otros servicios, etc.).

### Definiendo Acciones Básicas

La forma más sencilla de definir una acción es exportando una función Javascript estándar.

**Ejemplo: Archivo de acciones (ejemplo: `actions.js`) con acciones básicas**

```js
// actions.js (o el nombre de archivo que elijas)
export const hello = () => "hello world";
export const now = () => Date.now();
```

En este ejemplo, hemos definido dos acciones:

- `hello`: Una función que retorna la cadena de texto "hello world".
- `now`: Una función que retorna el timestamp actual usando `Date.now()`.

Cuando ejecutas `npx actioman <nombre-de-tu-archivo-de-acciones>.js` (por ejemplo, `npx actioman actions.js` o `npx actioman mis_servicios.js`), Actioman detecta estas funciones exportadas y crea endpoints para ellas. En este caso, se crearían endpoints POST para `/actions/hello` y `/actions/now`.

### Definiendo Acciones con Contratos (Recomendado)

Para asegurar la type-safety y una mejor experiencia de desarrollo, Actioman te permite definir **contratos** para tus acciones utilizando la librería [Zod](https://zod.dev/). Los contratos especifican la forma y el tipo de datos esperados como entrada (input) y salida (output) de cada acción.

Actioman proporciona la función `defineAction` para facilitar la creación de acciones con contratos.

**Ejemplo: Archivo de acciones (ejemplo: `actions.js`) con acciones y contratos Zod**

```js
// actions.js (o como hayas nombrado tu archivo)
import { defineAction } from "actioman";
import { z } from "zod";

export const hello = defineAction({
  input: z.object({ name: z.string() }), // Contrato para el input: espera un objeto con una propiedad 'name' de tipo string
  output: z.string(), // Contrato para el output: retorna una cadena de texto
  handler: ({ name }) => `hello ${name}!`, // Función handler que implementa la lógica de la acción
});
```

**Desglose del ejemplo con `defineAction`:**

- **`import { defineAction } from "actioman";`**: Importamos la función `defineAction` desde la librería `actioman`.
- **`import { z } from "zod";`**: Importamos la librería Zod para definir esquemas de validación.
- **`defineAction({ ... })`**: Utilizamos `defineAction` para definir la acción `hello`.
  - **`input: z.object({ name: z.string() })`**: Define el contrato para los datos de entrada. En este caso, espera un objeto Javascript con una propiedad llamada `name` que debe ser de tipo `string` según Zod.
  - **`output: z.string()`**: Define el contrato para el valor de retorno de la acción. Aquí, se espera que la función retorne un valor de tipo `string`.
  - **`handler: ({name}) => "hello " + name + "!"`**: Esta es la función **handler** que contiene la lógica de tu acción. Recibe como argumento un objeto que coincide con la estructura definida en el contrato `input`. En este caso, recibe un objeto con la propiedad `name`. La función handler debe retornar un valor que coincida con el contrato `output`.

### Beneficios de Usar Contratos Zod

Definir contratos con Zod en tu archivo de acciones ofrece varias ventajas importantes, especialmente para los clientes que consumen tu servicio Actioman:

- **Type-Safety para Clientes:** Al usar el comando `actioman add` para agregar tu servicio a un proyecto cliente, Actioman utiliza los contratos Zod definidos para generar automáticamente definiciones de tipos (TypeScript o JSDoc) para tus acciones. Esto permite a los desarrolladores clientes tener **autocompletado**, **validación de tipos en tiempo de desarrollo** y **detección temprana de errores** al usar tus servicios.
- **Validación de Datos en el Servidor:** Actioman utiliza los contratos Zod en el servidor para **validar los datos de entrada** que recibe en las peticiones a tus acciones. Si los datos no cumplen con el contrato definido, Actioman rechazará la petición con un error, garantizando la integridad de tu servicio.
- **Documentación Implícita:** Los contratos Zod sirven como una forma de **documentación implícita** para tus acciones. Un cliente puede inspeccionar los contratos para entender qué datos necesita enviar a una acción y qué tipo de dato recibirá como respuesta, sin necesidad de consultar documentación externa.
