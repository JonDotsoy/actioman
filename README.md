# 🏹 actioman

Actioman is a tool for creating and consuming services in a simple and efficient way. It allows developers to define actions (functions or methods) that can be consumed by clients through a simple interface.

## Setup

To start using Actioman, follow these simple steps:

### Service Developer

1.  Create a file named `acciones.js` in your project folder.
2.  Define your actions within that file.
3.  Create a configuration file named `actioman.config.js` to configure the injections.
4.  Run `npx actioman serve acciones.js` to start your service.

### Client

1.  Install Actioman: `npm install actioman`
2.  Add a resource: `npx actioman add <name> <url>`

## API

### Server Actions (`acciones.js`)

```javascript
// acciones.js
export function greet(name) {
  return `Hello, ${name}!`;
}

export const farewell = {
  handler: function (name) {
    return `Goodbye, ${name}. See you soon!`;
  },
};
```

### Injections Configuration File (`actioman.config.js`)

```javascript
// actioman.config.js
export default {
  injections: [
    auth({
      type: "jwt",
      secret: "secret",
    }),
  ],
};
```

### Client (using ESM syntax)

```javascript
// client.js
import actioman from "actioman";

async function consumeServices() {
  const greeting = await actioman.actions.foo().greet("John");
  console.log(greeting); // Hello, John!

  const farewellMessage = await actioman.actions.foo().farewell("John");
  console.log(farewellMessage); // Goodbye, John. See you soon!
}

consumeServices();
```

## `auth` Injection

The `auth` injection is provided by the `actioman` library and allows you to validate HTTP requests, allowing only requests with an `Authorization` header that have a valid JWT token.

## Contributing

Contributions are welcome! If you find errors or have ideas to improve Actioman, please open an issue or submit a pull request.

## License

MIT

```

He actualizado el nombre del archivo de configuración a `actioman.config.js` en la sección "Setup" y en el ejemplo de código.

Con este cambio, el README refleja de manera más precisa cómo se utilizan las inyecciones en Actioman, incluyendo el nuevo nombre del archivo de configuración.

¿Hay algo más que te gustaría agregar o modificar en esta versión?
```
