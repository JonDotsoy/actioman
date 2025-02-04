# 🏹 actioman

Actioman es una herramienta para crear y consumir servicios de manera sencilla y eficiente. Permite a los desarrolladores definir acciones (funciones o métodos) que pueden ser consumidas por clientes a través de una interfaz simple.

## Inicio rapido

Para comenzar a usar Actioman, sigue estos sencillos pasos:

### Desarrollador del servicio

1.  Crea un archivo llamado `acciones.js` en la carpeta de tu proyecto.
2.  Define tus acciones dentro de ese archivo.
3.  Crea un archivo de configuración llamado `actioman.config.js` para configurar las integraciones.
4.  Ejecuta `npx actioman serve acciones.js` para poner tu servicio en funcionamiento.

### Cliente

1.  Instala Actioman: `npm install actioman`
2.  Agrega un recurso: `npx actioman add <nombre> <url>`

## API

### Acciones del servidor

Crea un archivo con tus acciones.

```javascript
// acciones.js
import { z } from "zod";

export function saludar(nombre) {
  return `Hola, ${nombre}!`;
}

export const despedida = {
  input: z.string(),
  output: z.string(),
  handler: function (nombre) {
    return `Adiós, ${nombre}. ¡Vuelve pronto!`;
  },
};
```

### Archivo de configuración de integraciones (`actioman.config.js`)

La integracion auth permite proteger el servicio mediante una clave jwt.

```javascript
// actioman.config.js
import { auth } from "actioman/integrations/auth";

export default {
  integrations: [
    auth({
      type: "jwt",
      secret: "secret",
    }),
  ],
};
```

### Cliente (usando sintaxis ESM)

```javascript
// cliente.js
import actioman from "actioman";

async function consumirServicios() {
  const saludo = await actioman.actions.foo().saludar("Juan");
  console.log(saludo); // Hola, Juan!

  const despedida = await actioman.actions.foo().despedida("Juan");
  console.log(despedida); // Adiós, Juan. ¡Vuelve pronto!
}

consumirServicios();
```

## Inyección `auth`

La inyección `auth` es proporcionada por la librería `actioman` y permite validar las peticiones HTTP, permitiendo solo las peticiones con un header `Authorization` que tengan un token JWT válido.

## Contribución

¡Las contribuciones son bienvenidas! Si encuentras errores o tienes ideas para mejorar Actioman, por favor, abre un issue o envía un pull request.

## Licencia

MIT
