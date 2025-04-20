# Referencia de API: Uso avanzado de Actioman desde código

Esta sección describe cómo crear y controlar un servidor Actioman directamente desde código, permitiendo un control total sobre el ciclo de vida, la integración con middlewares personalizados y la extensión del comportamiento del servidor.

## Crear un servidor Actioman manualmente

Puedes iniciar un servidor Actioman desde tu propio código, lo que te permite:
- Iniciar y detener el servidor bajo demanda.
- Integrar lógica personalizada antes o después de cada acción.
- Integrar Actioman en aplicaciones más grandes o flujos personalizados.

### Ejemplo básico

```ts
import { HTTPLister } from "actioman/http-router";
import * as myModule from "./my-functions.ts";

const httpListener = await HTTPLister.fromModule(myModule);
// Aquí puedes agregar lógica personalizada antes de iniciar el servidor
await httpListener.listen();
// También puedes controlar el cierre del servidor o manejar eventos personalizados
```

Con este enfoque, tienes acceso directo al ciclo de vida del servidor y puedes extender su comportamiento según tus necesidades.

## Consumir los servicios desde cualquier cliente HTTP

Una vez levantado el servidor, puedes consumir los servicios usando cualquier herramienta o lenguaje que soporte HTTP, como curl, Postman, fetch, etc.

```bash
# Descubrir los servicios disponibles
curl http://localhost:30320/__actions

# Invocar una función (por ejemplo, "sumar")
curl -X POST http://localhost:30320/__actions/sumar \
  -H "Content-Type: application/json" \
  -d '{"a":5,"b":3}'
```

O desde Javascript usando fetch:

```js
const res = await fetch("http://localhost:30320/__actions/sumar", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ a: 5, b: 3 })
});
const result = await res.json();
console.log(result); // 8
```

Así puedes integrar Actioman en cualquier ecosistema, con control total sobre el servidor y sin depender del cliente oficial.
