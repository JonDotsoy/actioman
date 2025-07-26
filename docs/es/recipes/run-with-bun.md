## 🚀 Receta: Usando Actioman con Bun.sh (con TypeScript y Zod!)

Esta receta te guía sobre cómo utilizar **actioman** con **Bun.sh**, tanto para desplegar tu servicio backend como para consumirlo desde un cliente Javascript/TypeScript que use Bun.sh. Bun es un entorno de ejecución Javascript rápido y todo-en-uno, que puede reemplazar a Node.js y npm, **y que tiene soporte de primera clase para TypeScript, además de integrarse perfectamente con Zod para la validación de datos.**

### Backend (Servidor con Bun, TypeScript y Zod)

Sigue estos pasos para configurar y ejecutar tu servidor actioman utilizando Bun, TypeScript y Zod para definir contratos robustos.

1. **Inicializa un proyecto Bun (si no tienes uno):**

   Si aún no tienes un proyecto Bun para tu backend, crea uno:

   ```bash
   bun init -y
   ```

2. **Instala `actioman` y `zod` en el backend:**

   Debemos instalar `actioman` y `zod` como dependencias del proyecto backend. **Zod es esencial para definir los contratos de tus servicios:**

   ```bash
   bun add actioman zod
   ```

3. **Crea un archivo `actions.ts` y define tus acciones con Zod:**

   Crea o edita el archivo `actions.ts` en tu proyecto. Ahora definiremos las funciones que quieres exponer como servicios **utilizando `defineAction` de `actioman` y Zod para la validación de las entradas.**

   ```typescript
   // ./actions.ts
   import { defineAction } from "actioman";
   import { z } from "zod";

   export const hello = (): string => "hello world!";

   export const suma = defineAction({
     input: z.object({ a: z.number(), b: z.number() }),
     handler: ({ a, b }): number => a + b,
   });
   ```

   **Observa los cambios importantes:**
   - **Importaciones:** Hemos importado `defineAction` desde `actioman` y `z` desde `zod`.
   - **`defineAction`:** Ambas funciones (`hello` y `suma`) ahora se definen usando `defineAction`.
   - **`input` y `z.object`:** La función `suma` ahora tiene una propiedad `input` que define un esquema de validación con `z.object`. Esto asegura que la función `suma` solo se ejecute si recibe un objeto con propiedades `a` y `b`, ambas de tipo número. `hello` no requiere input, por lo que se omite la propiedad `input`.
   - **`handler`:** La lógica de las funciones ahora está dentro de la propiedad `handler`. En `suma`, el `handler` recibe un objeto destructurado `{ a, b }` que ya ha sido validado por Zod.

4. **Levanta el servidor actioman con Bun:**

   Abre tu terminal en la raíz de tu proyecto y utiliza `bunx` para ejecutar `actioman`, **utilizando el comando `serve` explícitamente**:

   ```bash
   bunx actioman serve actions.ts
   ```

   Al ejecutar este comando con Bun, verás un mensaje en la consola similar a este (ahora reflejando el uso de `defineAction`):

   ```
   Route GET /__actions
   Route POST /__actions/hello
   Route POST /__actions/suma
   Listening on http://localhost:30321/
   ```

   Ahora los contratos de tus servicios expuestos en `/__actions` incluirán la definición del esquema de entrada de Zod para `suma`, proporcionando type-safety y validación tanto en el backend como en el cliente.

   ¡Excelente! Has desplegado tu servicio actioman utilizando Bun.sh como backend, TypeScript para el tipado, **y Zod para la definición y validación de contratos robustos.**

### Frontend (Cliente con Bun y TypeScript)

El frontend permanece prácticamente igual, ya que la principal mejora se centra en la definición del backend con Zod. Sin embargo, es bueno saber que **el cliente `actioman` se beneficia automáticamente de los contratos definidos con Zod en el backend, proporcionando type-safety en las llamadas a los servicios.**

1. **Inicializa un proyecto Bun con TypeScript (si no tienes uno):**

   Si aún no tienes un proyecto Bun, puedes crear uno fácilmente ejecutando:

   ```bash
   bun init -y
   ```

   Esto creará un `package.json` y un punto de entrada `index.ts`.

2. **Instala la dependencia `actioman` con Bun:**

   En tu proyecto cliente Bun, utiliza `bun add` para instalar la librería `actioman`:

   ```bash
   bun add actioman
   ```

3. **Agrega el servicio Actioman a tu proyecto Bun:**

   Utiliza el comando `actioman add` para registrar tu servicio actioman. Reemplaza `miserviciobun` con el nombre que desees para tu servicio localmente, y `http://localhost:30321/` con la URL de tu servidor actioman.

   ```bash
   bunx actioman add miserviciobun http://localhost:30321/
   ```

4. **Utiliza los servicios en tu código Bun (TypeScript):**

   Abre `index.ts` y utiliza los servicios. El código cliente se mantiene similar, pero ahora **te beneficias de la type-safety proporcionada por los contratos de Zod definidos en el backend.**

   ```typescript
   // index.ts
   import { actions } from "actioman";

   const miserviciobun = actions.miserviciobun();

   async function main() {
     const mensajeHello = await miserviciobun.hello(null);
     console.log("Respuesta de hello:", mensajeHello);

     // Ahora 'suma' espera un objeto { a: number, b: number }
     const resultadoSuma = await miserviciobun.suma({ a: 5, b: 3 });
     console.log("Resultado de suma:", resultadoSuma);

     // Intentar llamar a suma con argumentos incorrectos (ejemplo para ver type-safety)
     // Esto generará un error de TypeScript (y también una validación en runtime en el servidor)
     // const sumaIncorrecta = await miserviciobun.suma(5, "tres"); // Descomentar para ver el error de TypeScript
   }

   main();
   ```

   Para ejecutar tu cliente, usa:

   ```bash
   bun run index.ts
   ```
